import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  AUTO_LOCK_MINUTES: z.coerce.number().default(60),
  MAX_PIN_ATTEMPTS: z.coerce.number().default(3),
  LOCKOUT_SECONDS: z.coerce.number().default(30),
  SERVE_FRONTEND: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  FRONTEND_DIST: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_CALLBACK_URL: z.string().url('GOOGLE_CALLBACK_URL must be a valid URL'),

  // Email
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
  APP_BASE_URL: z.string().url().default('http://localhost:5173'),

  // Separate admin account
  ADMIN_DEFAULT_EMAIL: z.string().email().default('admin@financeapp.local'),
  ADMIN_DEFAULT_PASSWORD: z.string().min(8).default('Admin@123!'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;