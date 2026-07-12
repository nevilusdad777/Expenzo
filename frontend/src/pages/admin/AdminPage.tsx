import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiUsers, FiActivity, FiCreditCard, FiDollarSign, FiSearch,
  FiEdit2, FiTrash2, FiKey, FiShield, FiUser, FiCheck, FiX,
  FiChevronDown, FiAlertTriangle, FiLogOut, FiMail, FiCalendar,
  FiSettings, FiEye,
} from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { apiClient } from '@/services/apiClient';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  hasGoogleAccount: boolean;
  createdAt: string;
  accountCount: number;
  transactionCount: number;
  categoryCount: number;
}

interface DetailedAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  hasGoogleAccount: boolean;
  createdAt: string;
  updatedAt: string;
  accounts: {
    id: string;
    name: string;
    type: string;
    balance: number;
    isArchived: boolean;
    createdAt: string;
  }[];
  categories: {
    id: string;
    name: string;
    type: string;
    isDefault: boolean;
  }[];
  transactions: {
    id: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    amount: number;
    date: string;
    description: string | null;
    category: { name: string; type: string } | null;
    account: { name: string } | null;
    toAccount: { name: string } | null;
  }[];
  transactionCount: number;
}

interface AdminStats {
  userCount: number;
  transactionCount: number;
  accountCount: number;
  totalBalance: number;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

const adminApi = {
  getStats: () => apiClient.get<{ success: boolean; data: AdminStats }>('/api/admin/stats').then(r => r.data.data),
  getUsers: () => apiClient.get<{ success: boolean; data: AdminUser[] }>('/api/admin/users').then(r => r.data.data),
  getUserDetail: (id: string) => apiClient.get<{ success: boolean; data: DetailedAdminUser }>(`/api/admin/users/${id}`).then(r => r.data.data),
  updateUser: (id: string, data: object) => apiClient.patch(`/api/admin/users/${id}`, data).then(r => r.data),
  resetPassword: (id: string, newPassword: string) => apiClient.post(`/api/admin/users/${id}/reset-password`, { newPassword }).then(r => r.data),
  deleteUser: (id: string) => apiClient.delete(`/api/admin/users/${id}`).then(r => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/api/admin/auth/change-password', { currentPassword, newPassword }).then(r => r.data),
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 flex items-center gap-4">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-text-muted text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-text-primary text-xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSaved }: { user: AdminUser; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [emailVerified, setEmailVerified] = useState(user.emailVerified);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminApi.updateUser(user.id, { name, email, emailVerified });
      toast.success('User updated');
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FiEdit2 size={16} className="text-primary" />
            <h2 className="text-text-primary font-semibold">Edit User</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary" />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated px-4 py-3">
            <span className="text-sm text-text-secondary">Email Verified</span>
            <button onClick={() => setEmailVerified(!emailVerified)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailVerified ? 'bg-primary' : 'bg-border'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${emailVerified ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-elevated transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {isSaving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><FiCheck size={14} />Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────

function ResetPasswordModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = async () => {
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setIsSaving(true);
    try {
      await adminApi.resetPassword(user.id, password);
      toast.success(`Password reset for ${user.name}`);
      onClose();
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FiKey size={16} className="text-amber-400" />
            <h2 className="text-text-primary font-semibold">Reset User Password</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">Set a new password for <span className="font-semibold text-text-primary">{user.name}</span>.</p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="New password (min 8 chars)"
            className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary" />
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-elevated transition-colors">Cancel</button>
          <button onClick={handleReset} disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {isSaving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><FiKey size={14} />Reset</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ user, onClose, onDeleted }: { user: AdminUser; onClose: () => void; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(user.id);
      toast.success(`${user.name} has been deleted`);
      onDeleted();
      onClose();
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-surface shadow-2xl">
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mb-4">
            <FiAlertTriangle size={22} className="text-red-400" />
          </div>
          <h2 className="text-text-primary font-bold text-lg mb-1">Delete user?</h2>
          <p className="text-text-secondary text-sm mb-4">
            Permanently deletes <span className="font-semibold text-text-primary">{user.name}</span> and all their accounts, transactions, and data.
          </p>
          <p className="text-text-secondary text-sm mb-2">Type <span className="font-mono text-red-400 font-semibold">{user.name}</span> to confirm:</p>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={user.name}
            className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-red-500 mb-4" />
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-elevated transition-colors">Cancel</button>
            <button onClick={handleDelete} disabled={confirm !== user.name || isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
              {isDeleting ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><FiTrash2 size={14} />Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Admin Password Modal ──────────────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!current || !next) { toast.error('Both fields required'); return; }
    if (next.length < 8) { toast.error('New password must be ≥8 characters'); return; }
    setIsSaving(true);
    try {
      await adminApi.changePassword(current, next);
      toast.success('Admin password changed!');
      onClose();
    } catch {
      toast.error('Failed — check your current password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <FiSettings size={16} className="text-primary" />
            <h2 className="text-text-primary font-semibold">Change Admin Password</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><FiX size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">Current Password</label>
            <input type="password" value={current} onChange={e => setCurrent(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-1.5 block">New Password</label>
            <input type="password" value={next} onChange={e => setNext(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-text-primary outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-text-secondary hover:bg-surface-elevated transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {isSaving ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <><FiCheck size={14} />Update</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({ u, onView, onEdit, onReset, onDelete }: {
  u: AdminUser;
  onView: () => void;
  onEdit: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const initials = u.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <tr className="border-b border-border hover:bg-surface-elevated/50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{u.name}</p>
            <p className="text-xs text-text-muted flex items-center gap-1"><FiMail size={10} />{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
          u.emailVerified ? 'text-green-400' : 'text-text-muted'
        }`}>
          {u.emailVerified ? <FiCheck size={11} /> : <FiX size={11} />}
          {u.emailVerified ? 'Verified' : 'Unverified'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {u.hasGoogleAccount && <FaGoogle size={11} className="text-blue-400" />}
          <span>{u.accountCount} accounts</span>
          <span>·</span>
          <span>{u.transactionCount} txns</span>
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-text-muted">
        <span className="flex items-center gap-1"><FiCalendar size={10} />{new Date(u.createdAt).toLocaleDateString()}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onView} title="View accounts & transactions" className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
            <FiEye size={14} />
          </button>
          <button onClick={onEdit} title="Edit" className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors">
            <FiEdit2 size={14} />
          </button>
          <button onClick={onReset} title="Reset password" className="p-1.5 rounded-lg hover:bg-amber-500/10 text-text-muted hover:text-amber-400 transition-colors">
            <FiKey size={14} />
          </button>
          <button onClick={onDelete} title="Delete user"
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors">
            <FiTrash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── View User Details Modal ──────────────────────────────────────────────────

function ViewUserDetailsModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminApi.getUserDetail(userId),
    enabled: !!userId,
  });

  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'categories'>('accounts');
  const [txnSearch, setTxnSearch] = useState('');

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-3xl rounded-2xl border border-border bg-surface p-12 flex flex-col items-center justify-center shadow-2xl">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-text-muted mt-3">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
          <div className="flex items-center gap-2 text-red-500 mb-3">
            <FiAlertTriangle size={20} />
            <h3 className="font-bold">Error</h3>
          </div>
          <p className="text-sm text-text-secondary">Failed to load user details. Please try again.</p>
          <button onClick={onClose} className="mt-4 w-full py-2 rounded-xl gradient-primary text-white text-sm font-semibold">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalBalance = user.accounts.reduce((sum, a) => sum + (a.isArchived ? 0 : a.balance), 0);
  const incomeTxns = user.transactions.filter(t => t.type === 'INCOME');
  const expenseTxns = user.transactions.filter(t => t.type === 'EXPENSE');
  const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTxns.reduce((sum, t) => sum + t.amount, 0);

  const filteredTxns = user.transactions.filter(t =>
    t.description?.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.category?.name.toLowerCase().includes(txnSearch.toLowerCase()) ||
    t.amount.toString().includes(txnSearch)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl border border-border bg-surface shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-elevated/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white">
              {user.name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <h2 className="text-text-primary font-bold flex items-center gap-2">
                {user.name}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-surface-elevated text-text-secondary'
                }`}>
                  {user.role}
                </span>
              </h2>
              <p className="text-xs text-text-muted">{user.email} · Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <FiX size={20} />
          </button>
        </div>

        {/* User stats overview bar */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-border bg-surface-elevated/10">
          <div className="p-3 rounded-xl bg-surface-elevated/40 border border-border/60">
            <p className="text-xs text-text-muted">Total Net Balance</p>
            <p className="text-lg font-bold text-text-primary mt-1">₹{totalBalance.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated/40 border border-border/60">
            <p className="text-xs text-text-muted">Total Income</p>
            <p className="text-lg font-bold text-green-400 mt-1">₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated/40 border border-border/60">
            <p className="text-xs text-text-muted">Total Expense</p>
            <p className="text-lg font-bold text-red-400 mt-1">₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-surface-elevated/20 px-6">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'accounts' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Accounts ({user.accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Transactions ({user.transactionCount})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Categories ({user.categories.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3">User Financial Accounts</h3>
              {user.accounts.length === 0 ? (
                <p className="text-sm text-text-muted py-8 text-center bg-surface-elevated/20 rounded-xl">No accounts created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.accounts.map(a => (
                    <div key={a.id} className="p-4 rounded-xl border border-border bg-surface-elevated/30 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-text-primary">{a.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">{a.type} · {a.isArchived ? 'Archived' : 'Active'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${a.balance >= 0 ? 'text-text-primary' : 'text-red-400'}`}>
                          ₹{a.balance.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-text-muted mt-0.5">Created {new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">Transaction History</h3>
                <div className="relative">
                  <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    value={txnSearch}
                    onChange={e => setTxnSearch(e.target.value)}
                    placeholder="Filter transactions..."
                    className="w-full sm:w-60 rounded-lg border border-border bg-surface-elevated pl-8 pr-3 py-1.5 text-xs text-text-primary outline-none focus:border-primary"
                  />
                </div>
              </div>

              {filteredTxns.length === 0 ? (
                <p className="text-sm text-text-muted py-8 text-center bg-surface-elevated/20 rounded-xl">No matching transactions found.</p>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-elevated/60 text-xs font-semibold text-text-muted border-b border-border">
                        <th className="p-3">Type</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Account</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs">
                      {filteredTxns.map(t => (
                        <tr key={t.id} className="hover:bg-surface-elevated/30 transition-colors">
                          <td className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              t.type === 'INCOME' ? 'bg-green-500/10 text-green-400' :
                              t.type === 'EXPENSE' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {t.type}
                            </span>
                          </td>
                          <td className="p-3 text-text-secondary">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="p-3 text-text-primary font-medium">{t.category?.name ?? 'Uncategorized'}</td>
                          <td className="p-3 text-text-secondary">
                            {t.account?.name}
                            {t.type === 'TRANSFER' && t.toAccount && ` → ${t.toAccount.name}`}
                          </td>
                          <td className="p-3 text-text-muted italic max-w-[200px] truncate" title={t.description ?? ''}>
                            {t.description ?? '—'}
                          </td>
                          <td className={`p-3 text-right font-bold ${
                            t.type === 'INCOME' ? 'text-green-400' :
                            t.type === 'EXPENSE' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            ₹{t.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide mb-3">Custom Expense/Income Categories</h3>
              {user.categories.length === 0 ? (
                <p className="text-sm text-text-muted py-8 text-center bg-surface-elevated/20 rounded-xl">No custom categories.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {user.categories.map(c => (
                    <div key={c.id} className="p-3 rounded-lg border border-border bg-surface-elevated/20 flex flex-col justify-between">
                      <span className="text-sm font-semibold text-text-primary">{c.name}</span>
                      <span className={`text-[10px] mt-1 self-start px-1 rounded font-bold ${
                        c.type === 'INCOME' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {c.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export function AdminPage() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [resetUser, setResetUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [showChangePw, setShowChangePw] = useState(false);

  const { data: stats } = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.getStats });
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin', 'users'], queryFn: adminApi.getUsers });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin'] });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login', { replace: true });
    toast.success('Logged out of admin panel');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <FiShield size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Admin Panel</p>
              <p className="text-xs text-text-muted hidden sm:block">Signed in as {admin?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <FiUser size={10} /> {admin?.name ?? 'Admin'}
            </span>
            <button onClick={() => setShowChangePw(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-text-secondary hover:bg-surface transition-colors">
              <FiSettings size={13} />
              <span className="hidden sm:inline">Change Password</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
              <FiLogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<FiUsers size={20} className="text-white" />} label="Total Users"
            value={stats?.userCount ?? '—'} color="gradient-primary" />
          <StatCard icon={<FiActivity size={20} className="text-white" />} label="Transactions"
            value={stats?.transactionCount ?? '—'} color="bg-violet-500/80" />
          <StatCard icon={<FiCreditCard size={20} className="text-white" />} label="Accounts"
            value={stats?.accountCount ?? '—'} color="bg-emerald-500/80" />
          <StatCard icon={<FiDollarSign size={20} className="text-white" />} label="Total Balance"
            value={stats ? `₹${stats.totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
            color="bg-amber-500/80" />
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
            <h2 className="text-text-primary font-bold flex items-center gap-2">
              <FiUsers size={16} className="text-primary" />
              All Users
              <span className="text-xs font-normal text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full">
                {users.length} total
              </span>
            </h2>
            <div className="relative w-full sm:w-auto">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full sm:w-64 rounded-xl border border-border bg-surface-elevated pl-9 pr-4 py-2 text-sm text-text-primary outline-none focus:border-primary"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-text-muted text-sm">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50">
                    {['User', 'Email Status', 'Details', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <UserRow
                      key={u.id}
                      u={u}
                      onView={() => setViewUserId(u.id)}
                      onEdit={() => setEditUser(u)}
                      onReset={() => setResetUser(u)}
                      onDelete={() => setDeleteUser(u)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {viewUserId && <ViewUserDetailsModal userId={viewUserId} onClose={() => setViewUserId(null)} />}
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={invalidate} />}
      {resetUser && <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />}
      {deleteUser && <DeleteModal user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={invalidate} />}
      {showChangePw && <ChangePasswordModal onClose={() => setShowChangePw(false)} />}
    </div>
  );
}

// ─── Admin Shell — auth gate ──────────────────────────────────────────────────

export function AdminShell() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/admin-login', { replace: true });
    return null;
  }

  return <AdminPage />;
}

// Unused but kept for type safety of old import
const _FiChevronDown = FiChevronDown;
void _FiChevronDown;
