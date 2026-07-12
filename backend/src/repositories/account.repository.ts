import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';
import { CreateAccountInput, UpdateAccountInput } from '../validators/account.validator';

type DbClient = PrismaClient | Prisma.TransactionClient;

export function findAllAccounts(userId: string, includeArchived: boolean) {
  return prisma.account.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    orderBy: { createdAt: 'asc' },
  });
}

export function findAccountById(userId: string, id: string) {
  return prisma.account.findFirst({ where: { id, userId } });
}

export function createAccount(db: DbClient, userId: string, data: CreateAccountInput) {
  return db.account.create({ data: { ...data, userId } });
}

export function updateAccount(db: DbClient, userId: string, id: string, data: UpdateAccountInput) {
  return db.account.update({ where: { id, userId }, data });
}

export function archiveAccount(db: DbClient, userId: string, id: string) {
  return db.account.update({ where: { id, userId }, data: { isArchived: true } });
}

export function unarchiveAccount(db: DbClient, userId: string, id: string) {
  return db.account.update({ where: { id, userId }, data: { isArchived: false } });
}

export function countTransactionsForAccount(userId: string, id: string) {
  return prisma.transaction.count({
    where: {
      userId,
      OR: [{ accountId: id }, { toAccountId: id }],
    },
  });
}

export function deleteAccountHard(db: DbClient, userId: string, id: string) {
  return db.account.delete({ where: { id, userId } });
}

export function recordBalanceSnapshot(db: DbClient, accountId: string, balance: number) {
  return db.accountBalanceHistory.create({
    data: { accountId, balance },
  });
}

export function getBalanceHistory(userId: string, accountId: string, limit: number) {
  return prisma.accountBalanceHistory.findMany({
    where: { accountId, account: { userId } },
    orderBy: { recordedAt: 'desc' },
    take: limit,
  });
}
