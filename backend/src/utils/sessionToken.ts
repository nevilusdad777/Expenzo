import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const ISSUER = 'finance-manager';

export interface SessionPayload {
  unlocked: boolean;
  userId: string;
}

export function issueSessionToken(userId: string, autoLockMinutes: number): string {
  return jwt.sign({ unlocked: true, userId }, env.SESSION_SECRET, {
    issuer: ISSUER,
    expiresIn: `${autoLockMinutes}m`,
  });
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  try {
    const payload = jwt.verify(token, env.SESSION_SECRET, { issuer: ISSUER });
    if (typeof payload !== 'object' || payload === null) return null;
    const data = payload as { unlocked?: boolean; userId?: string };
    if (data.unlocked !== true || !data.userId) return null;
    return { unlocked: true, userId: data.userId };
  } catch (err) {
    console.error('[verifySessionToken] Token verification failed:', err);
    return null;
  }
}
