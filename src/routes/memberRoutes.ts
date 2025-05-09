// src/routes/memberRoutes.ts
import { Router } from 'express';
import {
  createMember,
  getMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Create
router.post('/', authorize(['admin', 'user']), createMember);

// List
router.get('/', authorize(['admin', 'user']), getMembers);

// Read one
router.get('/:id', authorize(['admin', 'user']), getMemberById);

// Update
router.put('/:id', authorize(['admin']), updateMember);

// Delete
router.delete('/:id', authorize(['admin']), deleteMember);

export default router;
