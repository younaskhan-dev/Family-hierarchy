import { Router } from 'express';
import { createAudit, listAudit } from '../controllers/auditController.js';
import { requireFamilyAccess } from '../middleware/requireFamilyAccess.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', requireFamilyAccess, listAudit);
router.post('/', requireFamilyAccess, requireAdmin, createAudit);

export default router;
