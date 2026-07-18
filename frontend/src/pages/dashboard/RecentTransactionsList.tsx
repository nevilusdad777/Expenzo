import { useNavigate } from 'react-router-dom';
import { Transaction } from '@/types/dashboard.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  const navigate = useNavigate();

  return (
    <section className="glass-panel rounded-xl overflow-hidden flex flex-col h-full border border-white/10">
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
        <h3 className="text-base font-bold text-white">Recent Transactions</h3>
        <button
          onClick={() => navigate('/transactions')}
          className="text-xs font-semibold text-primary hover:text-primary-container transition-colors"
        >
          View All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin max-h-80">
        {transactions.length === 0 ? (
          <p className="p-6 text-center text-sm text-on-surface-variant">No transactions yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const isExpense = tx.type === 'EXPENSE';
              const amountColor = isIncome ? 'text-tertiary' : isExpense ? 'text-error' : 'text-white';
              
              // Dynamic category indicator bubble
              const catInitial = (tx.category?.name || tx.account.name)[0].toUpperCase();
              const catBg = tx.category?.color || '#353437';

              return (
                <div
                  key={tx.id}
                  onClick={() => navigate(`/transactions`)}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors cursor-pointer group relative"
                >
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner border border-white/10"
                      style={{ backgroundColor: `${catBg}25`, color: catBg }}
                    >
                      {catInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {tx.description || tx.category?.name || 'Untitled Transaction'}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {tx.category?.name || 'Uncategorized'} • {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right relative z-10">
                    <p className={`text-sm font-bold ${amountColor}`}>
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatCurrency(tx.amount)}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 border ${
                        isIncome
                          ? 'bg-tertiary/10 text-tertiary border-tertiary/20'
                          : isExpense
                            ? 'bg-error/10 text-error border-error/20'
                            : 'bg-white/10 text-white border-white/20'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
