import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui';
import { CashFlowPoint } from '@/types/reports.types';
import { formatCurrency } from '@/utils/formatters';

interface CashFlowReportChartProps {
  data: CashFlowPoint[];
}

export function CashFlowReportChart({ data }: CashFlowReportChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-text-secondary">Cash Flow</h3>
        <p className="mt-6 text-center text-sm text-text-muted">No income or expense in this period.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-medium text-text-secondary">Cash Flow Report</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="reportIncomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="reportExpenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#26262f" />
            <XAxis dataKey="period" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value ?? 0))}
              contentStyle={{ background: '#1c1c26', border: '1px solid #26262f', borderRadius: 8 }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              fill="url(#reportIncomeGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              fill="url(#reportExpenseGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
