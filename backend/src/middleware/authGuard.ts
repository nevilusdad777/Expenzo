import { NextFunction, Request, Response } from 'express';
import { verifySessionToken, issueSessionToken } from '../utils/sessionToken';
import { HTTP_STATUS } from '../config/constants';
import * as configRepo from '../repositories/appConfig.repository';
import { env } from '../config/env';

const COOKIE_NAME = 'session_token';

function getAutoLockMinutes(config: { autoLockMinutes: number } | null) {
  return config?.autoLockMinutes ?? env.AUTO_LOCK_MINUTES;
}

export async function authGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const session = verifySessionToken(token);

  if (!session) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  const config = await configRepo.getConfig();
  const autoLockMinutes = getAutoLockMinutes(config);
  const freshToken = issueSessionToken(session.userId, autoLockMinutes);

  res.cookie(COOKIE_NAME, freshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: autoLockMinutes * 60 * 1000,
  });

  req.session = { unlocked: true, userId: session.userId };
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const session = verifySessionToken(token);
  if (session) {
    req.session = { unlocked: true, userId: session.userId };
  }
  next();
}
