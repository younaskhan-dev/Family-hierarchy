import type { Request, Response } from 'express';
import { z } from 'zod';
import { documentMetadataSchema, photoMetadataSchema } from '../validators/mediaValidator.js';
import { createDocumentMetadata, createPhotoMetadata, listDocuments, listPhotos } from '../services/mediaService.js';

export const listMediaPhotos = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    const photos = await listPhotos(familyId);
    return res.status(200).json({ success: true, data: photos });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const listMediaDocuments = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    const documents = await listDocuments(familyId);
    return res.status(200).json({ success: true, data: documents });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const createPhoto = async (req: Request, res: Response) => {
  try {
    const payload = photoMetadataSchema.parse(req.body);
    const photo = await createPhotoMetadata(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: photo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    if (message === 'MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Member not found in family' });
    }
    return res.status(500).json({ success: false, message });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const payload = documentMetadataSchema.parse(req.body);
    const document = await createDocumentMetadata(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    if (message === 'MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Member not found in family' });
    }
    return res.status(500).json({ success: false, message });
  }
};
