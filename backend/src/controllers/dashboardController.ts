import type { Request, Response } from 'express';
import { getFamilyDashboard } from '../services/dashboardService.js';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;

    if (!familyId) {
      return res.status(400).json({ success: false, message: 'familyId is required' });
    }

    const dashboard = await getFamilyDashboard(familyId);
    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }
    return res.status(500).json({ success: false, message });
  }
};
