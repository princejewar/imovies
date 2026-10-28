import { Router } from 'express';
import { fetchUser, userOnly } from '../middlewares/fetchUser.js';
import { createBooking, myBookings, getBooking, downloadTicket, cancelBooking, rescheduleBooking, validatePromo } from '../controllers/bookingController.js';

const router = Router();
router.use(fetchUser, userOnly);
router.post('/', createBooking);
router.post('/promo', validatePromo);
router.get('/mine', myBookings);
router.get('/:id', getBooking);
router.get('/:id/ticket', downloadTicket);
router.post('/:id/reschedule', rescheduleBooking);
router.delete('/:id', cancelBooking);
export default router;
