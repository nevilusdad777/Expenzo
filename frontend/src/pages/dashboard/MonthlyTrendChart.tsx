import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { MonthlyTrendPoint } from '@/types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = data.map((d) => ({ ...d, label: MONTH_LABELS[d.month - 1] }));

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(196,192,255,0.08)]">
      <h3 className="mb-4 text-base font-bold text-white">
        Cash Flow — Income vs Expense
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4cd7f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4cd7f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c4c0ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#c4c0ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
            <XAxis dataKey="label" stroke="#918fa1" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#918fa1"
              fontSize={11}
              tickFormatter={(v) => `${v / 1000}k`}
              tickLine={false}
              axisLine={false}
            />
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
            <Area
              type="monotone"
              dataKey="income"
              stroke="#4cd7f6"
              fill="url(#incomeGradient)"
              strokeWidth={2.5}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#c4c0ff"
              fill="url(#expenseGradient)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
