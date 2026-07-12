import { prisma } from './prismaClient';

export function countTransactionsInRange(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.count({
    where: { userId, date: { gte: startDate, lte: endDate } },
  });
}

export function sumTransactionsByType(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });
}

export function getCategoryBreakdown(
  userId: string,
  startDate: Date,
  endDate: Date,
  type: 'INCOME' | 'EXPENSE'
) {
  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      type,
      categoryId: { not: null },
    },
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: 'desc' } },
  });
}

export function getAccountIncomeExpense(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.groupBy({
    by: ['accountId', 'type'],
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      type: { in: ['INCOME', 'EXPENSE'] },
    },
    _sum: { amount: true },
    _count: { _all: true },
  });
}

export function getTransferOutByAccount(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.groupBy({
    by: ['accountId'],
    where: { userId, date: { gte: startDate, lte: endDate }, type: 'TRANSFER' },
    _sum: { amount: true },
    _count: { _all: true },
  });
}

export function getTransferInByAccount(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.groupBy({
    by: ['toAccountId'],
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      type: 'TRANSFER',
      toAccountId: { not: null },
    },
    _sum: { amount: true },
    _count: { _all: true },
  });
}

export function getTransactionsForCashFlow(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      type: { in: ['INCOME', 'EXPENSE'] },
    },
    select: { date: true, type: true, amount: true },
    orderBy: { date: 'asc' },
  });
}
