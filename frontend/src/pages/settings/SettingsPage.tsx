import { useState } from 'react';
import { FiLogOut, FiShield, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Button, Card, Input } from '@/components/ui';
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

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary">Security and app preferences.</p>
      </div>

      {/* User Info */}
      {user && (
        <Card elevated className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shadow-md">
            {user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{user.name}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
        </Card>
      )}

      {/* Auto-lock */}
      <Card elevated className="space-y-4">
        <div className="flex items-center gap-2">
          <FiShield className="text-primary" />
          <h2 className="text-base font-semibold text-text-primary">Auto-lock</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Lock the app automatically after inactivity. Current: {currentAutoLock} minute
          {currentAutoLock === 1 ? '' : 's'}.
        </p>

        {isLoading ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {AUTO_LOCK_OPTIONS.map((minutes) => (
              <Button
                key={minutes}
                size="sm"
                variant={currentAutoLock === minutes ? 'primary' : 'secondary'}
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
              >
                {minutes}m
              </Button>
            ))}
          </div>
        )}
      </Card>

      {/* Change Password */}
      <Card elevated className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <FiLock size={16} className="text-primary" />
              Change Password
            </h2>
            <p className="text-sm text-text-secondary">Update your account password.</p>
          </div>
          {!showPasswordForm ? (
            <Button onClick={() => setShowPasswordForm(true)}>Change</Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => {
                setShowPasswordForm(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPwErrors({});
              }}
            >
              Cancel
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="space-y-3">
            <Input
              label="Current Password"
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={pwErrors.currentPassword}
              autoComplete="current-password"
            />
            <Input
              label="New Password"
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={pwErrors.newPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm New Password"
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={pwErrors.confirmNewPassword}
              autoComplete="new-password"
            />
            <Button
              type="submit"
              isLoading={changePasswordMutation.isPending}
              className="w-full"
            >
              Update Password
            </Button>
          </form>
        )}
      </Card>

      {/* Session / Logout */}
      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Session</h2>
        <p className="text-sm text-text-secondary">Sign out of your account on this device.</p>
        <Button variant="secondary" onClick={() => void logout()}>
          <FiLogOut />
          Log out
        </Button>
      </Card>
    </div>
  );
}
