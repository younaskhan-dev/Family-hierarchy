import { Router } from 'express';
import { createImportantDate, listImportantDatesController } from '../controllers/importantDateController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listImportantDatesController);
router.post('/', requireAdmin, createImportantDate);

export default router;
