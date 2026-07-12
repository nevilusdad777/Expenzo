import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Separate issuer so admin tokens can NEVER be confused with user tokens
const ADMIN_ISSUER = 'finance-manager-admin';
const ADMIN_COOKIE = 'admin_token';
const ADMIN_SESSION_HOURS = 8;

export { ADMIN_COOKIE };

export interface AdminSessionPayload {
  adminId: string;
}

export function issueAdminToken(adminId: string): string {
  return jwt.sign({ adminId }, env.SESSION_SECRET, {
    issuer: ADMIN_ISSUER,
    expiresIn: `${ADMIN_SESSION_HOURS}h`,
  });
}

export function verifyAdminToken(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.SESSION_SECRET, { issuer: ADMIN_ISSUER });
    if (typeof payload !== 'object' || payload === null) return null;
    const data = payload as { adminId?: string };
    if (!data.adminId) return null;
    return { adminId: data.adminId };
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: ADMIN_SESSION_HOURS * 60 * 60 * 1000,
};
