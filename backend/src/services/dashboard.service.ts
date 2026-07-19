import * as dashboardRepo from '../repositories/dashboard.repository';
import * as categoryRepo from '../repositories/category.repository';
import { DashboardQuery } from '../validators/dashboard.validator';

function monthBounds(month: number, year: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

export async function getDashboardSummary(userId: string, query: DashboardQuery) {
  const now = new Date();
  const month = query.month ?? now.getUTCMonth() + 1;
  const year = query.year ?? now.getUTCFullYear();
  const { start, end } = monthBounds(month, year);

  // Run ALL queries in parallel — was previously 4 sequential round-trips (400–1600ms each)
  const [
    monthlySums,
    allTimeSums,
    totalBalanceAgg,
    recentTransactions,
    highestExpense,
    highestIncome,
    topExpenseCategories,
    topIncomeCategories,
    allCategories,
  ] = await Promise.all([
    dashboardRepo.sumTransactionsByType(userId, start, end),
    dashboardRepo.sumTransactionsByType(userId, new Date(0), new Date('2100-01-01')),
    dashboardRepo.sumAllAccountBalances(userId),
    dashboardRepo.getRecentTransactions(userId, 10),
    dashboardRepo.getHighestTransaction(userId, 'EXPENSE', start, end),
    dashboardRepo.getHighestTransaction(userId, 'INCOME', start, end),
    dashboardRepo.getTopCategoriesByAmount(userId, start, end, 'EXPENSE', 5),
    dashboardRepo.getTopCategoriesByAmount(userId, start, end, 'INCOME', 5),
    categoryRepo.findAllCategories(userId),
  ]);

  const monthlyIncome = monthlySums.find((s) => s.type === 'INCOME')?._sum.amount ?? 0;
  const monthlyExpense = monthlySums.find((s) => s.type === 'EXPENSE')?._sum.amount ?? 0;
  const totalIncome = allTimeSums.find((s) => s.type === 'INCOME')?._sum.amount ?? 0;
  const totalExpense = allTimeSums.find((s) => s.type === 'EXPENSE')?._sum.amount ?? 0;

  const categoryMap = new Map(allCategories.map((c) => [c.id, c]));

  const enrichCategoryStats = (
    stats: { categoryId: string | null; _sum: { amount: number | null } }[]
  ) =>
    stats
      .filter((s) => s.categoryId)
      .map((s) => ({
        categoryId: s.categoryId!,
        name: categoryMap.get(s.categoryId!)?.name ?? 'Unknown',
        color: categoryMap.get(s.categoryId!)?.color ?? null,
        amount: s._sum.amount ?? 0,
      }));

  return {
    totalBalance: totalBalanceAgg._sum.balance ?? 0,
    totalIncome,
    totalExpense,
    monthlyIncome,
    monthlyExpense,
    netSavings: monthlyIncome - monthlyExpense,
    recentTransactions,
    highestExpense,
    highestIncome,
    topExpenseCategories: enrichCategoryStats(topExpenseCategories),
    topIncomeCategories: enrichCategoryStats(topIncomeCategories),
  };
}

export async function getMonthlyTrend(userId: string, year: number) {
  const rows = await dashboardRepo.getMonthlySeriesForYear(userId, year);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
  }));

  for (const row of rows) {
    if (row.type === 'TRANSFER') continue;
    const monthIndex = new Date(row.date).getUTCMonth();
    if (row.type === 'INCOME') months[monthIndex].income += row.amount;
    if (row.type === 'EXPENSE') months[monthIndex].expense += row.amount;
  }

  return months;
}
