import { Router } from 'express';
import { fetchUser, userOnly } from '../middlewares/fetchUser.js';
import { listFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';

const router = Router();
router.use(fetchUser, userOnly);
router.get('/', listFavorites);
router.post('/:movieId', addFavorite);
router.delete('/:movieId', removeFavorite);
export default router;
