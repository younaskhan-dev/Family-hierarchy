import type { Request, Response } from 'express';
import { z } from 'zod';
import { marriageSchema, parentChildRelationshipSchema } from '../validators/relationshipValidator.js';
import { createMarriage, createParentChildRelationship, listParentChildRelationships } from '../services/relationshipService.js';

export const listParentChild = async (req: Request, res: Response) => {
  try {
    const familyId = typeof req.query.familyId === 'string' ? req.query.familyId : undefined;
    if (!familyId) return res.status(400).json({ success: false, message: 'familyId is required' });

    const relationships = await listParentChildRelationships(familyId);
    return res.status(200).json({ success: true, data: relationships });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const createParentChild = async (req: Request, res: Response) => {
  try {
    const payload = parentChildRelationshipSchema.parse(req.body);
    const relationship = await createParentChildRelationship(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: relationship });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    if (message === 'MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Parent or child member not found' });
    }

    if (message === 'SELF_RELATION_NOT_ALLOWED') {
      return res.status(400).json({ success: false, message: 'A person cannot be their own parent or child' });
    }

    if (message === 'CROSS_FAMILY_RELATION_NOT_ALLOWED') {
      return res.status(400).json({ success: false, message: 'Parent and child must belong to the same family' });
    }

    if (message === 'DUPLICATE_RELATIONSHIP') {
      return res.status(409).json({ success: false, message: 'Duplicate parent-child relationship already exists' });
    }

    return res.status(500).json({ success: false, message });
  }
};

export const createMarriageRecord = async (req: Request, res: Response) => {
  try {
    const payload = marriageSchema.parse(req.body);
    const marriage = await createMarriage(payload as Record<string, unknown>);
    return res.status(201).json({ success: true, data: marriage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    if (message === 'MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'One or both members not found' });
    }

    if (message === 'SELF_MARRIAGE_NOT_ALLOWED') {
      return res.status(400).json({ success: false, message: 'A person cannot be married to themselves' });
    }

    if (message === 'CROSS_FAMILY_RELATION_NOT_ALLOWED') {
      return res.status(400).json({ success: false, message: 'Marriage must be within the same family' });
    }

    return res.status(500).json({ success: false, message });
  }
};
