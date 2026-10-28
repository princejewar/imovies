import { Router } from 'express';
import { fetchUser, adminOnly } from '../middlewares/fetchUser.js';
import { stats, listBookings, listPayments, listUsers, deleteUser, listPromos, createPromo, togglePromo, deletePromo } from '../controllers/adminController.js';

const router = Router();
router.use(fetchUser, adminOnly);
router.get('/stats', stats);
router.get('/bookings', listBookings);
router.get('/payments', listPayments);
router.get('/users', listUsers);
router.delete('/users/:id', deleteUser);
router.get('/promos', listPromos);
router.post('/promos', createPromo);
router.patch('/promos/:id', togglePromo);
router.delete('/promos/:id', deletePromo);
export default router;
