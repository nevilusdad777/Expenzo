import { prisma } from './prismaClient';

export function sumTransactionsByType(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.groupBy({
    by: ['type'],
    where: { userId, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
  });
}

export function sumAllAccountBalances(userId: string) {
  return prisma.account.aggregate({
    where: { userId, isArchived: false },
    _sum: { balance: true },
  });
}

export function getRecentTransactions(userId: string, limit: number) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    include: { account: true, category: true, toAccount: true },
  });
}

export function getTopCategoriesByAmount(
  userId: string,
  startDate: Date,
  endDate: Date,
  type: 'INCOME' | 'EXPENSE',
  limit: number
) {
  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, date: { gte: startDate, lte: endDate }, type },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });
}

export function getMonthlySeriesForYear(userId: string, year: number) {
  return prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
    select: { date: true, type: true, amount: true },
  });
}

export function getHighestTransaction(
  userId: string,
  type: 'INCOME' | 'EXPENSE',
  startDate: Date,
  endDate: Date
) {
  return prisma.transaction.findFirst({
    where: { userId, type, date: { gte: startDate, lte: endDate } },
    orderBy: { amount: 'desc' },
    include: { account: true, category: true },
  });
}
