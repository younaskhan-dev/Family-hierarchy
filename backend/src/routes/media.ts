import { Router } from 'express';
import { createDocument, createPhoto, listMediaDocuments, listMediaPhotos } from '../controllers/mediaController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/photos', listMediaPhotos);
router.post('/photos', requireAdmin, createPhoto);
router.get('/documents', listMediaDocuments);
router.post('/documents', requireAdmin, createDocument);

export default router;
