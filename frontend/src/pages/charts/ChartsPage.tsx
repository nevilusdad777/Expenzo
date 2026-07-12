import { useMemo, useState, type ReactNode } from 'react';
import { FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import { Card } from '@/components/ui';
import { useMonthlyTrend } from '@/hooks/queries/useDashboard';
import { useAccountBalanceTrend, useCategoryTrend, useYearlySummary } from '@/hooks/queries/useCharts';
import type { ChartType } from '@/types/charts.types';
import { YearlyComparisonBarChart } from '@/components/charts/YearlyComparisonBarChart';
import { CategoryTrendLineChart } from '@/components/charts/CategoryTrendLineChart';
import { AccountBalanceTrendLineChart } from '@/components/charts/AccountBalanceTrendLineChart';
import { CategoryTotalsPieChart } from '@/components/charts/CategoryTotalsPieChart';
import { MonthlyExpenseAreaChart } from '@/components/charts/MonthlyExpenseAreaChart';
import { MonthlyIncomeAreaChart } from '@/components/charts/MonthlyIncomeAreaChart';
import { formatCurrency } from '@/utils/formatters';

const CHART_TYPE_OPTIONS: Array<{ value: ChartType; label: string; icon: ReactNode }> = [
  { value: 'INCOME', label: 'Income', icon: <FiTrendingUp /> },
  { value: 'EXPENSE', label: 'Expense', icon: <FiTrendingDown /> },
];

export function ChartsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [categoryType, setCategoryType] = useState<ChartType>('EXPENSE');

  const startYear = currentYear - 4;

  const { data: yearlySummary, isLoading: isYearlyLoading, isError: isYearlyError } =
    useYearlySummary(startYear, currentYear);

  const selectedYearSummary = useMemo(() => {
    return yearlySummary?.years.find((y) => y.year === year) ?? null;
  }, [yearlySummary, year]);

  const {
    data: monthlyTrend,
    isLoading: isMonthlyLoading,
    isError: isMonthlyError,
  } = useMonthlyTrend(year);

  const { data: categoryTrend, isError: isCategoryError } = useCategoryTrend(year, categoryType, 5);

  const { data: accountTrend, isError: isAccountError } = useAccountBalanceTrend(year, 5);

  const pieItems = useMemo(() => {
    if (!categoryTrend) return [];
    const totalsByCategory: Record<string, number> = {};
    for (const point of categoryTrend.data) {
      for (const [categoryId, amount] of Object.entries(point.amounts)) {
        totalsByCategory[categoryId] = (totalsByCategory[categoryId] ?? 0) + Number(amount);
      }
    }

    return categoryTrend.categories
      .map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        color: c.color,
        amount: totalsByCategory[c.categoryId] ?? 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [categoryTrend]);

  const years = yearlySummary?.years ?? [];

  if (isYearlyLoading || isMonthlyLoading) {
    return <div className="text-sm text-text-secondary">Loading charts…</div>;
  }

  if (isYearlyError || isMonthlyError) {
    return <div className="text-sm text-danger">Failed to load charts.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Charts</h1>
          <p className="text-sm text-text-secondary">Trends and comparisons across time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted">Category type</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as ChartType)}
              className="rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {CHART_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card padding="sm">
          <p className="text-xs text-text-secondary">Total Income</p>
          <p className="mt-1 text-lg font-semibold text-success">
            {selectedYearSummary ? formatCurrency(selectedYearSummary.totalIncome) : formatCurrency(0)}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-text-secondary">Total Expense</p>
          <p className="mt-1 text-lg font-semibold text-danger">
            {selectedYearSummary ? formatCurrency(selectedYearSummary.totalExpense) : formatCurrency(0)}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-text-secondary">Net Savings</p>
          <p
            className={`mt-1 text-lg font-semibold ${
              (selectedYearSummary?.netSavings ?? 0) >= 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {selectedYearSummary ? formatCurrency(selectedYearSummary.netSavings) : formatCurrency(0)}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-text-secondary">Avg Daily Spending</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {selectedYearSummary ? formatCurrency(selectedYearSummary.avgDailySpending) : formatCurrency(0)}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-text-secondary">Savings Rate</p>
          <p className="mt-1 text-lg font-semibold text-text-primary">
            {selectedYearSummary ? `${selectedYearSummary.savingsRate}%` : '0%'}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-text-secondary">Cash Flow (Monthly)</p>
          <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-text-primary">
            <FiDollarSign />
            {monthlyTrend ? formatCurrency(monthlyTrend.reduce((acc, m) => acc + (m.expense ?? 0), 0)) : formatCurrency(0)}
          </p>
        </Card>
      </div>

      <YearlyComparisonBarChart years={years} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {monthlyTrend ? (
          <MonthlyIncomeAreaChart data={monthlyTrend} />
        ) : (
          <Card>
            <p className="text-sm text-text-secondary">No monthly data.</p>
          </Card>
        )}
        {monthlyTrend ? (
          <MonthlyExpenseAreaChart data={monthlyTrend} />
        ) : (
          <Card>
            <p className="text-sm text-text-secondary">No monthly data.</p>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          {categoryTrend ? (
            <CategoryTrendLineChart data={categoryTrend} />
          ) : isCategoryError ? (
            <Card>
              <p className="text-sm text-danger">Failed to load category trend.</p>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-text-secondary">Loading category trend…</p>
            </Card>
          )}

          {categoryTrend ? (
            <CategoryTotalsPieChart
              title={`Top ${categoryType === 'EXPENSE' ? 'Expense' : 'Income'} Categories (Year ${year})`}
              items={pieItems}
              emptyMessage="No category activity in this period."
            />
          ) : null}
        </div>

        <div className="space-y-4">
          {accountTrend ? (
            <AccountBalanceTrendLineChart data={accountTrend} />
          ) : isAccountError ? (
            <Card>
              <p className="text-sm text-danger">Failed to load account trend.</p>
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-text-secondary">Loading account trend…</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

