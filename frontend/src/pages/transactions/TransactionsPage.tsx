import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Badge, Button, Card } from '@/components/ui';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCategories } from '@/hooks/queries/useCategories';
import { useDeleteTransaction, useTransactions } from '@/hooks/queries/useTransactions';
import type { Transaction, TransactionType } from '@/types/transaction.types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { DatePreset, getDateRange } from '@/utils/dateRanges';

const typeBadge = {
  INCOME: { variant: 'success' as const, label: 'Income' },
  EXPENSE: { variant: 'danger' as const, label: 'Expense' },
  TRANSFER: { variant: 'neutral' as const, label: 'Transfer' },
};

function TransactionRow({
  tx,
  onDelete,
  deleting,
}: {
  tx: Transaction;
  onDelete: () => void;
  deleting: boolean;
}) {
  const title = tx.description || tx.category?.name || tx.account.name;
  const subtitle =
    tx.type === 'TRANSFER' && tx.toAccount
      ? `${tx.account.name} → ${tx.toAccount.name}`
      : `${formatDate(tx.date)} · ${tx.account.name}`;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-primary">{title}</p>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <p
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
          </p>
          <Badge variant={typeBadge[tx.type].variant}>{typeBadge[tx.type].label}</Badge>
        </div>

        <Link to={`/transactions/${tx.id}/edit`}>
          <Button variant="ghost" size="sm">
            <FiEdit2 />
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={onDelete} disabled={deleting}>
          <FiTrash2 />
        </Button>
      </div>
    </div>
  );
}

export function TransactionsPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');

  const { data: accounts } = useAccounts(false);
  const { data: categories } = useCategories();

  const range = useMemo(
    () => getDateRange(datePreset, customStart, customEnd),
    [datePreset, customStart, customEnd]
  );

  const query = useMemo(
    () => ({
      limit: 25,
      ...(type ? { type } : {}),
      ...(accountId ? { accountId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(range.startDate ? { startDate: range.startDate.toISOString() } : {}),
      ...(range.endDate ? { endDate: range.endDate.toISOString() } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    [type, accountId, categoryId, range, search]
  );

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTransactions(query);

  const deleteMutation = useDeleteTransaction();

  const transactions = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const handleDelete = (tx: Transaction) => {
    if (!window.confirm(`Delete this ${tx.type.toLowerCase()} transaction? Balances will be reversed.`)) {
      return;
    }

    deleteMutation.mutate(tx.id, {
      onSuccess: () => toast.success('Transaction deleted'),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Transactions</h1>
          <p className="text-sm text-text-secondary">Search, filter, and manage all your money movement.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/transactions/new?type=INCOME">
            <Button variant="secondary" size="sm">
              + Income
            </Button>
          </Link>
          <Link to="/transactions/new?type=EXPENSE">
            <Button variant="danger" size="sm">
              + Expense
            </Button>
          </Link>
          <Link to="/transactions/new?type=TRANSFER">
            <Button size="sm">
              <FiPlus />
              Add
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <TransactionFilters
          datePreset={datePreset}
          onDatePresetChange={setDatePreset}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          type={type}
          onTypeChange={setType}
          accountId={accountId}
          onAccountChange={setAccountId}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          search={search}
          onSearchChange={setSearch}
          accounts={accounts ?? []}
          categories={categories ?? []}
        />
      </Card>

      <Card padding="none">
        {isLoading ? (
          <p className="px-4 py-6 text-center text-sm text-text-muted">Loading transactions…</p>
        ) : isError ? (
          <p className="px-4 py-6 text-center text-sm text-danger">Failed to load transactions.</p>
        ) : transactions.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-muted">No transactions match your filters.</p>
        ) : (
          transactions.map((tx) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              deleting={deleteMutation.isPending}
              onDelete={() => handleDelete(tx)}
            />
          ))
        )}
      </Card>

      {hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => void fetchNextPage()}
            isLoading={isFetchingNextPage}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
