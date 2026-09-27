import { Router } from 'express';
import { createMarriageRecord, createParentChild, listParentChild } from '../controllers/relationshipController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listParentChild);
router.post('/parent-child', requireAdmin, createParentChild);
router.post('/marriages', requireAdmin, createMarriageRecord);

export default router;
