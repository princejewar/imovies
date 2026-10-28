import { Router } from 'express';
import { fetchUser, adminOnly } from '../middlewares/fetchUser.js';
import { listMovies, filterOptions, getMovie, createMovie, updateMovie, deleteMovie } from '../controllers/movieController.js';

const router = Router();
router.get('/', listMovies);
router.get('/filters', filterOptions);
router.get('/:id', getMovie);
router.post('/', fetchUser, adminOnly, createMovie);
router.put('/:id', fetchUser, adminOnly, updateMovie);
router.delete('/:id', fetchUser, adminOnly, deleteMovie);
export default router;
