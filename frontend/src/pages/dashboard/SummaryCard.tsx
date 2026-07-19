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
    <div className={`glass-panel rounded-lg p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 transition-all hover:scale-105 duration-200 border ${hoverClass}`}>
      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center ${bgClass} ${colorClass}`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs text-on-surface-variant font-medium truncate" title={label}>{label}</p>
        <p className="text-base sm:text-xl font-bold text-white mt-0.5 sm:mt-1">{formatCurrency(amount)}</p>
      </div>
    </div>
  );
}
