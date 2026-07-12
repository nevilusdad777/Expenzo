import { NextFunction, Request, Response } from 'express';
import * as adminAuthService from '../services/adminAuth.service';
import { HTTP_STATUS } from '../config/constants';
import { ADMIN_COOKIE, ADMIN_COOKIE_OPTIONS } from '../utils/adminSessionToken';
import { env } from '../config/env';

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Email and password are required.' });
    }

    const { token, admin } = await adminAuthService.adminLogin(email, password);

    res.cookie(ADMIN_COOKIE, token, {
      ...ADMIN_COOKIE_OPTIONS,
      secure: env.NODE_ENV === 'production',
    });

    res.status(HTTP_STATUS.OK).json({ success: true, data: { admin, token } });
  } catch (err) {
    next(err);
  }
}

export async function adminLogout(_req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { authenticated: false } });
}

export async function adminMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.adminSession?.adminId) {
      return res.status(HTTP_STATUS.OK).json({ success: true, data: { authenticated: false, admin: null } });
    }
    const admin = await adminAuthService.getAdminMe(req.adminSession.adminId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { authenticated: true, admin } });
  } catch (err) {
    next(err);
  }
}

export async function adminChangePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    if (!currentPassword || !newPassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Both passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    await adminAuthService.changeAdminPassword(req.adminSession!.adminId, currentPassword, newPassword);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { message: 'Password updated.' } });
  } catch (err) {
    next(err);
  }
}
