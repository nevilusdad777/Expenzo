import { useMemo, useState } from 'react';
import { FiArrowRightCircle, FiRepeat } from 'react-icons/fi';
import { Button, Card, Input } from '@/components/ui';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCreateTransaction } from '@/hooks/queries/useTransactions';

export function TransferPage() {
  const { data: accounts, isLoading, isError } = useAccounts(false);
  const transferMutation = useCreateTransaction();

  const options = useMemo(() => accounts ?? [], [accounts]);

  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('0');
  const [description, setDescription] = useState('');

  const canSubmit =
    fromAccountId.length > 0 &&
    toAccountId.length > 0 &&
    fromAccountId !== toAccountId &&
    Number(amount) > 0;

  if (isLoading) return <div className="text-sm text-text-secondary">Loading…</div>;
  if (isError || !accounts) return <div className="text-sm text-danger">Failed to load accounts.</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Transfer</h1>
        <p className="text-sm text-text-secondary">
          Move money between accounts. This creates a single TRANSFER transaction.
        </p>
      </div>

      <Card elevated className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">From</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select an account</option>
              {options.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">To</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select an account</option>
              {options.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Move to Savings"
          />
        </div>

        {transferMutation.error ? (
          <p className="text-sm text-danger">{transferMutation.error.message}</p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setFromAccountId('');
              setToAccountId('');
              setAmount('0');
              setDescription('');
            }}
            disabled={transferMutation.isPending}
          >
            <FiRepeat />
            Reset
          </Button>
          <Button
            onClick={() => {
              transferMutation.mutate({
                type: 'TRANSFER',
                amount: Number(amount),
                date: new Date(),
                accountId: fromAccountId,
                toAccountId,
                ...(description.trim() ? { description: description.trim() } : {}),
                tags: [],
              });
            }}
            disabled={!canSubmit || transferMutation.isPending}
            isLoading={transferMutation.isPending}
          >
            <FiArrowRightCircle />
            Transfer
          </Button>
        </div>
      </Card>
    </div>
  );
}

