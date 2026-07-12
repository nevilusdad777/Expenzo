export type ReportGroupBy = 'day' | 'week' | 'month';

export interface ReportCategoryStat {
  categoryId: string;
  name: string;
  color: string | null;
  amount: number;
  count: number;
  percentage: number;
}

export interface ReportAccountStat {
  accountId: string;
  name: string;
  income: number;
  expense: number;
  transferIn: number;
  transferOut: number;
  count: number;
  net: number;
}

export interface CashFlowPoint {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  transactionCount: number;
  avgDailySpending: number;
  savingsRate: number;
}

export interface FullReport {
  period: { startDate: string; endDate: string; groupBy: ReportGroupBy };
  summary: ReportSummary;
  incomeByCategory: ReportCategoryStat[];
  expenseByCategory: ReportCategoryStat[];
  byAccount: ReportAccountStat[];
  cashFlow: CashFlowPoint[];
}
