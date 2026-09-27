import type { Request, Response } from 'express';
import { z } from 'zod';
import { familyMemberSchema, updateFamilyMemberSchema } from '../validators/familyMemberValidator.js';
import {
  archiveFamilyMember,
  createFamilyMember,
  getFamilyMemberById,
  listFamilyMembers,
  updateFamilyMember,
  permanentlyDeleteFamilyMember,
} from '../services/familyMemberService.js';

export const getMembers = async (_req: Request, res: Response) => {
  try {
    const familyId = typeof _req.query.familyId === 'string' ? _req.query.familyId : undefined;
    const members = await listFamilyMembers(familyId);

    res.status(200).json({ success: true, data: members });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message });
  }
};

export const getMemberById = async (req: Request, res: Response) => {
  try {
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const member = await getFamilyMemberById(memberId);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ success: false, message });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const payload = familyMemberSchema.parse(req.body);
    const member = await createFamilyMember(payload as Record<string, unknown>);

    return res.status(201).json({ success: true, data: member });
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

export const updateMember = async (req: Request, res: Response) => {
  try {
    const payload = updateFamilyMemberSchema.parse(req.body);
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const member = await updateFamilyMember(memberId, payload as Record<string, unknown>);

    return res.status(200).json({ success: true, data: member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message ?? 'Invalid payload' });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'FAMILY_MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    if (message === 'FAMILY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    return res.status(500).json({ success: false, message });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const member = await permanentlyDeleteFamilyMember(memberId);
    return res.status(200).json({ success: true, data: member, message: 'Family member permanently deleted' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message === 'FAMILY_MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    return res.status(500).json({ success: false, message });
  }
};
