import { Card } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import { IconType } from 'react-icons';

interface SummaryCardProps {
  label: string;
  amount: number;
  icon: IconType;
  variant: 'success' | 'danger';
}

export function SummaryCard({ label, amount, icon: Icon, variant }: SummaryCardProps) {
  const colorClass = variant === 'success' ? 'text-success' : 'text-danger';
  const bgClass = variant === 'success' ? 'bg-success-muted' : 'bg-danger-muted';

  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${bgClass}`}>
          <Icon className={colorClass} size={18} />
        </div>
        <div>
          <p className="text-xs text-text-secondary">{label}</p>
          <p className="text-lg font-semibold text-text-primary">{formatCurrency(amount)}</p>
        </div>
      </div>
    </Card>
  );
}
