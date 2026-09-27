import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL ?? '';
const adminPassword = process.env.ADMIN_PASSWORD ?? '';
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH ?? '';
const jwtSecret = process.env.JWT_SECRET ?? 'development-only-secret-change-me';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const emailMatches = (candidate: string) => {
  const normalized = normalizeEmail(candidate);
  const variants = new Set<string>([
    normalized,
    normalized.replace(/@gmail\.com$/, '@gmail'),
    normalized.replace(/@gmail$/, '@gmail.com'),
  ]);

  return [...variants].some((variant) => variant === normalizeEmail(adminEmail));
};

const passwordMatches = async (candidate: string) => {
  if (adminPassword && candidate === adminPassword) return true;
  if (adminPasswordHash && (await bcrypt.compare(candidate, adminPasswordHash))) return true;
  return false;
};

export const authenticateAdmin = async (email: string, password: string) => {
  if (!email || !emailMatches(email)) return null;
  if (!password || !(await passwordMatches(password))) return null;

  return jwt.sign({ email: adminEmail, role: 'ADMIN' }, jwtSecret, { expiresIn: '8h' });
};

export const verifyAdminToken = (authorization?: string) => {
  if (!authorization?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(authorization.slice(7), jwtSecret) as { role?: string };
    return payload.role === 'ADMIN';
  } catch {
    return false;
  }
};