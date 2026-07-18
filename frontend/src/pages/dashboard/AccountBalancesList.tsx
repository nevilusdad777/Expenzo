import { useAccounts } from '@/hooks/queries/useAccounts';
import { formatCurrency } from '@/utils/formatters';

export function AccountBalancesList() {
  const { data: accounts, isLoading, isError } = useAccounts(false);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <p className="text-sm text-on-surface-variant">Loading accounts…</p>
      </div>
    );
  }

  if (isError || !accounts) {
    return (
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <p className="text-sm text-error">Failed to load account balances.</p>
      </div>
    );
  }

  const sorted = [...accounts].sort((a, b) => b.balance - a.balance);

  return (
    <section className="glass-panel rounded-xl overflow-hidden border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(196,192,255,0.08)]">
      <div className="p-4 border-b border-white/5 bg-white/[0.01]">
        <h3 className="text-base font-bold text-white">Account Balances</h3>
      </div>
      
      {sorted.length === 0 ? (
        <p className="p-6 text-center text-sm text-on-surface-variant">No accounts yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-white/5">
          {sorted.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-semibold text-white">{account.name}</span>
              <span className="text-sm font-bold text-tertiary">
                {formatCurrency(account.balance)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
