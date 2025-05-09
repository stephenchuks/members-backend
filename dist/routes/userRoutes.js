// src/routes/userRoutes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getAllUsers } from '../controllers/userController.js';
const router = Router();
// GET /api/users/  ← only admin
router.get('/', authenticate, authorize(['admin']), getAllUsers);
export default router;
