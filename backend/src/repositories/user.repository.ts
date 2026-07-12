import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';

type DbClient = PrismaClient | Prisma.TransactionClient;

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
}

export function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, emailVerified: true, googleId: true, role: true, createdAt: true },
  });
}

export function findByIdWithPassword(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findByGoogleId(googleId: string) {
  return prisma.user.findUnique({ where: { googleId } });
}

export function createUser(
  db: DbClient,
  data: { email: string; passwordHash?: string; name: string; googleId?: string; emailVerified?: boolean; role?: string }
) {
  return db.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash ?? null,
      name: data.name,
      googleId: data.googleId ?? null,
      emailVerified: data.emailVerified ?? false,
      role: data.role ?? 'USER',
    },
    select: { id: true, email: true, name: true, emailVerified: true, googleId: true, role: true, createdAt: true },
  });
}

export function updateEmailVerified(id: string, emailVerified: boolean) {
  return prisma.user.update({
    where: { id },
    data: { emailVerified },
  });
}

export function updateGoogleId(id: string, googleId: string) {
  return prisma.user.update({
    where: { id },
    data: { googleId, emailVerified: true },
  });
}

export function countUsers() {
  return prisma.user.count();
}
