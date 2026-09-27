import type { Request, Response } from 'express';
import { z } from 'zod';
import { eventSchema } from '../validators/eventValidator.js';
import { createEventRecord, listEvents } from '../services/eventService.js';

export const listEventsController = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    const events = await listEvents(familyId);
    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const payload = eventSchema.parse(req.body);
    const event = await createEventRecord(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    return res.status(500).json({ success: false, message });
  }
};
