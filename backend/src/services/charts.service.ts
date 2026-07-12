import * as chartsRepo from '../repositories/charts.repository';
import type { ChartType } from '../repositories/charts.repository';

function monthNumber(date: Date) {
  return date.getUTCMonth() + 1;
}

export async function getCategoryTrend(
  userId: string,
  query: {
  year: number;
  type: ChartType;
  limit: number;
  categoryIds?: string[];
}) {
  const { start, end } = chartsRepo.getYearBounds(query.year);
  const categoryIds =
    query.categoryIds && query.categoryIds.length > 0
      ? query.categoryIds
      : (
          await chartsRepo.getTopCategoriesForYear(userId, query.year, query.type, query.limit)
        )
          .map((row: { categoryId: string | null }) => row.categoryId)
          .filter((id: string | null): id is string => Boolean(id));

  const categories = await chartsRepo.getCategoriesByIds(userId, categoryIds);
  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  const monthlyRows = await chartsRepo.getCategoryMonthlySums(
    userId,
    start,
    end,
    query.type,
    categoryIds
  );

  const points = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    amounts: {} as Record<string, number>,
  }));

  for (const row of monthlyRows) {
    if (!row.categoryId) continue;
    const m = monthNumber(new Date(row.date));
    const point = points[m - 1];
    point.amounts[row.categoryId] = (point.amounts[row.categoryId] ?? 0) + row.amount;
  }

  // Ensure every point has keys for all categories (makes Recharts easier)
  for (const point of points) {
    for (const categoryId of categoryIds) {
      point.amounts[categoryId] = point.amounts[categoryId] ?? 0;
    }
  }

  return {
    year: query.year,
    type: query.type,
    categories: categoryIds.map((id) => ({
      categoryId: id,
      name: categoriesMap.get(id)?.name ?? 'Unknown',
      color: categoriesMap.get(id)?.color ?? null,
    })),
    data: points,
  };
}

export async function getAccountBalanceTrend(
  userId: string,
  query: { year: number; limit: number }
) {
  const { start, end } = chartsRepo.getYearBounds(query.year);

  const monthEnds = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    // Last moment of month in UTC
    return new Date(Date.UTC(query.year, month, 0, 23, 59, 59, 999));
  });

  const topAccounts = await chartsRepo.getTopAccountsByCurrentBalance(userId, query.limit);

  const accounts: Array<{ accountId: string; name: string; color: string | null }> = topAccounts.map(
    (a) => ({
      accountId: a.id,
      name: a.name,
      color: a.color ?? null,
    })
  );

  // For each account, build 12 month points.
  const perAccountBalances: Record<string, number[]> = {};
  await Promise.all(
    topAccounts.map(async (acc) => {
      const latestBefore = await chartsRepo.getLatestBalanceSnapshotBefore(acc.id, start);
      const snapshots = await chartsRepo.getBalanceSnapshotsInRange(acc.id, start, end);

      let current = latestBefore?.balance ?? snapshots[0]?.balance ?? acc.balance ?? 0;

      const balances: number[] = [];
      let idx = 0;

      for (const monthEnd of monthEnds) {
        while (idx < snapshots.length) {
          const snap = snapshots[idx];
          if (new Date(snap.recordedAt).getTime() <= monthEnd.getTime()) {
            current = snap.balance;
            idx += 1;
            continue;
          }
          break;
        }
        balances.push(current);
      }

      perAccountBalances[acc.id] = balances;
    })
  );

  const data = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const balances: Record<string, number> = {};
    for (const acc of topAccounts) {
      balances[acc.id] = perAccountBalances[acc.id]?.[i] ?? 0;
    }
    return { month, balances };
  });

  return { year: query.year, accounts, data };
}

export async function getYearlySummary(
  userId: string,
  query: { startYear: number; endYear: number }
) {
  const { start, end } = chartsRepo.getYearBounds(query.startYear);
  const endBounds = chartsRepo.getYearBounds(query.endYear);

  const rows = await chartsRepo.getTransactionsInYearRange(userId, start, endBounds.end);

  const years = new Map<
    number,
    { year: number; totalIncome: number; totalExpense: number }
  >();

  for (const row of rows) {
    const d = new Date(row.date);
    const y = d.getUTCFullYear();
    const existing =
      years.get(y) ?? { year: y, totalIncome: 0, totalExpense: 0 };

    if (row.type === 'INCOME') existing.totalIncome += row.amount;
    if (row.type === 'EXPENSE') existing.totalExpense += row.amount;
    years.set(y, existing);
  }

  const yearResults: Array<{
    year: number;
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    avgDailySpending: number;
    savingsRate: number;
  }> = [];

  for (let y = query.startYear; y <= query.endYear; y += 1) {
    const totals = years.get(y) ?? { year: y, totalIncome: 0, totalExpense: 0 };
    const netSavings = totals.totalIncome - totals.totalExpense;

    const startY = new Date(Date.UTC(y, 0, 1));
    const endY = new Date(Date.UTC(y, 11, 31, 23, 59, 59, 999));
    const days = Math.max(1, Math.ceil((endY.getTime() - startY.getTime()) / 86400000));

    const avgDailySpending = totals.totalExpense / days;
    const savingsRate =
      totals.totalIncome > 0
        ? Math.round((netSavings / totals.totalIncome) * 1000) / 10
        : 0;

    yearResults.push({
      year: y,
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      netSavings,
      avgDailySpending: Math.round(avgDailySpending * 100) / 100,
      savingsRate,
    });
  }

  return { years: yearResults };
}

