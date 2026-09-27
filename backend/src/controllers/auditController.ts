import type { Request, Response } from 'express';
import { z } from 'zod';
import { auditLogSchema } from '../validators/auditLogValidator.js';
import { createAuditLog, listAuditLogs } from '../services/auditService.js';

export const listAudit = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    const logs = await listAuditLogs(familyId);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const createAudit = async (req: Request, res: Response) => {
  try {
    const payload = auditLogSchema.parse(req.body);
    const log = await createAuditLog(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: log });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
  }
};
