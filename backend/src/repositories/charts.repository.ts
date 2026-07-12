import { prisma } from './prismaClient';

export type ChartType = 'INCOME' | 'EXPENSE';

export function getYearBounds(year: number) {
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  return { start, end };
}

export async function getTopCategoriesForYear(
  userId: string,
  year: number,
  type: ChartType,
  limit: number
) {
  const { start, end } = getYearBounds(year);
  return prisma.transaction.groupBy({
    by: ['categoryId'],
    where: {
      userId,
      date: { gte: start, lte: end },
      type,
      categoryId: { not: null },
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });
}

export async function getCategoryMonthlySums(
  userId: string,
  startDate: Date,
  endDate: Date,
  type: ChartType,
  categoryIds: string[]
) {
  if (categoryIds.length === 0) return [];

  return prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      type,
      categoryId: { in: categoryIds },
    },
    select: { date: true, categoryId: true, amount: true },
  });
}

export async function getCategoriesByIds(userId: string, categoryIds: string[]) {
  if (categoryIds.length === 0) return [];

  return prisma.category.findMany({
    where: { userId, id: { in: categoryIds } },
    select: { id: true, name: true, color: true },
  });
}

export async function getTopAccountsByCurrentBalance(userId: string, limit: number) {
  return prisma.account.findMany({
    where: { userId, isArchived: false },
    orderBy: { balance: 'desc' },
    take: limit,
    select: { id: true, name: true, color: true, balance: true },
  });
}

export async function getLatestBalanceSnapshotBefore(accountId: string, date: Date) {
  return prisma.accountBalanceHistory.findFirst({
    where: { accountId, recordedAt: { lt: date } },
    orderBy: { recordedAt: 'desc' },
    select: { balance: true, recordedAt: true },
  });
}

export async function getBalanceSnapshotsInRange(accountId: string, startDate: Date, endDate: Date) {
  return prisma.accountBalanceHistory.findMany({
    where: { accountId, recordedAt: { gte: startDate, lte: endDate } },
    orderBy: { recordedAt: 'asc' },
    select: { balance: true, recordedAt: true },
  });
}

export async function getTransactionsInYearRange(userId: string, startDate: Date, endDate: Date) {
  return prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      type: { in: ['INCOME', 'EXPENSE'] },
    },
    select: { date: true, type: true, amount: true },
  });
}
