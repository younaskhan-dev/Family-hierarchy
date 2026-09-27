import type { NextFunction, Request, Response } from 'express';
import { hasFamilyAccess } from '../services/familyAccessService.js';

export const requireFamilyAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const familyId =
      (typeof req.query.familyId === 'string' ? req.query.familyId : undefined) ??
      (typeof req.params.familyId === 'string' ? req.params.familyId : undefined) ??
      (typeof req.body?.familyId === 'string' ? req.body.familyId : undefined);

    const userId =
      (typeof req.headers['x-user-id'] === 'string' ? req.headers['x-user-id'] : undefined) ??
      (typeof req.body?.userId === 'string' ? req.body.userId : undefined);

    if (!familyId || !userId) {
      return res.status(401).json({ success: false, message: 'familyId and x-user-id headers are required' });
    }

    const hasAccess = await hasFamilyAccess(userId, familyId);

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Access denied for this family' });
    }

    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};
