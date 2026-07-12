import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui';
import { YearlySummaryYear } from '@/types/charts.types';
import { formatCurrency } from '@/utils/formatters';

export function YearlyComparisonBarChart({ years }: { years: YearlySummaryYear[] }) {
  const chartData = years.map((y) => ({
    year: y.year,
    income: y.totalIncome,
    expense: y.totalExpense,
    net: y.netSavings,
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-medium text-text-secondary">Yearly Comparison</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {/* We render a bar chart for income/expense, and a separate line for net savings */}
          <BarChart data={chartData} barCategoryGap={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262f" />
            <XAxis dataKey="year" stroke="#71717a" fontSize={12} />
            <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{
                background: '#1c1c26',
                border: '1px solid #26262f',
                borderRadius: 8,
              }}
            />
            <Legend />
            <Bar dataKey="income" name="Income" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-text-muted">
        Net savings is shown in summary cards above (stacked chart focuses on income vs expense).
      </p>
    </Card>
  );
}

