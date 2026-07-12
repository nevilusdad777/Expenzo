import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui';
import type { MonthlyTrendPoint } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function MonthlyExpenseAreaChart({ data }: { data: MonthlyTrendPoint[] }) {
  const chartData = data.map((d) => ({ ...d, label: MONTH_LABELS[d.month - 1] }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-medium text-text-secondary">Monthly Spending</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262f" />
            <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
            <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{
                background: '#1c1c26',
                border: '1px solid #26262f',
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              fill="rgba(239, 68, 68, 0.15)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

