// src/routes/memberRoutes.ts
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { cacheMembersList } from '../middleware/cache.js';
import {
  getMembers,
  createMember,
  getMemberById,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['admin','user']), asyncHandler(createMember));
router.get('/', authorize(['admin','user']), cacheMembersList, asyncHandler(getMembers));
router.get('/:id', authorize(['admin','user']), asyncHandler(getMemberById));
router.put('/:id', authorize(['admin']), asyncHandler(updateMember));
router.delete('/:id', authorize(['admin']), asyncHandler(deleteMember));

export default router;
