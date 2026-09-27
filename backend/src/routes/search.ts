import { Router } from 'express';
import { searchFamily } from '../controllers/searchController.js';

const router = Router();

router.get('/', searchFamily);

export default router;
