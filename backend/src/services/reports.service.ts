import * as reportsRepo from '../repositories/reports.repository';
import * as accountRepo from '../repositories/account.repository';
import * as categoryRepo from '../repositories/category.repository';
import { ReportsQuery } from '../validators/reports.validator';

function bucketKey(date: Date, groupBy: ReportsQuery['groupBy']): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');

  if (groupBy === 'month') return `${y}-${m}`;
  if (groupBy === 'week') {
    const day = date.getUTCDay() || 7;
    const thursday = new Date(date);
    thursday.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${thursday.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }
  return `${y}-${m}-${d}`;
}

function buildCashFlowSeries(
  rows: { date: Date; type: string; amount: number }[],
  groupBy: ReportsQuery['groupBy']
) {
  const map = new Map<string, { income: number; expense: number }>();

  for (const row of rows) {
    const key = bucketKey(new Date(row.date), groupBy);
    const entry = map.get(key) ?? { income: 0, expense: 0 };
    if (row.type === 'INCOME') entry.income += row.amount;
    if (row.type === 'EXPENSE') entry.expense += row.amount;
    map.set(key, entry);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, values]) => ({
      period,
      income: values.income,
      expense: values.expense,
      net: values.income - values.expense,
    }));
}

export async function getFullReport(userId: string, query: ReportsQuery) {
  const { startDate, endDate, groupBy } = query;

  const [
    typeSums,
    txCount,
    incomeCategories,
    expenseCategories,
    accountActivity,
    transferOut,
    transferIn,
    cashFlowRows,
    accounts,
    categories,
  ] = await Promise.all([
    reportsRepo.sumTransactionsByType(userId, startDate, endDate),
    reportsRepo.countTransactionsInRange(userId, startDate, endDate),
    reportsRepo.getCategoryBreakdown(userId, startDate, endDate, 'INCOME'),
    reportsRepo.getCategoryBreakdown(userId, startDate, endDate, 'EXPENSE'),
    reportsRepo.getAccountIncomeExpense(userId, startDate, endDate),
    reportsRepo.getTransferOutByAccount(userId, startDate, endDate),
    reportsRepo.getTransferInByAccount(userId, startDate, endDate),
    reportsRepo.getTransactionsForCashFlow(userId, startDate, endDate),
    accountRepo.findAllAccounts(userId, true),
    categoryRepo.findAllCategories(userId),
  ]);

  const totalIncome = typeSums.find((s) => s.type === 'INCOME')?._sum.amount ?? 0;
  const totalExpense = typeSums.find((s) => s.type === 'EXPENSE')?._sum.amount ?? 0;
  const netSavings = totalIncome - totalExpense;

  const rangeDays = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );

  const categoryMap = new Map<string, { name: string; color: string | null }>();
  for (const parent of categories) {
    categoryMap.set(parent.id, { name: parent.name, color: parent.color });
    for (const child of parent.children) {
      categoryMap.set(child.id, { name: child.name, color: child.color });
    }
  }

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const enrichCategories = (
    stats: { categoryId: string | null; _sum: { amount: number | null }; _count: { _all: number } }[],
    total: number
  ) =>
    stats
      .filter((s) => s.categoryId)
      .map((s) => ({
        categoryId: s.categoryId!,
        name: categoryMap.get(s.categoryId!)?.name ?? 'Unknown',
        color: categoryMap.get(s.categoryId!)?.color ?? null,
        amount: s._sum.amount ?? 0,
        count: s._count._all,
        percentage: total > 0 ? Math.round(((s._sum.amount ?? 0) / total) * 1000) / 10 : 0,
      }));

  const accountStats = new Map<
    string,
    { income: number; expense: number; transferIn: number; transferOut: number; count: number }
  >();

  for (const row of accountActivity) {
    const entry = accountStats.get(row.accountId) ?? {
      income: 0,
      expense: 0,
      transferIn: 0,
      transferOut: 0,
      count: 0,
    };
    if (row.type === 'INCOME') entry.income += row._sum.amount ?? 0;
    if (row.type === 'EXPENSE') entry.expense += row._sum.amount ?? 0;
    entry.count += row._count._all;
    accountStats.set(row.accountId, entry);
  }

  for (const row of transferOut) {
    const entry = accountStats.get(row.accountId) ?? {
      income: 0,
      expense: 0,
      transferIn: 0,
      transferOut: 0,
      count: 0,
    };
    entry.transferOut += row._sum.amount ?? 0;
    entry.count += row._count._all;
    accountStats.set(row.accountId, entry);
  }

  for (const row of transferIn) {
    if (!row.toAccountId) continue;
    const entry = accountStats.get(row.toAccountId) ?? {
      income: 0,
      expense: 0,
      transferIn: 0,
      transferOut: 0,
      count: 0,
    };
    entry.transferIn += row._sum.amount ?? 0;
    entry.count += row._count._all;
    accountStats.set(row.toAccountId, entry);
  }

  const byAccount = [...accountStats.entries()]
    .map(([accountId, stats]) => ({
      accountId,
      name: accountMap.get(accountId)?.name ?? 'Unknown',
      ...stats,
      net: stats.income - stats.expense,
    }))
    .sort((a, b) => b.expense - a.expense);

  return {
    period: { startDate, endDate, groupBy },
    summary: {
      totalIncome,
      totalExpense,
      netSavings,
      transactionCount: txCount,
      avgDailySpending: Math.round((totalExpense / rangeDays) * 100) / 100,
      savingsRate: totalIncome > 0 ? Math.round((netSavings / totalIncome) * 1000) / 10 : 0,
    },
    incomeByCategory: enrichCategories(incomeCategories, totalIncome),
    expenseByCategory: enrichCategories(expenseCategories, totalExpense),
    byAccount,
    cashFlow: buildCashFlowSeries(cashFlowRows, groupBy),
  };
}
