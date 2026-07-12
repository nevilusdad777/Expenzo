import { Card, Badge } from '@/components/ui';
import { Transaction } from '@/types/dashboard.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface RecentTransactionsListProps {
  transactions: Transaction[];
}

const typeBadge = {
  INCOME: { variant: 'success' as const, label: 'Income' },
  EXPENSE: { variant: 'danger' as const, label: 'Expense' },
  TRANSFER: { variant: 'neutral' as const, label: 'Transfer' },
};

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <Card padding="none">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="text-sm font-medium text-text-secondary">Recent Transactions</h3>
      </div>
      <div className="scrollbar-thin max-h-80 overflow-y-auto">
        {transactions.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-text-muted">No transactions yet.</p>
        )}
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between border-t border-border px-4 py-3 first:border-t-0"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                {tx.description || tx.category?.name || tx.account.name}
              </span>
              <span className="text-xs text-text-muted">
                {formatDate(tx.date)} · {tx.account.name}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className={`text-sm font-semibold ${
                  tx.type === 'INCOME'
                    ? 'text-success'
                    : tx.type === 'EXPENSE'
                      ? 'text-danger'
                      : 'text-text-secondary'
                }`}
              >
                {tx.type === 'EXPENSE' ? '-' : tx.type === 'INCOME' ? '+' : ''}
                {formatCurrency(tx.amount)}
              </span>
              <Badge variant={typeBadge[tx.type].variant}>{typeBadge[tx.type].label}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
