import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { issueSessionToken } from '../utils/sessionToken';
import * as configRepo from '../repositories/appConfig.repository';

const COOKIE_NAME = 'session_token';

function setSessionCookie(res: Response, token: string, autoLockMinutes: number) {
  const isProd = env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    path: '/',
    maxAge: autoLockMinutes * 60 * 1000,
  });
}

export async function getStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const status = await authService.getAuthStatus();
    res.status(HTTP_STATUS.OK).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, user, autoLockMinutes } = await authService.register(req.body);
    setSessionCookie(res, token, autoLockMinutes);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: { user, token, autoLockMinutes },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, user, autoLockMinutes } = await authService.login(req.body);
    setSessionCookie(res, token, autoLockMinutes);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user, token, autoLockMinutes },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.session?.userId) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { authenticated: false, user: null },
      });
    }
    const user = await authService.getMe(req.session.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { authenticated: true, user },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function googleCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = req.googleProfile;
    if (!profile) {
      return res.redirect(`${env.APP_BASE_URL}/auth?error=google_failed`);
    }

    const { token, autoLockMinutes } = await authService.googleLoginOrRegister(profile);
    setSessionCookie(res, token, autoLockMinutes);
    res.redirect(`${env.APP_BASE_URL}?token=${token}`);
  } catch (err) {
    next(err);
  }
}

// ─── OTP ──────────────────────────────────────────────────────────────────────

export async function sendOTP(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.sendOTP(req.session!.userId);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { sent: true } });
  } catch (err) {
    next(err);
  }
}

export async function verifyOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.body as { code: string };
    const user = await authService.verifyOTP(req.session!.userId, code);

    const config = await configRepo.getConfig();
    const autoLockMinutes = config?.autoLockMinutes ?? env.AUTO_LOCK_MINUTES;
    const token = issueSessionToken(user.id, autoLockMinutes);

    setSessionCookie(res, token, autoLockMinutes);

    res.status(HTTP_STATUS.OK).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

// ─── Forgot / Reset Password ──────────────────────────────────────────────────

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as { email: string };
    await authService.forgotPassword(email);
    // Always return success to prevent email enumeration
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { message: 'If an account with that email exists, a reset link has been sent.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    await authService.resetPassword(token, newPassword);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { message: 'Password updated successfully.' } });
  } catch (err) {
    next(err);
  }
}

// ─── Password Change ──────────────────────────────────────────────────────────

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, autoLockMinutes } = await authService.changePassword(
      req.session!.userId,
      req.body
    );
    setSessionCookie(res, token, autoLockMinutes);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { autoLockMinutes } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, autoLockMinutes } = await authService.refreshSession(req.session!.userId);
    setSessionCookie(res, token, autoLockMinutes);
    res.status(HTTP_STATUS.OK).json({ success: true, data: { autoLockMinutes } });
  } catch (err) {
    next(err);
  }
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { authenticated: false } });
}

export function lock(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME);
  res.status(HTTP_STATUS.OK).json({ success: true, data: { authenticated: false } });
}

export async function getAutoLockSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await authService.getAutoLockSettings();
    res.status(HTTP_STATUS.OK).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateAutoLockSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await authService.updateAutoLockSettings(
      req.session!.userId,
      req.body.autoLockMinutes
    );
    setSessionCookie(res, settings.token, settings.autoLockMinutes);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { autoLockMinutes: settings.autoLockMinutes },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.updateProfile(req.session!.userId, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
