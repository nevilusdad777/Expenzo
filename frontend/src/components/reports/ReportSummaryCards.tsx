import { Card } from '@/components/ui';
import { ReportSummary } from '@/types/reports.types';
import { formatCurrency } from '@/utils/formatters';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  const cards = [
    { label: 'Total Income', value: formatCurrency(summary.totalIncome), color: 'text-success' },
    { label: 'Total Expense', value: formatCurrency(summary.totalExpense), color: 'text-danger' },
    {
      label: 'Net Savings',
      value: formatCurrency(summary.netSavings),
      color: summary.netSavings >= 0 ? 'text-success' : 'text-danger',
    },
    { label: 'Transactions', value: String(summary.transactionCount), color: 'text-text-primary' },
    {
      label: 'Avg Daily Spend',
      value: formatCurrency(summary.avgDailySpending),
      color: 'text-text-primary',
    },
    { label: 'Savings Rate', value: `${summary.savingsRate}%`, color: 'text-text-primary' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} padding="sm">
          <p className="text-xs text-text-secondary">{card.label}</p>
          <p className={`mt-1 text-lg font-semibold ${card.color}`}>{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
