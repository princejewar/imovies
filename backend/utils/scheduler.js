import cron from 'node-cron';
import dayjs from 'dayjs';
import Booking from '../models/bookingModel.js';
import { notify } from './notify.js';

// Every 10 minutes: remind customers about shows starting within the next 2 hours.
export function startScheduler() {
  cron.schedule('*/10 * * * *', async () => {
    try {
      const soon = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const bookings = await Booking.find({ status: 'confirmed', reminded: false })
        .populate('show', 'startsAt showTime')
        .populate('movie', 'title')
        .populate('theatre', 'name');
      for (const b of bookings) {
        if (b.show.startsAt > new Date() && b.show.startsAt <= soon) {
          await notify(b.user, 'Show reminder', `${b.movie.title} starts at ${b.show.showTime} (${dayjs(b.show.startsAt).format('D MMM')}) at ${b.theatre.name}. Show your QR e-ticket at the entrance.`);
          b.reminded = true;
          await b.save();
        }
      }
    } catch (e) {
      console.error('Reminder job failed:', e.message);
    }
  });
}
