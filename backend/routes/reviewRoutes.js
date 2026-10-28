import { Router } from 'express';
import { fetchUser, userOnly } from '../middlewares/fetchUser.js';
import { listReviews, saveReview, deleteReview } from '../controllers/reviewController.js';

const router = Router();
router.get('/movie/:movieId', listReviews);
router.post('/movie/:movieId', fetchUser, userOnly, saveReview);
router.delete('/:id', fetchUser, deleteReview);
export default router;
