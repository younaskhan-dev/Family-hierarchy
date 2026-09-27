import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../services/authService.js';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!verifyAdminToken(req.headers.authorization)) {
    return res.status(401).json({ success: false, message: 'Administrator sign-in is required for this operation' });
  }
  return next();
};