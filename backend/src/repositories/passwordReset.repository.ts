import { prisma } from './prismaClient';
import crypto from 'node:crypto';

const TOKEN_EXPIRY_HOURS = 1;

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createResetToken(userId: string) {
  // Delete any existing token for this user first
  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  return prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });
}

export function findValidToken(token: string) {
  return prisma.passwordResetToken.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
}

export function deleteToken(token: string) {
  return prisma.passwordResetToken.deleteMany({ where: { token } });
}

export function deleteTokensByUser(userId: string) {
  return prisma.passwordResetToken.deleteMany({ where: { userId } });
}
