import { Card } from '@/components/ui';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { formatCurrency } from '@/utils/formatters';

export function AccountBalancesList() {
  const { data: accounts, isLoading, isError } = useAccounts(false);

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-text-secondary">Loading accounts…</p>
      </Card>
    );
  }

  if (isError || !accounts) {
    return (
      <Card>
        <p className="text-sm text-danger">Failed to load account balances.</p>
      </Card>
    );
  }

  const sorted = [...accounts].sort((a, b) => b.balance - a.balance);

  return (
    <Card padding="none">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-text-secondary">Account Balances</h3>
      </div>
      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-text-muted">No accounts yet.</p>
      ) : (
        sorted.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between border-t border-border px-4 py-3 first:border-t-0"
          >
            <span className="text-sm font-medium text-text-primary">{account.name}</span>
            <span className="text-sm font-semibold text-text-primary">
              {formatCurrency(account.balance)}
            </span>
          </div>
        ))
      )}
    </Card>
  );
}
