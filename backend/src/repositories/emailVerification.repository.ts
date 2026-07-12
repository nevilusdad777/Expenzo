import { prisma } from './prismaClient';

const OTP_EXPIRY_MINUTES = 10;

function generateOTP(): string {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(userId: string): Promise<string> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailVerification.upsert({
    where: { userId },
    update: { code, expiresAt },
    create: { userId, code, expiresAt },
  });

  return code;
}

export async function verifyOTP(userId: string, code: string): Promise<boolean> {
  const record = await prisma.emailVerification.findUnique({ where: { userId } });
  if (!record) return false;
  if (record.code !== code) return false;
  if (record.expiresAt < new Date()) return false;

  // Delete after successful verification
  await prisma.emailVerification.delete({ where: { userId } });
  return true;
}

export function deleteOTP(userId: string) {
  return prisma.emailVerification.deleteMany({ where: { userId } });
}
