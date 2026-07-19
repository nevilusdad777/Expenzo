import { useMemo } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCategories } from '@/hooks/queries/useCategories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/queries/useTransactions';
import type { Category } from '@/types/category.types';
import type { Transaction, TransactionType } from '@/types/transaction.types';
import { toDateInputValue } from '@/utils/dateRanges';
import { useState } from 'react';
import { FiInfo } from 'react-icons/fi';

const OTHER_CATEGORY_NAME = 'Other';

// Examples shown when user picks "Other" category
const OTHER_EXAMPLES: Record<'INCOME' | 'EXPENSE', string[]> = {
  INCOME: [
    'Received money from friend',
    'Borrowed cash repaid',
    'Sold personal item',
    'Cashback / reward',
    'Found money',
  ],
  EXPENSE: [
    'Lent money to friend',
    'Gave money to family',
    'Miscellaneous expense',
    'Cash gift given',
    'Unexpected cost',
  ],
};

function flattenCategories(categories: Category[]): Array<{ id: string; label: string; name: string }> {
  const options: Array<{ id: string; label: string; name: string }> = [];
  for (const parent of categories) {
    options.push({ id: parent.id, label: parent.name, name: parent.name });
    for (const child of parent.children ?? []) {
      options.push({ id: child.id, label: `  ${child.name}`, name: child.name });
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

  // Detect if "Other" is the selected category
  const selectedCategoryName = categoryOptions.find((c) => c.id === categoryId)?.name ?? '';
  const isOtherSelected = selectedCategoryName === OTHER_CATEGORY_NAME;
  const otherExamples =
    type === 'INCOME' ? OTHER_EXAMPLES.INCOME : OTHER_EXAMPLES.EXPENSE;

  const tags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const amountNum = Number(amount);
  const canSubmit =
    amountNum > 0 &&
    accountId.length > 0 &&
    description.trim().length > 0 &&
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
      description: description.trim(),
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

        {/* "Other" category helper — shown when user selects Other */}
        {isOtherSelected && type !== 'TRANSFER' && (
          <div className="md:col-span-2">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-primary">
                <FiInfo size={14} className="shrink-0" />
                <span className="text-xs font-semibold">
                  You selected "Other" — please describe this {type === 'INCOME' ? 'income' : 'expense'} in the Description field below
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-on-surface-variant font-medium mr-1">Quick fill:</span>
                {otherExamples.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setDescription(ex)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 text-on-surface-variant hover:text-primary transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Input
          label="Description *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isOtherSelected
              ? type === 'INCOME'
                ? 'e.g. Received money from friend, sold old phone...'
                : 'e.g. Lent money to friend, gave cash to family...'
              : 'e.g., Coffee, grocery shopping...'
          }
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
