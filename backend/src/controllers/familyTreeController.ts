import type { Request, Response } from 'express';
import { getFamilyTreeForMember } from '../services/familyTreeService.js';

export const getFamilyTree = async (req: Request, res: Response) => {
  try {
    const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tree = await getFamilyTreeForMember(memberId);
    return res.status(200).json({ success: true, data: tree });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'FAMILY_MEMBER_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }
    return res.status(500).json({ success: false, message });
  }
};
