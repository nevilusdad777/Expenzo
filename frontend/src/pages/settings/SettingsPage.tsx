import { useState } from 'react';
import { FiLogOut, FiShield, FiLock, FiUser, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import {
  useAutoLockSettings,
  useChangePassword,
  useUpdateAutoLockSettings,
} from '@/hooks/queries/useSettings';
import { ImageCropperModal } from '@/components/ui';

const AUTO_LOCK_OPTIONS = [1, 5, 10, 15, 30, 60];

export function SettingsPage() {
  const { logout, setAutoLockMinutes, autoLockMinutes, user, updateProfile } = useAuth();
  const { data: settings, isLoading } = useAutoLockSettings(true);
  const updateAutoLock = useUpdateAutoLockSettings();
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editEmail, setEditEmail] = useState(user?.email ?? '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);

  const currentAutoLock = settings?.autoLockMinutes ?? autoLockMinutes;

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = 'Required';
    
    if (!newPassword) {
      errs.newPassword = 'Required';
    } else {
      const requirements = [];
      if (newPassword.length < 8) requirements.push('at least 8 characters');
      if (!/[A-Z]/.test(newPassword)) requirements.push('an uppercase letter');
      if (!/[a-z]/.test(newPassword)) requirements.push('a lowercase letter');
      if (!/[0-9]/.test(newPassword)) requirements.push('a number');
      if (!/[^A-Za-z0-9]/.test(newPassword)) requirements.push('a special character');
      
      if (requirements.length > 0) {
        errs.newPassword = `Password must contain: ${requirements.join(', ')}`;
      }
    }
    
    if (!confirmNewPassword) errs.confirmNewPassword = 'Required';
    else if (newPassword !== confirmNewPassword) errs.confirmNewPassword = 'Passwords do not match';
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support up to 4MB source images
    if (file.size > 4 * 1024 * 1024) {
      toast.error('Profile picture must be under 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropperSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async (croppedBase64: string) => {
    setCropperSrc(null);
    try {
      setIsUpdatingProfile(true);
      await updateProfile(user?.name ?? '', user?.email ?? '', croppedBase64);
      toast.success('Profile picture updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile picture');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editEmail.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      await updateProfile(editName.trim(), editEmail.trim(), user?.avatarUrl ?? null);
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Dynamic Tier calculations using roles and verification statuses
  const getTierInfo = () => {
    if (!user) {
      return {
        label: 'Vyntra Free',
        desc: 'Free Tier',
        badgeClass: 'bg-white/5 text-on-surface-variant border-white/10'
      };
    }

    if (user.role === 'ADMIN') {
      return {
        label: 'Vyntra Executive',
        desc: 'System Administrator',
        badgeClass: 'bg-primary/20 text-primary border-primary/50'
      };
    }

    if (user.emailVerified) {
      return {
        label: 'Vyntra Pro',
        desc: 'Verified Pro Tier',
        badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      };
    }

    return {
      label: 'Vyntra Free',
      desc: 'Unverified Free Tier',
      badgeClass: 'bg-white/5 text-on-surface-variant border-white/10'
    };
  };

  const tierInfo = getTierInfo();

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
          
          <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(196,192,255,0.3)] bg-primary-container text-2xl font-bold text-white flex items-center justify-center cursor-pointer">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-center">
              <FiCamera size={20} className="text-white mb-0.5" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">Change</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUpdatingProfile}
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="relative z-10 flex-grow">
            <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-sm text-on-surface-variant mb-3">{user.email}</p>
            <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1 ${tierInfo.badgeClass}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest">{tierInfo.label}</span>
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
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-lg text-primary border border-white/5">
                <FiUser size={16} />
              </div>
              <h2 className="text-base font-bold text-white">Personal Information</h2>
            </div>
            {!isEditingProfile ? (
              <button
                onClick={() => {
                  setEditName(user?.name ?? '');
                  setEditEmail(user?.email ?? '');
                  setIsEditingProfile(true);
                }}
                className="text-xs font-semibold text-primary hover:text-white transition-colors"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile}
                className="text-xs font-semibold text-primary hover:text-white transition-colors disabled:opacity-50"
              >
                Save
              </button>
            )}
          </div>
          {user && (
            <div className="space-y-4 flex-grow">
              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Full Name"
                    disabled={isUpdatingProfile}
                  />
                ) : (
                  <div className="text-sm text-white font-medium pb-2 border-b border-white/5">{user.name}</div>
                )}
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Email Address</label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="Email Address"
                    disabled={isUpdatingProfile}
                  />
                ) : (
                  <div className="text-sm text-white font-medium pb-2 border-b border-white/5">{user.email}</div>
                )}
              </div>
              
              {isEditingProfile && (
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    disabled={isUpdatingProfile}
                    className="text-xs text-on-surface-variant hover:text-white font-semibold px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {!isEditingProfile && (
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Account Tier</label>
                  <div className="text-sm text-white font-medium">{tierInfo.desc}</div>
                </div>
              )}
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

      {cropperSrc && (
        <ImageCropperModal
          imageSrc={cropperSrc}
          onCancel={() => setCropperSrc(null)}
          onCrop={handleCropSave}
        />
      )}
    </div>
  );
}
