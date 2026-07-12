import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui';
import { CategoryStat } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

interface CategoryPieChartProps {
  data: CategoryStat[];
}

const FALLBACK_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#22c55e'];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-text-secondary">Top Categories</h3>
        <p className="mt-6 text-center text-sm text-text-muted">No expenses recorded this month.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-2 text-sm font-medium text-text-secondary">Top Categories</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.categoryId}
                  fill={entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{ background: '#1c1c26', border: '1px solid #26262f', borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {data.map((entry, index) => (
          <div key={entry.categoryId} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
            />
            {entry.name}
          </div>
        ))}
      </div>
    </Card>
  );
}
