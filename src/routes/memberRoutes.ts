// src/routes/memberRoutes.ts
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createMember,
  listMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from '../controllers/memberController.js';

const router = Router();

router.use(authenticate);

router.post('/', authorize(['admin', 'superadmin']), asyncHandler(createMember));
router.get('/', authorize(['admin']), asyncHandler(listMembers));
router.get('/:id', authorize(['admin']), asyncHandler(getMemberById));
router.put('/:id', authorize(['admin']), asyncHandler(updateMember));
router.delete('/:id', authorize(['admin']), asyncHandler(deleteMember));

router.get(
  '/me',
  authorize(['user', 'admin', 'superadmin']),
  asyncHandler(async (req, res, next) => {
    try {
      const meId = (req as any).user.userId;
      const Member = (await import('../models/Member.js')).default;
      const m = await Member.findById(meId).exec();
      
      if (!m) {
        res.status(404).json({ message: 'Not Found' });
        return;
      }
      
      res.json(m);
    } catch (err) {
      next(err);
    }
  })
);

export default router;