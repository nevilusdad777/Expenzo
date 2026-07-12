import { prisma } from './prismaClient';
import bcrypt from 'bcrypt';
import { env } from '../config/env';

// ─── Stats ─────────────────────────────────────────────────────────────────

export async function getGlobalStats() {
  const [userCount, transactionCount, accountCount] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count(),
    prisma.account.count(),
  ]);

  const balanceAgg = await prisma.account.aggregate({ _sum: { balance: true } });

  return {
    userCount,
    transactionCount,
    accountCount,
    totalBalance: balanceAgg._sum.balance ?? 0,
  };
}

// ─── Users List ──────────────────────────────────────────────────────────────

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          accounts: true,
          transactions: true,
          categories: true,
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as 'USER' | 'ADMIN',
    emailVerified: u.emailVerified,
    hasGoogleAccount: !!u.googleId,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    accountCount: u._count.accounts,
    transactionCount: u._count.transactions,
    categoryCount: u._count.categories,
  }));
}

// ─── Single User Detail ───────────────────────────────────────────────────────

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
        select: { id: true, name: true, type: true, balance: true, isArchived: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      categories: {
        select: { id: true, name: true, type: true, isDefault: true },
        orderBy: { createdAt: 'asc' },
      },
      transactions: {
        select: {
          id: true,
          type: true,
          amount: true,
          date: true,
          description: true,
          category: {
            select: { name: true, type: true }
          },
          account: {
            select: { name: true }
          },
          toAccount: {
            select: { name: true }
          }
        },
        orderBy: { date: 'desc' }
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'USER' | 'ADMIN',
    emailVerified: user.emailVerified,
    hasGoogleAccount: !!user.googleId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    accounts: user.accounts,
    categories: user.categories,
    transactions: user.transactions,
    transactionCount: user._count.transactions,
  };
}

// ─── Update User ──────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: string; emailVerified?: boolean }
) {
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email.toLowerCase() }),
      ...(data.role !== undefined && { role: data.role }),
      ...(data.emailVerified !== undefined && { emailVerified: data.emailVerified }),
    },
    select: {
      id: true, email: true, name: true, role: true,
      emailVerified: true, googleId: true, createdAt: true,
    },
  });
  return updated;
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetUserPassword(id: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
}

// ─── Delete User ──────────────────────────────────────────────────────────────

export async function deleteUser(id: string) {
  // Cascade deletes handle related data (transactions, accounts, etc.)
  await prisma.user.delete({ where: { id } });
}
