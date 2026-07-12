import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authGuard, optionalAuth } from '../middleware/authGuard';
import { redirectToGoogle, handleGoogleCallback } from '../middleware/googleAuth';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import { z } from 'zod';

const router = Router();

// ─── Status & Session ─────────────────────────────────────────────────────────
router.get('/auth/status', authController.getStatus);
router.get('/auth/me', optionalAuth, authController.me);
router.post('/auth/logout', authController.logout);
router.post('/auth/refresh', authGuard, authController.refresh);
router.post('/auth/lock', authGuard, authController.lock);

// ─── Register / Login ─────────────────────────────────────────────────────────
router.post('/auth/register', validate(registerSchema), authController.register);
router.post('/auth/login', validate(loginSchema), authController.login);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/auth/google', redirectToGoogle);
router.get('/auth/google/callback', handleGoogleCallback, authController.googleCallback);

// ─── OTP Email Verification ───────────────────────────────────────────────────
router.post('/auth/send-otp', authGuard, authController.sendOTP);
router.post(
  '/auth/verify-otp',
  authGuard,
  validate(z.object({ code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/) })),
  authController.verifyOTP
);

// ─── Forgot / Reset Password ──────────────────────────────────────────────────
router.post(
  '/auth/forgot-password',
  validate(z.object({ email: z.string().email() })),
  authController.forgotPassword
);
router.post(
  '/auth/reset-password',
  validate(
    z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    })
  ),
  authController.resetPassword
);

// ─── Password Change ──────────────────────────────────────────────────────────
router.post('/auth/change-password', authGuard, validate(changePasswordSchema), authController.changePassword);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/auth/settings/auto-lock', authGuard, authController.getAutoLockSettings);
router.patch(
  '/auth/settings/auto-lock',
  authGuard,
  validate(z.object({ autoLockMinutes: z.coerce.number().min(1).max(1440) })),
  authController.updateAutoLockSettings
);

export default router;
