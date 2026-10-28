import Notification from '../models/notificationModel.js';

export const listNotifications = async (req, res) => {
  const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ items, unread: await Notification.countDocuments({ user: req.user.id, read: false }) });
};

export const markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ ok: true });
};
