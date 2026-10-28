import { Router } from 'express';
import { registerUser, registerAdmin, loginUser, loginAdmin } from '../controllers/authController.js';

const router = Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);
export default router;
