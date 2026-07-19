import { FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { useDashboardSummary, useMonthlyTrend } from '@/hooks/queries/useDashboard';
import { BalanceCard } from './BalanceCard';
import { SummaryCard } from './SummaryCard';
import { RecentTransactionsList } from './RecentTransactionsList';
import { CategoryPieChart } from './CategoryPieChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { AccountBalancesList } from './AccountBalancesList';

export function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const { data: summary, isLoading, isError } = useDashboardSummary();
  const { data: trend } = useMonthlyTrend(currentYear);

  // Only show full-page spinner on true first load (no cached data)
  // When data comes from cache, show it immediately while refreshing silently
  if (isLoading && !summary) {
    return (
      <div className="flex h-48 items-center justify-center">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError && !summary) {
    return (
      <div className="text-sm text-danger">
        Failed to load dashboard. Check your connection to the backend.
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6 pb-6 overflow-hidden">
      <BalanceCard totalBalance={summary.totalBalance} netSavings={summary.netSavings} />

      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        <SummaryCard
          label="Income (This Month)"
          amount={summary.monthlyIncome}
          icon={FiArrowUpCircle}
          variant="success"
        />
        <SummaryCard
          label="Expense (This Month)"
          amount={summary.monthlyExpense}
          icon={FiArrowDownCircle}
          variant="danger"
        />
      </div>

      {trend && (
        <div className="min-w-0">
          <MonthlyTrendChart data={trend} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="min-w-0">
          <CategoryPieChart data={summary.topExpenseCategories} />
        </div>
        <div className="min-w-0">
          <RecentTransactionsList transactions={summary.recentTransactions} />
        </div>
      </div>

      <div className="min-w-0">
        <AccountBalancesList />
      </div>
    </div>
  );
}
