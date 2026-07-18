import { formatCurrency } from '@/utils/formatters';
import { IconType } from 'react-icons';

interface SummaryCardProps {
  label: string;
  amount: number;
  icon: IconType;
  variant: 'success' | 'danger';
}

export function SummaryCard({ label, amount, icon: Icon, variant }: SummaryCardProps) {
  const isSuccess = variant === 'success';
  const colorClass = isSuccess ? 'text-tertiary' : 'text-error';
  const bgClass = isSuccess ? 'bg-tertiary/10 border-tertiary/20' : 'bg-error/10 border-error/20';
  const hoverClass = isSuccess ? 'hover:border-tertiary/30' : 'hover:border-error/30';

  return (
    <div className={`glass-panel rounded-lg p-4 flex flex-col gap-3 transition-all hover:scale-105 duration-200 border ${hoverClass}`}>
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${bgClass} ${colorClass}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-on-surface-variant font-medium">{label}</p>
        <p className="text-xl font-bold text-white mt-1">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}
