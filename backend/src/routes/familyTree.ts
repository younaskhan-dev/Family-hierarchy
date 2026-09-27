import { Router } from 'express';
import { getFamilyTree } from '../controllers/familyTreeController.js';

const router = Router();

router.get('/:id', getFamilyTree);

export default router;
