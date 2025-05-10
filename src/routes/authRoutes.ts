// src/routes/authRoutes.ts
import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected
router.post('/logout', authenticate, logout);

export default router;
