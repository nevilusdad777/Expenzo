import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui';
import { CategoryTrendResponse } from '@/types/charts.types';
import { formatCurrency } from '@/utils/formatters';

const FALLBACK_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6'];

export function CategoryTrendLineChart({ data }: { data: CategoryTrendResponse }) {
  const seriesKeys = data.categories.map((c) => c.categoryId);
  const chartData = data.data.map((p) => ({
    month: p.month,
    ...p.amounts,
  }));

  return (
    <Card>
      <h3 className="mb-4 text-sm font-medium text-text-secondary">
        Category Trend — {data.type === 'INCOME' ? 'Income' : 'Expense'} ({data.year})
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis
              dataKey="month"
              stroke="#71717a"
              fontSize={12}
              tickFormatter={(v) => String(v)}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{
                background: '#1c1c26',
                border: '1px solid #26262f',
                borderRadius: 8,
              }}
            />
            <Legend />
            {seriesKeys.map((key, idx) => {
              const cat = data.categories[idx];
              const color = cat?.color ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={cat?.name ?? key}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

