import dayjs from 'dayjs';
import User from '../models/userModel.js';
import Movie from '../models/movieModel.js';
import Show from '../models/showModel.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import Promo from '../models/promoModel.js';
import Review from '../models/reviewModel.js';
import Favorite from '../models/favoriteModel.js';
import Notification from '../models/notificationModel.js';

export const stats = async (_req, res) => {
  const revenueByMovie = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$movie', revenue: { $sum: '$total' }, tickets: { $sum: { $size: '$seats' } } } },
    { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
    { $unwind: '$movie' },
    { $project: { _id: 0, title: '$movie.title', revenue: 1, tickets: 1 } },
    { $sort: { revenue: -1 } },
  ]);
  const since = dayjs().subtract(6, 'day').startOf('day').toDate();
  const perDay = await Booking.aggregate([
    { $match: { status: 'confirmed', createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' } } },
  ]);
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const d = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
    return { date: d, revenue: perDay.find((p) => p._id === d)?.revenue || 0 };
  });
  const [users, movies, shows, bookings, cancelled, reviews] = await Promise.all([
    User.countDocuments(), Movie.countDocuments(), Show.countDocuments(),
    Booking.countDocuments({ status: 'confirmed' }), Booking.countDocuments({ status: 'cancelled' }), Review.countDocuments(),
  ]);
  res.json({
    users, movies, shows, bookings, cancelled, reviews,
    revenue: revenueByMovie.reduce((s, r) => s + r.revenue, 0),
    tickets: revenueByMovie.reduce((s, r) => s + r.tickets, 0),
    revenueByMovie, revenueByDay,
  });
};

export const listBookings = async (_req, res) => {
  res.json(await Booking.find().sort({ createdAt: -1 }).limit(200)
    .populate('user', 'username email').populate('movie', 'title').populate('theatre', 'name')
    .populate('show', 'showDate showTime').populate('payment', 'method status transactionId'));
};

export const listPayments = async (_req, res) => {
  res.json(await Payment.find().sort({ createdAt: -1 }).limit(100).populate('user', 'username email'));
};

export const listUsers = async (_req, res) => res.json(await User.find().select('-password').sort({ createdAt: -1 }));

export const deleteUser = async (req, res) => {
  if (await Booking.exists({ user: req.params.id, status: 'confirmed' }))
    return res.status(400).json({ message: 'This user has active bookings. Cancel them first.' });
  await Promise.all([User.findByIdAndDelete(req.params.id), Favorite.deleteMany({ user: req.params.id }), Notification.deleteMany({ user: req.params.id })]);
  res.json({ ok: true });
};

// ---- Promo codes ----
export const listPromos = async (_req, res) => res.json(await Promo.find().sort({ createdAt: -1 }));

export const createPromo = async (req, res) => {
  try {
    const { code, type, value, minAmount, maxDiscount, expiresAt } = req.body;
    if (!code?.trim() || !['percent', 'flat'].includes(type) || !(+value > 0)) return res.status(400).json({ message: 'Enter a code, a discount type and a value.' });
    if (type === 'percent' && +value > 100) return res.status(400).json({ message: 'A percentage discount can\'t be more than 100.' });
    res.status(201).json(await Promo.create({
      code, type, value: +value, minAmount: +minAmount || 0, maxDiscount: +maxDiscount || undefined, expiresAt: expiresAt || undefined,
    }));
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'That promo code already exists.' });
    res.status(500).json({ message: e.message });
  }
};

export const togglePromo = async (req, res) => {
  const promo = await Promo.findById(req.params.id);
  if (!promo) return res.status(404).json({ message: 'Promo code not found.' });
  promo.active = !promo.active;
  await promo.save();
  res.json(promo);
};

export const deletePromo = async (req, res) => {
  await Promo.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};
