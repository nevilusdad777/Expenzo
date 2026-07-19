import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const token = params.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-sm w-full">
          <FiAlertCircle size={32} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-text-primary mb-2">Invalid link</h2>
          <p className="text-text-secondary text-sm mb-6">This password reset link is invalid or has expired.</p>
          <button
            onClick={() => navigate('/auth')}
            className="text-primary hover:text-primary/80 font-medium text-sm"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const requirements = [];
    if (newPassword.length < 8) requirements.push('at least 8 characters');
    if (!/[A-Z]/.test(newPassword)) requirements.push('an uppercase letter');
    if (!/[a-z]/.test(newPassword)) requirements.push('a lowercase letter');
    if (!/[0-9]/.test(newPassword)) requirements.push('a number');
    if (!/[^A-Za-z0-9]/.test(newPassword)) requirements.push('a special character');

    if (requirements.length > 0) {
      setError(`Password must contain: ${requirements.join(', ')}`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-8 shadow-2xl">
          {!done ? (
            <>
              <div className="mb-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/30">
                  <FiLock size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold text-text-primary mb-1">Set new password</h1>
                <p className="text-text-secondary text-sm">Your new password must be at least 8 characters.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                    <FiAlertCircle size={15} className="flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="rp-new" className="text-sm font-medium text-text-secondary">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="rp-new"
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 pr-12 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                    >
                      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rp-confirm" className="text-sm font-medium text-text-secondary">
                    Confirm password
                  </label>
                  <input
                    id="rp-confirm"
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
                <FiCheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Password updated!</h2>
              <p className="text-text-secondary text-sm mb-8">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm"
              >
                Sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
