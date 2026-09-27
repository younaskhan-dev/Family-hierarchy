import type { Request, Response } from 'express';
import { z } from 'zod';
import { authenticateAdmin } from '../services/authService.js';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const token = await authenticateAdmin(email, password);
    if (!token) return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    return res.status(200).json({ success: true, data: { token, role: 'ADMIN' } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Email and password are required' });
    return res.status(500).json({ success: false, message: 'Unable to sign in' });
  }
};