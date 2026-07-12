import { Input } from '@/components/ui';
import type { DatePreset } from '@/utils/dateRanges';
import type { TransactionType } from '@/types/transaction.types';
import type { Account } from '@/types/account.types';
import type { Category } from '@/types/category.types';

const DATE_PRESETS: Array<{ value: DatePreset; label: string }> = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'this_year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];

interface TransactionFiltersProps {
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  type: TransactionType | '';
  onTypeChange: (type: TransactionType | '') => void;
  accountId: string;
  onAccountChange: (id: string) => void;
  categoryId: string;
  onCategoryChange: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  accounts: Account[];
  categories: Category[];
}

export function TransactionFilters({
  datePreset,
  onDatePresetChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  type,
  onTypeChange,
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
  search,
  onSearchChange,
  accounts,
  categories,
}: TransactionFiltersProps) {
  const selectClass =
    'w-full rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50';

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search description, reference, payment method…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <select
          value={datePreset}
          onChange={(e) => onDatePresetChange(e.target.value as DatePreset)}
          className={selectClass}
        >
          {DATE_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select value={type} onChange={(e) => onTypeChange(e.target.value as TransactionType | '')} className={selectClass}>
          <option value="">All types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="TRANSFER">Transfer</option>
        </select>

        <select value={accountId} onChange={(e) => onAccountChange(e.target.value)} className={selectClass}>
          <option value="">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select value={categoryId} onChange={(e) => onCategoryChange(e.target.value)} className={selectClass}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          {categories.flatMap((c) =>
            (c.children ?? []).map((child) => (
              <option key={child.id} value={child.id}>
                {c.name} → {child.name}
              </option>
            ))
          )}
        </select>
      </div>

      {datePreset === 'custom' ? (
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" label="From" value={customStart} onChange={(e) => onCustomStartChange(e.target.value)} />
          <Input type="date" label="To" value={customEnd} onChange={(e) => onCustomEndChange(e.target.value)} />
        </div>
      ) : null}
    </div>
  );
}
