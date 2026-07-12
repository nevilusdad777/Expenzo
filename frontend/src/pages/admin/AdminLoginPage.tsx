import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAdminAuth } from '@/context/AdminAuthContext';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }

    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setError(msg ?? 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden px-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-violet-500/8 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Shield icon */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-2xl shadow-primary/30">
            <FiShield size={30} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">Admin Panel</h1>
            <p className="mt-1 text-sm text-text-muted">Sign in to manage the application</p>
          </div>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-7 shadow-2xl shadow-black/20 space-y-4"
        >
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <FiAlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-xs font-medium text-text-secondary">
              Admin Email
            </label>
            <div className="relative">
              <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@financeapp.local"
                autoComplete="username"
                className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-medium text-text-secondary">
              Password
            </label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-10 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <><FiShield size={15} />Sign In as Admin</>
            )}
          </button>
        </form>

        {/* Footer note */}
        <p className="mt-5 text-center text-xs text-text-muted">
          This is a restricted area. Unauthorized access is prohibited.
        </p>
        <p className="mt-2 text-center text-xs text-text-muted">
          <button onClick={() => navigate('/')} className="text-primary/70 hover:text-primary underline">
            ← Back to main app
          </button>
        </p>
      </div>
    </div>
  );
}
