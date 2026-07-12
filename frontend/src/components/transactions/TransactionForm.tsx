import { useMemo } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/queries/useTransactions';
import type { Category } from '@/types/category.types';
import type { Transaction, TransactionType } from '@/types/transaction.types';
import { toDateInputValue } from '@/utils/dateRanges';
import { useState } from 'react';

function flattenCategories(categories: Category[]): Array<{ id: string; label: string }> {
  const options: Array<{ id: string; label: string }> = [];
  for (const parent of categories) {
    options.push({ id: parent.id, label: parent.name });
    for (const child of parent.children ?? []) {
      options.push({ id: child.id, label: `  ${child.name}` });
    }
  }
  return options;
}

interface TransactionFormProps {
  mode: 'create' | 'edit';
  initialType?: TransactionType;
  transaction?: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  mode,
  initialType = 'EXPENSE',
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(transaction?.type ?? initialType);
  const [amount, setAmount] = useState(String(transaction?.amount ?? ''));
  const [date, setDate] = useState(
    transaction ? toDateInputValue(new Date(transaction.date)) : toDateInputValue(new Date())
  );
  const [accountId, setAccountId] = useState(transaction?.accountId ?? '');
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId ?? '');
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '');
  const [description, setDescription] = useState(transaction?.description ?? '');
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod ?? '');
  const [referenceNumber, setReferenceNumber] = useState(transaction?.referenceNumber ?? '');
  const [tagsInput, setTagsInput] = useState(
    transaction?.tags
      ? (() => {
          try {
            const parsed = JSON.parse(transaction.tags) as string[];
            return Array.isArray(parsed) ? parsed.join(', ') : '';
          } catch {
            return '';
          }
        })()
      : ''
  );

  const { data: accounts } = useAccounts(false);
  const categoryType = type === 'INCOME' ? 'INCOME' : type === 'EXPENSE' ? 'EXPENSE' : undefined;
  const { data: categories } = useCategories(categoryType);

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction(transaction?.id ?? '');

  const categoryOptions = useMemo(
    () => flattenCategories(categories ?? []),
    [categories]
  );

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const amountNum = Number(amount);
  const canSubmit =
    amountNum > 0 &&
    accountId.length > 0 &&
    (type === 'TRANSFER'
      ? toAccountId.length > 0 && toAccountId !== accountId
      : categoryId.length > 0);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error ?? updateMutation.error;

  const handleSubmit = () => {
    const payload = {
      type,
      amount: amountNum,
      date: new Date(date),
      accountId,
      ...(type === 'TRANSFER'
        ? { toAccountId }
        : { categoryId }),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(paymentMethod.trim() ? { paymentMethod: paymentMethod.trim() } : {}),
      ...(referenceNumber.trim() ? { referenceNumber: referenceNumber.trim() } : {}),
      tags,
    };

    if (mode === 'edit' && transaction) {
      updateMutation.mutate(payload, { onSuccess });
      return;
    }

    createMutation.mutate(payload, { onSuccess });
  };

  return (
    <Card elevated className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {mode === 'edit' ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <p className="text-sm text-text-secondary">
            {type === 'TRANSFER'
              ? 'Transfers update both account balances atomically.'
              : 'Income and expense require a category.'}
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['INCOME', 'EXPENSE', 'TRANSFER'] as const).map((t) => (
          <Button
            key={t}
            variant={type === t ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setType(t)}
            disabled={mode === 'edit'}
          >
            {t === 'INCOME' ? 'Income' : t === 'EXPENSE' ? 'Expense' : 'Transfer'}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
        />

        <Input
          label="Date & Time"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            {type === 'TRANSFER' ? 'From Account' : 'Account'}
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Select account</option>
            {(accounts ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {type === 'TRANSFER' ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">To Account</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select account</option>
              {(accounts ?? [])
                .filter((a) => a.id !== accountId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select category</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />

        <Input
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          placeholder="e.g., UPI, Cash, Card"
        />

        <Input
          label="Reference Number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder="Optional"
        />

        <Input
          label="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Comma-separated, e.g. food, lunch"
        />
      </div>

      {error ? <p className="text-sm text-danger">{error.message}</p> : null}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!canSubmit || isPending} isLoading={isPending}>
          {mode === 'edit' ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </div>
    </Card>
  );
}
