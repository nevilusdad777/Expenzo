import { useNavigate } from 'react-router-dom';
import { FiArrowDownCircle, FiArrowUpCircle } from 'react-icons/fi';
import { useDashboardSummary, useMonthlyTrend } from '@/hooks/queries/useDashboard';
import { BalanceCard } from './BalanceCard';
import { SummaryCard } from './SummaryCard';
import { RecentTransactionsList } from './RecentTransactionsList';
import { CategoryPieChart } from './CategoryPieChart';
import { MonthlyTrendChart } from './MonthlyTrendChart';
import { AccountBalancesList } from './AccountBalancesList';
import { Button } from '@/components/ui';

export function DashboardPage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { data: summary, isLoading, isError } = useDashboardSummary();
  const { data: trend } = useMonthlyTrend(currentYear);

  if (isLoading) {
    return <div className="text-sm text-text-secondary">Loading dashboard…</div>;
  }

  if (isError || !summary) {
    return (
      <div className="text-sm text-danger">
        Failed to load dashboard. Check your connection to the backend.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <BalanceCard totalBalance={summary.totalBalance} netSavings={summary.netSavings} />

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
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
        <div className="grid grid-cols-1 gap-6">
          <MonthlyTrendChart data={trend} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryPieChart data={summary.topExpenseCategories} />
        <RecentTransactionsList transactions={summary.recentTransactions} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AccountBalancesList />
      </div>
    </div>
  );
}
