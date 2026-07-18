import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAccounts } from '@/hooks/queries/useAccounts';
import { useCategories } from '@/hooks/queries/useCategories';
import { useDeleteTransaction, useTransactions } from '@/hooks/queries/useTransactions';
import type { Transaction, TransactionType } from '@/types/transaction.types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { DatePreset, getDateRange } from '@/utils/dateRanges';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';

function TransactionRow({
  tx,
  onDelete,
  deleting,
}: {
  tx: Transaction;
  onDelete: () => void;
  deleting: boolean;
}) {
  const navigate = useNavigate();
  const title = tx.description || tx.category?.name || tx.account.name;
  const subtitle =
    tx.type === 'TRANSFER' && tx.toAccount
      ? `${tx.account.name} → ${tx.toAccount.name}`
      : `${tx.category?.name || 'Uncategorized'} • ${tx.account.name}`;

  const isIncome = tx.type === 'INCOME';
  const isExpense = tx.type === 'EXPENSE';
  const amountColor = isIncome ? 'text-tertiary' : isExpense ? 'text-error' : 'text-white';
  
  const catInitial = (tx.category?.name || tx.account.name)[0].toUpperCase();
  const catBg = tx.category?.color || '#353437';

  return (
    <div className="glass-panel rounded-lg p-4 flex items-center justify-between hover:bg-white/[0.03] transition-all group cursor-pointer relative overflow-hidden border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10 min-w-0 flex-1">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-base shadow-inner border border-white/10"
          style={{ backgroundColor: `${catBg}25`, color: catBg }}
        >
          {tx.type === 'TRANSFER' ? <FiPlus className="rotate-45" /> : catInitial}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold text-white truncate">{title}</p>
          <p className="text-xs text-on-surface-variant mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10 flex-shrink-0">
        <div className="text-right">
          <p className={`text-base font-bold ${amountColor}`}>
            {isExpense ? '-' : isIncome ? '+' : ''}
            {formatCurrency(tx.amount)}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-1">{formatDate(tx.date)}</p>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Link to={`/transactions/${tx.id}/edit`} onClick={(e) => e.stopPropagation()}>
            <button className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-primary transition-all active:scale-95 border border-transparent hover:border-white/5">
              <FiEdit2 size={14} />
            </button>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={deleting}
            className="p-2 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-error transition-all active:scale-95 border border-transparent hover:border-white/5 disabled:opacity-50"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TransactionsPage() {
  const navigate = useNavigate();
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
    <div className="space-y-6 pb-6 relative">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-on-surface-variant mt-1">Search, filter, and manage all your cash flow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/transactions/new?type=INCOME">
            <button className="px-4 py-2 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-full font-semibold text-xs hover:bg-tertiary/20 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(76,215,246,0.15)]">
              + Income
            </button>
          </Link>
          <Link to="/transactions/new?type=EXPENSE">
            <button className="px-4 py-2 bg-error/10 text-error border border-error/20 rounded-full font-semibold text-xs hover:bg-error/20 transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(255,180,171,0.15)]">
              + Expense
            </button>
          </Link>
          <Link to="/transactions/new?type=TRANSFER">
            <button className="px-4 py-2 bg-primary text-on-primary rounded-full font-semibold text-xs hover:bg-primary/95 transition-all hover:scale-105 active:scale-95 flex items-center gap-1 shadow-[0_0_15px_rgba(196,192,255,0.4)]">
              <FiPlus />
              Transfer
            </button>
          </Link>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-4 border border-white/10">
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
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="glass-panel rounded-xl p-6 text-center border border-white/10">
            <p className="text-sm text-on-surface-variant animate-pulse">Loading transactions…</p>
          </div>
        ) : isError ? (
          <div className="glass-panel rounded-xl p-6 text-center border border-white/10">
            <p className="text-sm text-error">Failed to load transactions.</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="glass-panel rounded-xl p-6 text-center border border-white/10">
            <p className="text-sm text-on-surface-variant">No transactions match your filters.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                deleting={deleteMutation.isPending}
                onDelete={() => handleDelete(tx)}
              />
            ))}
          </div>
        )}
      </div>

      {hasNextPage ? (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm rounded-full transition-all border border-white/10 active:scale-95 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load more'}
          </button>
        </div>
      ) : null}

      {/* Floating Action Button (FAB) on Page */}
      <button
        onClick={() => navigate('/transactions/new')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(196,192,255,0.4)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group md:hidden"
      >
        <FiPlus className="text-2xl group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}
