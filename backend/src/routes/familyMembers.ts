import { Router } from 'express';
import {
  createMember,
  deleteMember,
  getMemberById,
  getMembers,
  updateMember,
} from '../controllers/familyMemberController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', getMembers);
router.post('/', requireAdmin, createMember);
router.get('/:id', getMemberById);
router.put('/:id', requireAdmin, updateMember);
router.delete('/:id', requireAdmin, deleteMember);

export default router;
