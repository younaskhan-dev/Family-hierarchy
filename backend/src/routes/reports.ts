import { Router } from 'express';
import { getFamilySummary } from '../controllers/reportController.js';

const router = Router();

router.get('/family-summary', getFamilySummary);

export default router;
