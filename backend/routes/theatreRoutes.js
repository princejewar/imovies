import { Router } from 'express';
import { fetchUser, adminOnly } from '../middlewares/fetchUser.js';
import { listTheatres, createTheatre, deleteTheatre } from '../controllers/theatreController.js';

const router = Router();
router.use(fetchUser, adminOnly);
router.get('/', listTheatres);
router.post('/', createTheatre);
router.delete('/:id', deleteTheatre);
export default router;
