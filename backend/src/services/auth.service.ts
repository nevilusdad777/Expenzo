import bcrypt from 'bcrypt';
import { prisma } from '../repositories/prismaClient';
import * as configRepo from '../repositories/appConfig.repository';
import * as userRepo from '../repositories/user.repository';
import * as passwordResetRepo from '../repositories/passwordReset.repository';
import * as emailVerificationRepo from '../repositories/emailVerification.repository';
import { seedDefaultsForUser } from './userSeed.service';
import * as emailService from './email.service';
import { issueSessionToken } from '../utils/sessionToken';
import { AppError } from '../middleware/errorHandler';
import { HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

async function getAutoLockMinutes() {
  const config = await configRepo.getConfig();
  return config?.autoLockMinutes ?? env.AUTO_LOCK_MINUTES;
}

function publicUser(user: { id: string; email: string; name: string; emailVerified: boolean; googleId?: string | null; role?: string | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    hasGoogleAccount: !!user.googleId,
    role: (user.role ?? 'USER') as 'USER' | 'ADMIN',
  };
}

// ─── Registration ────────────────────────────────────────────────────────────

export async function register(input: RegisterInput) {
  const existing = await userRepo.findByEmail(input.email);
  if (existing) {
    throw new AppError('An account with this email already exists', HTTP_STATUS.BAD_REQUEST);
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  const autoLockMinutes = await getAutoLockMinutes();

  // First-ever user becomes ADMIN automatically
  const existingCount = await userRepo.countUsers();
  const role = existingCount === 0 ? 'ADMIN' : 'USER';

  const user = await prisma.$transaction(async (tx) => {
    const created = await userRepo.createUser(tx, {
      email: input.email,
      passwordHash,
      name: input.name.trim(),
      emailVerified: false,
      role,
    });
    await seedDefaultsForUser(tx, created.id);
    return created;
  });

  // Send OTP email
  const otp = await emailVerificationRepo.createOTP(user.id);
  console.log(`\n-----------------------------------------`);
  console.log(`[DEV ONLY] Verification OTP for ${user.email}: ${otp}`);
  console.log(`-----------------------------------------\n`);
  try {
    await emailService.sendOTPEmail(user.email, user.name, otp);
  } catch (err) {
    console.error('[email] Failed to send OTP:', err);
    // Don't fail registration if email fails — user can resend
  }

  const token = issueSessionToken(user.id, autoLockMinutes);
  return { token, user: publicUser(user), autoLockMinutes };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput) {
  const user = await userRepo.findByEmail(input.email);
  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  // Google-only account (no password set)
  if (!user.passwordHash) {
    throw new AppError(
      'This account uses Google Sign-In. Please use "Continue with Google".',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const autoLockMinutes = await getAutoLockMinutes();
  const token = issueSessionToken(user.id, autoLockMinutes);
  const profile = await userRepo.findById(user.id);
  if (!profile) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  return { token, user: publicUser(profile), autoLockMinutes };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function googleLoginOrRegister(profile: {
  googleId: string;
  email: string;
  name: string;
}) {
  let userId: string;

  // Check if user with this Google ID already exists
  const byGoogleId = await userRepo.findByGoogleId(profile.googleId);

  if (byGoogleId) {
    userId = byGoogleId.id;
  } else {
    // Check if email already registered (link accounts)
    const existingByEmail = await userRepo.findByEmail(profile.email);

    if (existingByEmail) {
      // Link Google to existing account
      await userRepo.updateGoogleId(existingByEmail.id, profile.googleId);
      userId = existingByEmail.id;
    } else {
      // Create brand new user via Google
      const newUser = await prisma.$transaction(async (tx) => {
        const created = await userRepo.createUser(tx, {
          email: profile.email.toLowerCase(),
          name: profile.name,
          googleId: profile.googleId,
          emailVerified: true,
        });
        await seedDefaultsForUser(tx, created.id);
        return created;
      });
      userId = newUser.id;
    }
  }

  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('Google login failed', HTTP_STATUS.INTERNAL_ERROR);

  // Send Google login alert email
  try {
    await emailService.sendGoogleLoginNotificationEmail(user.email, user.name);
  } catch (err) {
    console.error('[email] Failed to send Google login alert email:', err);
  }

  const autoLockMinutes = await getAutoLockMinutes();
  const token = issueSessionToken(user.id, autoLockMinutes);
  return { token, user: publicUser(user), autoLockMinutes };
}

// ─── OTP Verification ─────────────────────────────────────────────────────────

export async function sendOTP(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  if (user.emailVerified) throw new AppError('Email already verified', HTTP_STATUS.BAD_REQUEST);

  const otp = await emailVerificationRepo.createOTP(userId);
  console.log(`\n-----------------------------------------`);
  console.log(`[DEV ONLY] Verification OTP for ${user.email}: ${otp}`);
  console.log(`-----------------------------------------\n`);
  try {
    await emailService.sendOTPEmail(user.email, user.name, otp);
  } catch (err) {
    console.error('[email] Failed to send OTP email:', err);
  }
}

export async function verifyOTP(userId: string, code: string) {
  const valid = await emailVerificationRepo.verifyOTP(userId, code);
  if (!valid) {
    throw new AppError('Invalid or expired verification code', HTTP_STATUS.BAD_REQUEST);
  }
  await userRepo.updateEmailVerified(userId, true);
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return publicUser(user);
}

// ─── Forgot / Reset Password ──────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  const user = await userRepo.findByEmail(email);
  // Always respond with success to prevent email enumeration
  if (!user) return;

  const { token } = await passwordResetRepo.createResetToken(user.id);
  const resetLink = `${env.APP_BASE_URL}/reset-password?token=${token}`;
  console.log(`\n-----------------------------------------`);
  console.log(`[DEV ONLY] Password Reset Link for ${user.email}: ${resetLink}`);
  console.log(`-----------------------------------------\n`);

  try {
    await emailService.sendPasswordResetEmail(user.email, user.name, resetLink);
  } catch (err) {
    console.error('[email] Failed to send reset email:', err);
  }
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await passwordResetRepo.findValidToken(token);
  if (!record) {
    throw new AppError('Invalid or expired reset link', HTTP_STATUS.BAD_REQUEST);
  }

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });

  await passwordResetRepo.deleteToken(token);
}

// ─── Me / Session ─────────────────────────────────────────────────────────────

export async function getMe(userId: string) {
  const user = await userRepo.findById(userId);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return publicUser(user);
}

export async function getAuthStatus() {
  const userCount = await userRepo.countUsers();
  return { registrationOpen: true, hasUsers: userCount > 0 };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await userRepo.findByIdWithPassword(userId);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  if (!user.passwordHash) {
    throw new AppError('Cannot change password for Google accounts', HTTP_STATUS.BAD_REQUEST);
  }

  const isMatch = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED);
  }

  const passwordHash = await bcrypt.hash(input.newPassword, env.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  const autoLockMinutes = await getAutoLockMinutes();
  const token = issueSessionToken(userId, autoLockMinutes);
  return { token, autoLockMinutes };
}

export async function refreshSession(userId: string) {
  const autoLockMinutes = await getAutoLockMinutes();
  const token = issueSessionToken(userId, autoLockMinutes);
  return { token, autoLockMinutes };
}

export async function getAutoLockSettings() {
  return { autoLockMinutes: await getAutoLockMinutes() };
}

export async function updateAutoLockSettings(userId: string, minutes: number) {
  if (minutes < 1 || minutes > 1440) {
    throw new AppError('Auto-lock must be between 1 and 1440 minutes', HTTP_STATUS.BAD_REQUEST);
  }

  let config = await configRepo.getConfig();
  if (!config) {
    config = await configRepo.createConfigWithoutPin();
  } else {
    await configRepo.updateAutoLockMinutes(minutes);
  }

  const autoLockMinutes = minutes;
  const token = issueSessionToken(userId, autoLockMinutes);
  return { token, autoLockMinutes };
}


