import nodemailer from 'nodemailer';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// Email is sent only when SMTP_* values are set in .env. Alerts are always saved in the app.
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function notify(userId, title, message) {
  try {
    await Notification.create({ user: userId, title, message });
    if (!transporter) return console.log(`[notification] ${title}`);
    const user = await User.findById(userId).select('email');
    await transporter.sendMail({ from: process.env.MAIL_FROM, to: user.email, subject: title, text: message });
  } catch (e) {
    console.error('Notification failed:', e.message);
  }
}

export async function notifyAll(title, message) {
  const users = await User.find().select('_id');
  if (users.length) await Notification.insertMany(users.map((u) => ({ user: u._id, title, message })));
}
