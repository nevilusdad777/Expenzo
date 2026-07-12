import { Card } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';

interface BalanceCardProps {
  totalBalance: number;
  netSavings: number;
}

export function BalanceCard({ totalBalance, netSavings }: BalanceCardProps) {
  const isPositive = netSavings >= 0;
  return (
    <Card elevated padding="lg" className="relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full gradient-primary opacity-20 blur-2xl" />
      <p className="text-sm text-text-secondary">Total Balance</p>
      <p className="mt-2 text-4xl font-semibold gradient-text">{formatCurrency(totalBalance)}</p>
      <p className={`mt-3 text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? '+' : ''}
        {formatCurrency(netSavings)} this month
      </p>
    </Card>
  );
}
