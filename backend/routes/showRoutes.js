import { Router } from 'express';
import { fetchUser, adminOnly } from '../middlewares/fetchUser.js';
import { showsForMovie, getShow, listShows, createShow, deleteShow } from '../controllers/showController.js';

const router = Router();
router.get('/movie/:movieId', showsForMovie);
router.get('/', fetchUser, adminOnly, listShows);
router.get('/:id', getShow);
router.post('/', fetchUser, adminOnly, createShow);
router.delete('/:id', fetchUser, adminOnly, deleteShow);
export default router;
