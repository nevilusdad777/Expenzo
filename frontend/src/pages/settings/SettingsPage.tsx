import { useState } from 'react';
import { FiLogOut, FiShield, FiLock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  useAutoLockSettings,
  useChangePassword,
  useUpdateAutoLockSettings,
} from '@/hooks/queries/useSettings';

const AUTO_LOCK_OPTIONS = [1, 5, 10, 15, 30, 60];

export function SettingsPage() {
  const { logout, setAutoLockMinutes, autoLockMinutes, user } = useAuth();
  const { data: settings, isLoading } = useAutoLockSettings(true);
  const updateAutoLock = useUpdateAutoLockSettings();
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const currentAutoLock = settings?.autoLockMinutes ?? autoLockMinutes;

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = 'Required';
    if (!newPassword) errs.newPassword = 'Required';
    else if (newPassword.length < 8) errs.newPassword = 'Must be at least 8 characters';
    if (!confirmNewPassword) errs.confirmNewPassword = 'Required';
    else if (newPassword !== confirmNewPassword) errs.confirmNewPassword = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword, confirmNewPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPwErrors({});
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'EX';

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings & Profile</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your premium profile and security configurations.</p>
      </div>

      {/* Profile Header */}
      {user && (
        <section className="glass-panel rounded-lg p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-primary shadow-[0_0_20px_rgba(196,192,255,0.3)] bg-primary-container text-2xl font-bold text-white">
            {initials}
          </div>
          <div className="relative z-10 flex-grow">
            <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-sm text-on-surface-variant mb-3">{user.email}</p>
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-full px-3 py-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Expenzo Black</span>
            </div>
          </div>
          <div className="relative z-10">
            <button
              onClick={() => void logout()}
              className="bg-primary hover:bg-primary-fixed text-on-primary-container font-semibold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(196,192,255,0.4)] flex items-center gap-1.5"
            >
              <FiLogOut size={12} />
              Logout
            </button>
          </div>
        </section>
      )}

      {/* Bento Grid Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Widget */}
        <section className="glass-panel rounded-lg p-6 flex flex-col hover:border-primary/30 transition-colors border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/5 rounded-lg text-primary border border-white/5">
              <FiUser size={16} />
            </div>
            <h2 className="text-base font-bold text-white">Personal Information</h2>
          </div>
          {user && (
            <div className="space-y-4 flex-grow">
              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                <div className="text-sm text-white font-medium pb-2 border-b border-white/5">{user.name}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</label>
                <div className="text-sm text-white font-medium pb-2 border-b border-white/5">{user.email}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Account Tier</label>
                <div className="text-sm text-white font-medium">Verified Free Sandbox Tier</div>
              </div>
            </div>
          )}
        </section>

        {/* Security & Auto-lock Widget */}
        <section className="glass-panel rounded-lg p-6 flex flex-col hover:border-primary/30 transition-colors border border-white/10 space-y-6">
          {/* Auto-lock Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-lg text-primary border border-white/5">
                <FiShield size={16} />
              </div>
              <h2 className="text-base font-bold text-white">Auto-Lock System</h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Lock the app automatically after inactivity. Current: <span className="text-white font-semibold">{currentAutoLock} minute{currentAutoLock === 1 ? '' : 's'}</span>.
            </p>

            {isLoading ? (
              <p className="text-xs text-on-surface-variant">Loading preferences…</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {AUTO_LOCK_OPTIONS.map((minutes) => (
                  <button
                    key={minutes}
                    disabled={updateAutoLock.isPending}
                    onClick={() => {
                      updateAutoLock.mutate(minutes, {
                        onSuccess: (data) => {
                          setAutoLockMinutes(data.autoLockMinutes);
                          toast.success(`Auto-lock set to ${data.autoLockMinutes} minutes`);
                        },
                        onError: (err) => toast.error(err.message),
                      });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      currentAutoLock === minutes
                        ? 'bg-primary border-primary text-on-primary shadow-[0_0_10px_rgba(196,192,255,0.3)]'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Change Password Trigger */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-primary border border-white/5">
                  <FiLock size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Update Password</h2>
                  <p className="text-[10px] text-on-surface-variant">Update credentials periodically</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs font-semibold text-primary hover:text-white transition-colors"
              >
                {showPasswordForm ? 'Cancel' : 'Update'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handleChangePassword} className="space-y-4 mt-4 bg-white/[0.01] p-4 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block ml-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="glass-input w-full rounded-full py-2.5 px-4 text-xs text-on-surface focus:ring-0 focus:border-tertiary transition-all"
                    autoComplete="current-password"
                  />
                  {pwErrors.currentPassword && <p className="text-[10px] text-error ml-2">{pwErrors.currentPassword}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block ml-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="glass-input w-full rounded-full py-2.5 px-4 text-xs text-on-surface focus:ring-0 focus:border-tertiary transition-all"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                  {pwErrors.newPassword && <p className="text-[10px] text-error ml-2">{pwErrors.newPassword}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block ml-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="glass-input w-full rounded-full py-2.5 px-4 text-xs text-on-surface focus:ring-0 focus:border-tertiary transition-all"
                    autoComplete="new-password"
                  />
                  {pwErrors.confirmNewPassword && <p className="text-[10px] text-error ml-2">{pwErrors.confirmNewPassword}</p>}
                </div>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-primary text-on-primary font-semibold text-xs py-3 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(196,192,255,0.3)]"
                >
                  Confirm Password Update
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
