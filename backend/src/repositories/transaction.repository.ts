import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prismaClient';
import { TransactionQuery } from '../validators/transaction.validator';
import { buildCursorArgs } from '../utils/pagination';

type DbClient = PrismaClient | Prisma.TransactionClient;

export function buildTransactionWhere(
  userId: string,
  query: TransactionQuery
): Prisma.TransactionWhereInput {
  const conditions: Prisma.TransactionWhereInput[] = [{ userId }];

  if (query.type) conditions.push({ type: query.type });
  if (query.accountId) {
    conditions.push({ OR: [{ accountId: query.accountId }, { toAccountId: query.accountId }] });
  }
  if (query.categoryId) conditions.push({ categoryId: query.categoryId });
  if (query.startDate || query.endDate) {
    conditions.push({
      date: {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      },
    });
  }
  if (query.search) {
    conditions.push({
      OR: [
        { description: { contains: query.search } },
        { referenceNumber: { contains: query.search } },
        { paymentMethod: { contains: query.search } },
      ],
    });
  }

  return { AND: conditions };
}

export function findTransactions(userId: string, query: TransactionQuery, limit: number) {
  return prisma.transaction.findMany({
    where: buildTransactionWhere(userId, query),
    orderBy: [{ date: 'desc' }, { id: 'desc' }],
    include: { account: true, toAccount: true, category: true },
    ...buildCursorArgs({ cursor: query.cursor, limit }),
  });
}

export function findTransactionById(userId: string, id: string) {
  return prisma.transaction.findFirst({
    where: { id, userId },
    include: { account: true, toAccount: true, category: true },
  });
}

export function createTransactionRecord(
  db: DbClient,
  data: Prisma.TransactionUncheckedCreateInput
) {
  return db.transaction.create({ data });
}

export function updateTransactionRecord(
  db: DbClient,
  userId: string,
  id: string,
  data: Prisma.TransactionUncheckedUpdateInput
) {
  return db.transaction.update({ where: { id, userId }, data });
}

export function deleteTransactionRecord(db: DbClient, userId: string, id: string) {
  return db.transaction.delete({ where: { id, userId } });
}

export function incrementAccountBalance(
  db: DbClient,
  userId: string,
  accountId: string,
  delta: number
) {
  return db.account.update({
    where: { id: accountId, userId },
    data: { balance: { increment: delta } },
  });
}

export function recordBalanceSnapshot(db: DbClient, accountId: string, balance: number) {
  return db.accountBalanceHistory.create({ data: { accountId, balance } });
}
