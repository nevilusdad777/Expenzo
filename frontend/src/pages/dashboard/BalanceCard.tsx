import { useNavigate } from 'react-router-dom';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { formatCurrency } from '@/utils/formatters';

interface BalanceCardProps {
  totalBalance: number;
  netSavings: number;
}

export function BalanceCard({ totalBalance, netSavings }: BalanceCardProps) {
  const navigate = useNavigate();
  const isPositive = netSavings >= 0;

  return (
    <section className="glass-panel rounded-lg p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-tertiary/10 opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
            Total Balance
          </p>
          <h1 className="text-4xl font-bold text-white mb-3">
            {formatCurrency(totalBalance)}
          </h1>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <FiArrowUp className="text-tertiary" size={14} />
              <span className="text-sm font-medium text-tertiary">
                {isPositive ? '+' : ''}{formatCurrency(netSavings)} this month
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/transactions/new?type=INCOME')}
            className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-on-primary rounded-full font-semibold text-sm hover:bg-primary/95 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(196,192,255,0.4)]"
          >
            Add Income
          </button>
          <button
            onClick={() => navigate('/transactions/new?type=EXPENSE')}
            className="flex-1 md:flex-none px-6 py-2.5 glass-panel text-primary rounded-full font-semibold text-sm hover:bg-white/5 transition-all hover:scale-105 active:scale-95 border-primary/30"
          >
            Add Expense
          </button>
        </div>
      </div>
    </section>
  );
}
