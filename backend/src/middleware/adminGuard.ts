import { NextFunction, Request, Response } from 'express';
import { verifyAdminToken, ADMIN_COOKIE } from '../utils/adminSessionToken';
import { HTTP_STATUS } from '../config/constants';

// Extend Request to carry the admin session
declare global {
  namespace Express {
    interface Request {
      adminSession?: { adminId: string };
    }
  }
}

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  let token = undefined;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = req.cookies?.[ADMIN_COOKIE];
  }
  const session = verifyAdminToken(token);

  if (!session) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Admin authentication required. Please log in at /admin-login.',
    });
  }

  req.adminSession = { adminId: session.adminId };
  next();
}

export function optionalAdminAuth(req: Request, _res: Response, next: NextFunction) {
  let token = undefined;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = req.cookies?.[ADMIN_COOKIE];
  }
  const session = verifyAdminToken(token);
  if (session) {
    req.adminSession = { adminId: session.adminId };
  }
  next();
}
