import type { Request, Response } from 'express';
import { z } from 'zod';
import { importantDateSchema } from '../validators/importantDateValidator.js';
import { createImportantDateMetadata, listImportantDates } from '../services/importantDateService.js';

export const listImportantDatesController = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    const dates = await listImportantDates(familyId);
    return res.status(200).json({ success: true, data: dates });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const createImportantDate = async (req: Request, res: Response) => {
  try {
    const payload = importantDateSchema.parse(req.body);
    const importantDate = await createImportantDateMetadata(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: importantDate });
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
