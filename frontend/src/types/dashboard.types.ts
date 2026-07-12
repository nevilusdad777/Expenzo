export interface CategoryStat {
  categoryId: string;
  name: string;
  color: string | null;
  amount: number;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  date: string;
  description: string | null;
  account: { id: string; name: string; icon: string | null };
  toAccount: { id: string; name: string } | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  recentTransactions: Transaction[];
  highestExpense: Transaction | null;
  highestIncome: Transaction | null;
  topExpenseCategories: CategoryStat[];
  topIncomeCategories: CategoryStat[];
}

export interface MonthlyTrendPoint {
  month: number;
  income: number;
  expense: number;
}
