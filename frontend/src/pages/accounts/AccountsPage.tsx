import { useMemo, useState } from 'react';
import { FiArchive, FiEdit2, FiPlus, FiTrash2, FiZap, FiRefreshCw } from 'react-icons/fi';
import { Badge, Button, Card, Input } from '@/components/ui';
import { formatCurrency } from '@/utils/formatters';
import {
  useAccounts,
  useArchiveAccount,
  useCreateAccount,
  useDeleteAccount,
  useUnarchiveAccount,
  useUpdateAccount,
} from '@/hooks/queries/useAccounts';
import type { Account, AccountType } from '@/types/account.types';

const ACCOUNT_TYPES: Array<{ value: AccountType; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'OTHER', label: 'Other' },
];

function typeLabel(type: AccountType) {
  return ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type;
}

function AccountRow({
  account,
  onEdit,
  onArchiveToggle,
  onDelete,
  busy,
}: {
  account: Account;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-text-primary">{account.name}</span>
          {account.isArchived ? <Badge variant="neutral">Archived</Badge> : null}
        </div>
        <p className="text-xs text-text-muted">{typeLabel(account.type)}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(account.balance)}</p>
          <p className="text-xs text-text-muted">Balance</p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} disabled={busy}>
            <FiEdit2 />
          </Button>
          <Button variant="ghost" size="sm" onClick={onArchiveToggle} disabled={busy}>
            {account.isArchived ? <FiRefreshCw /> : <FiArchive />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy}>
            <FiTrash2 />
          </Button>
        </div>
      </div>
    </div>
  );
}

function AccountForm({
  initial,
  onCancel,
  onSave,
  isSaving,
}: {
  initial?: Partial<Account>;
  onCancel: () => void;
  onSave: (values: { name: string; type: AccountType; icon?: string; color?: string; balance?: number }) => void;
  isSaving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<AccountType>((initial?.type as AccountType) ?? 'OTHER');
  const [balance, setBalance] = useState(String(initial?.balance ?? 0));
  const [color, setColor] = useState(initial?.color ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '');

  const canSave = name.trim().length > 0 && Number.isFinite(Number(balance));

  return (
    <Card elevated className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {initial?.id ? 'Edit Account' : 'Create Account'}
          </h2>
          <p className="text-sm text-text-secondary">Keep balances accurate — edits snapshot balance history.</p>
        </div>
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Savings" />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Starting Balance"
          inputMode="decimal"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          placeholder="0"
        />

        <Input
          label="Color (optional)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          placeholder="#6366f1"
        />

        <Input
          label="Icon (optional)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g., 💳"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() =>
            onSave({
              name: name.trim(),
              type,
              balance: Number(balance),
              ...(color.trim() ? { color: color.trim() } : {}),
              ...(icon.trim() ? { icon: icon.trim() } : {}),
            })
          }
          disabled={!canSave || isSaving}
          isLoading={isSaving}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}

export function AccountsPage() {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: accounts, isLoading, isError } = useAccounts(includeArchived);

  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount(editing?.id ?? '');
  const archiveMutation = useArchiveAccount();
  const unarchiveMutation = useUnarchiveAccount();
  const deleteMutation = useDeleteAccount();

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    unarchiveMutation.isPending ||
    deleteMutation.isPending;

  const sorted = useMemo(() => {
    const list = accounts ?? [];
    return [...list].sort((a, b) => Number(b.balance) - Number(a.balance));
  }, [accounts]);

  if (isLoading) {
    return <div className="text-sm text-text-secondary">Loading accounts…</div>;
  }

  if (isError || !accounts) {
    return <div className="text-sm text-danger">Failed to load accounts.</div>;
  }

  const showForm = isCreating || Boolean(editing);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Accounts</h1>
          <p className="text-sm text-text-secondary">Your balances drive the dashboard totals.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIncludeArchived((v) => !v)}
          >
            <FiArchive />
            {includeArchived ? 'Hide archived' : 'Show archived'}
          </Button>
          <Button onClick={() => setIsCreating(true)} disabled={busy}>
            <FiPlus />
            Add account
          </Button>
        </div>
      </div>

      {showForm ? (
        <AccountForm
          initial={editing ?? undefined}
          isSaving={createMutation.isPending || updateMutation.isPending}
          onCancel={() => {
            setEditing(null);
            setIsCreating(false);
          }}
          onSave={(values) => {
            if (editing?.id) {
              updateMutation.mutate(values, {
                onSuccess: () => setEditing(null),
              });
              return;
            }

            createMutation.mutate(values, {
              onSuccess: () => setIsCreating(false),
            });
          }}
        />
      ) : null}

      <Card padding="none">
        <div className="flex items-center justify-between p-4 pb-2">
          <h2 className="text-sm font-medium text-text-secondary">All accounts</h2>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <FiZap />
            Sorted by balance
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-text-muted">No accounts yet. Create your first one.</p>
        ) : (
          sorted.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              busy={busy}
              onEdit={() => {
                setIsCreating(false);
                setEditing(account);
              }}
              onArchiveToggle={() => {
                if (account.isArchived) {
                  unarchiveMutation.mutate(account.id);
                } else {
                  archiveMutation.mutate(account.id);
                }
              }}
              onDelete={() => {
                deleteMutation.mutate(account.id);
              }}
            />
          ))
        )}
      </Card>
    </div>
  );
}

