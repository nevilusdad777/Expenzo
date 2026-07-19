import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryStat } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

interface CategoryPieChartProps {
  data: CategoryStat[];
}

const FALLBACK_COLORS = ['#c4c0ff', '#4cd7f6', '#adc6ff', '#acedff', '#ffb4ab'];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] border border-white/10">
        <h3 className="text-base font-bold text-white mb-2 self-start">Expense Categories</h3>
        <p className="text-sm text-on-surface-variant my-auto">No expenses recorded this month.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(196,192,255,0.08)]">
      <h3 className="text-base font-bold text-white mb-4">Expense Categories (This Month)</h3>
      
      <div className="h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              stroke="rgba(19, 19, 21, 0.5)"
              strokeWidth={2}
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
              contentStyle={{
                background: 'rgba(19, 19, 21, 0.85)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                color: '#e5e1e4',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut Chart */}
        <div className="absolute flex flex-col items-center justify-center text-center p-2 w-[100px] pointer-events-none">
          <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">Top Category</span>
          <span className="text-xs sm:text-sm font-bold text-white mt-0.5 break-words line-clamp-2 leading-tight w-full">
            {data[0]?.name || 'None'}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {data.map((entry, index) => (
          <div
            key={entry.categoryId}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 text-xs text-on-surface-variant"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: entry.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
            />
            <span className="font-medium text-white">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
