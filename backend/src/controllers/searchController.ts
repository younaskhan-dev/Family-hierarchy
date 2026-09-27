import type { Request, Response } from 'express';
import { searchFamilyData } from '../services/searchService.js';

export const searchFamily = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    const query = typeof req.query.q === 'string' ? req.query.q : undefined;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'familyId is required' });
    }

    const results = await searchFamilyData(familyId, query);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    return res.status(500).json({ success: false, message });
  }
};
