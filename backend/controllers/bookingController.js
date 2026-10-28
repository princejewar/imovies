import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import Show from '../models/showModel.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import { seatInfo, totalSeats } from '../utils/seatLayout.js';
import { applyPromo } from '../utils/promo.js';
import { processPayment } from '../utils/payment.js';
import { broadcastSeats } from '../utils/realtime.js';
import { notify } from '../utils/notify.js';
import { qrDataUrl, streamTicket } from '../utils/tickets.js';

const MAX_SEATS = 8;
const METHODS = ['upi', 'card', 'netbanking', 'wallet'];
const CUTOFF_MS = 2 * 60 * 60 * 1000; // no cancel / reschedule within 2 hours of the show

const populateAll = (q) => q
  .populate('movie', 'title poster hue')
  .populate('theatre', 'name location')
  .populate('show', 'showDate showTime startsAt')
  .populate('payment', 'method transactionId status amount refundedAmount');

const cleanSeats = (seats) => {
  if (!Array.isArray(seats) || !seats.length || seats.length > MAX_SEATS) return null;
  const nums = seats.map(Number);
  return nums.every(Number.isInteger) && new Set(nums).size === nums.length ? nums : null;
};

const release = async (io, showId, seats) => {
  const show = await Show.findByIdAndUpdate(showId, { $pull: { bookedSeats: { $in: seats } } }, { new: true });
  if (show) broadcastSeats(io, show);
};

// Reserves seats atomically: if any requested seat is taken, nothing is written.
const reserve = (showId, seats) =>
  Show.findOneAndUpdate({ _id: showId, bookedSeats: { $nin: seats } }, { $push: { bookedSeats: { $each: seats } } }, { new: true });

export const createBooking = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { showId, seats, paymentMethod, promoCode } = req.body;
    if (!METHODS.includes(paymentMethod)) return res.status(400).json({ message: 'Choose a payment method.' });
    const nums = cleanSeats(seats);
    if (!nums) return res.status(400).json({ message: `Choose between 1 and ${MAX_SEATS} different seats.` });

    const show = await Show.findById(showId).populate('theatre');
    if (!show) return res.status(404).json({ message: 'Show not found.' });
    if (show.startsAt <= new Date()) return res.status(400).json({ message: 'This show has already started.' });
    const items = nums.map((n) => seatInfo(show.theatre, n));
    if (items.some((i) => !i)) return res.status(400).json({ message: 'Invalid seat selection.' });

    const subtotal = items.reduce((s, i) => s + i.price, 0);
    let discount = 0, code;
    if (promoCode) {
      const r = await applyPromo(promoCode, subtotal);
      if (r.error) return res.status(400).json({ message: r.error });
      discount = r.discount; code = r.promo.code;
    }
    const total = subtotal - discount;

    const reserved = await reserve(showId, nums);
    if (!reserved) return res.status(409).json({ message: 'Someone just booked one of those seats. You were not charged. Please pick again.' });

    const pay = await processPayment({ amount: total, method: paymentMethod });
    if (!pay.ok) {
      await release(io, showId, nums);
      return res.status(402).json({ message: pay.message });
    }

    const booking = await Booking.create({
      user: req.user.id, show: show._id, movie: show.movie, theatre: show.theatre._id,
      seats: items, subtotal, discount, promoCode: code, total, ticketCode: randomUUID(),
    });
    const payment = await Payment.create({ booking: booking._id, user: req.user.id, amount: total, method: paymentMethod, transactionId: pay.transactionId });
    booking.payment = payment._id;
    await booking.save();

    broadcastSeats(io, reserved, nums);
    notify(req.user.id, 'Booking confirmed',
      `Your tickets are confirmed. Seats ${nums.join(', ')} at ${show.theatre.name}, ${dayjs(show.startsAt).format('D MMM, h:mm A')}. Paid ₹${total} via ${paymentMethod.toUpperCase()} (receipt ${payment.transactionId}). Your QR e-ticket is in My Bookings.`);
    res.status(201).json({ _id: booking._id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const myBookings = async (req, res) => {
  res.json(await populateAll(Booking.find({ user: req.user.id }).sort({ createdAt: -1 })));
};

export const getBooking = async (req, res) => {
  try {
    const booking = await populateAll(Booking.findOne({ _id: req.params.id, user: req.user.id }));
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ ...booking.toObject(), qr: await qrDataUrl(booking) });
  } catch {
    res.status(404).json({ message: 'Booking not found.' });
  }
};

export const downloadTicket = async (req, res) => {
  try {
    const booking = await populateAll(Booking.findOne({ _id: req.params.id, user: req.user.id }));
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    await streamTicket(booking, res);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id }).populate('show', 'startsAt');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status !== 'confirmed') return res.status(400).json({ message: 'This booking is no longer active.' });
    if (booking.show.startsAt - Date.now() < CUTOFF_MS) return res.status(400).json({ message: 'Bookings can only be cancelled up to 2 hours before the show.' });
    await release(req.app.get('io'), booking.show._id, booking.seats.map((s) => s.number));
    booking.status = 'cancelled';
    await booking.save();
    await Payment.findByIdAndUpdate(booking.payment, { status: 'refunded', refundedAmount: booking.total });
    notify(req.user.id, 'Booking cancelled', `Your booking was cancelled and ₹${booking.total} will be refunded to your original payment method.`);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Move a booking to another show of the same movie. Pays the difference, or refunds it.
export const rescheduleBooking = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { showId, seats, paymentMethod } = req.body;
    const old = await Booking.findOne({ _id: req.params.id, user: req.user.id, status: 'confirmed' }).populate('show', 'startsAt').populate('payment');
    if (!old) return res.status(404).json({ message: 'Booking not found.' });
    if (old.show.startsAt - Date.now() < CUTOFF_MS) return res.status(400).json({ message: 'Bookings can only be rescheduled up to 2 hours before the show.' });
    const nums = cleanSeats(seats);
    if (!nums) return res.status(400).json({ message: `Choose between 1 and ${MAX_SEATS} different seats.` });

    const show = await Show.findById(showId).populate('theatre');
    if (!show || String(show.movie) !== String(old.movie)) return res.status(400).json({ message: 'Pick another show of the same movie.' });
    if (String(show._id) === String(old.show._id)) return res.status(400).json({ message: 'Pick a different show.' });
    if (show.startsAt <= new Date()) return res.status(400).json({ message: 'This show has already started.' });
    const items = nums.map((n) => seatInfo(show.theatre, n));
    if (items.some((i) => !i)) return res.status(400).json({ message: 'Invalid seat selection.' });

    const total = items.reduce((s, i) => s + i.price, 0);
    const diff = total - old.total;
    const method = METHODS.includes(paymentMethod) ? paymentMethod : old.payment.method;

    const reserved = await reserve(showId, nums);
    if (!reserved) return res.status(409).json({ message: 'Someone just booked one of those seats. Nothing was changed. Please pick again.' });

    const pay = await processPayment({ amount: Math.max(diff, 0), method });
    if (!pay.ok) {
      await release(io, showId, nums);
      return res.status(402).json({ message: pay.message });
    }

    const booking = await Booking.create({
      user: req.user.id, show: show._id, movie: show.movie, theatre: show.theatre._id,
      seats: items, subtotal: total, total, ticketCode: randomUUID(), rescheduledFrom: old._id,
    });
    const payment = await Payment.create({
      booking: booking._id, user: req.user.id, amount: Math.max(diff, 0), refundedAmount: Math.max(-diff, 0), method, transactionId: pay.transactionId,
    });
    booking.payment = payment._id;
    await booking.save();

    await release(io, old.show._id, old.seats.map((s) => s.number));
    old.status = 'rescheduled';
    await old.save();
    await Payment.findByIdAndUpdate(old.payment._id, { status: 'transferred' });
    broadcastSeats(io, reserved, nums);

    notify(req.user.id, 'Booking rescheduled',
      `Your booking moved to ${dayjs(show.startsAt).format('D MMM, h:mm A')} (seats ${nums.join(', ')}). ${diff > 0 ? `You paid ₹${diff} extra.` : diff < 0 ? `₹${-diff} will be refunded.` : 'No price difference.'}`);
    res.status(201).json({ _id: booking._id });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const validatePromo = async (req, res) => {
  const { code, amount } = req.body;
  const r = await applyPromo(code, Number(amount) || 0);
  if (r.error) return res.status(400).json({ message: r.error });
  res.json({ code: r.promo.code, discount: r.discount });
};
