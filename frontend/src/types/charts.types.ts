export type ChartType = 'INCOME' | 'EXPENSE';

export interface CategoryTrendCategory {
  categoryId: string;
  name: string;
  color: string | null;
}

export interface CategoryTrendPoint {
  month: number;
  amounts: Record<string, number>;
}

export interface CategoryTrendResponse {
  year: number;
  type: ChartType;
  categories: CategoryTrendCategory[];
  data: CategoryTrendPoint[];
}

export interface AccountBalanceTrendAccount {
  accountId: string;
  name: string;
  color: string | null;
}

export interface AccountBalanceTrendPoint {
  month: number;
  balances: Record<string, number>;
}

export interface AccountBalanceTrendResponse {
  year: number;
  accounts: AccountBalanceTrendAccount[];
  data: AccountBalanceTrendPoint[];
}

export interface YearlySummaryYear {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  avgDailySpending: number;
  savingsRate: number;
}

export interface YearlySummaryResponse {
  years: YearlySummaryYear[];
}

