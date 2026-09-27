import { Router } from 'express';
import { createEvent, listEventsController } from '../controllers/eventController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listEventsController);
router.post('/', requireAdmin, createEvent);

export default router;
