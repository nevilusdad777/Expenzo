import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(80),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmNewPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Legacy PIN schemas (kept for backwards compatibility)
export const setupPinSchema = z
  .object({
    pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
    confirmPin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: 'PINs do not match',
    path: ['confirmPin'],
  });

export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
  method: z.enum(['pin', 'webauthn']).default('pin'),
});

export const changePinSchema = z
  .object({
    oldPin: z.string().regex(/^\d{6}$/),
    newPin: z.string().regex(/^\d{6}$/),
    confirmNewPin: z.string().regex(/^\d{6}$/),
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: 'New PINs do not match',
    path: ['confirmNewPin'],
  });

export type SetupPinInput = z.infer<typeof setupPinSchema>;
export type VerifyPinInput = z.infer<typeof verifyPinSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;
