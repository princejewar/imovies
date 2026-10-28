import { Router } from 'express';
import { fetchUser, userOnly } from '../middlewares/fetchUser.js';
import { listNotifications, markAllRead } from '../controllers/notificationController.js';

const router = Router();
router.use(fetchUser, userOnly);
router.get('/', listNotifications);
router.patch('/read-all', markAllRead);
export default router;
