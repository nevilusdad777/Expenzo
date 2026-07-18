import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import toast from 'react-hot-toast';
import vyntraLogo from '@/assets/vyntra_logo.png';
import vyntraWordmark from '@/assets/vyntra_wordmark.png';

type Mode = 'login' | 'register' | 'forgot';

function GoogleButton() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full py-3.5 rounded-full border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all active:scale-95 text-sm font-semibold text-white flex justify-center items-center gap-3 shadow-[0_0_15px_rgba(196,192,255,0.05)]"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10"></div>
      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Or</span>
      <div className="flex-1 h-px bg-white/10"></div>
    </div>
  );
}

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLogin = mode === 'login';

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
    if (!password) return 'Password is required';
    if (!isLogin) {
      if (!name.trim()) return 'Name is required';
      if (password.length < 8) return 'Password must be at least 8 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await register(name, email, password);
        toast.success('Account created! Check your email for the verification code.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary-container/10 blur-[130px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-tertiary-container/10 blur-[130px] pointer-events-none"></div>
        <div className="relative z-10 w-full max-w-md">
          <ForgotPasswordPage onBack={() => setMode('login')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden antialiased">
      {/* Ambient Light Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary-container/15 blur-[130px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-tertiary-container/15 blur-[130px] pointer-events-none"></div>

      <main className="w-full max-w-md relative z-10">
        <div className="glass-panel rounded-[32px] p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(196,192,255,0.05)]">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
          
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            {/* Logo Icon (No background, transparent & larger) */}
            <img src={vyntraLogo} alt="Vyntra Logo" className="h-28 w-auto object-contain select-none mb-2" />
            
            {/* Wordmark Logo */}
            <img src={vyntraWordmark} alt="Vyntra" className="h-8 w-auto object-contain select-none" />
            
            <h2 className="text-xl font-bold text-white mt-1">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-on-surface-variant font-medium">
              {isLogin ? 'Sign in to manage your financial ecosystem.' : 'Get started with your premium account.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-surface-container rounded-full p-1 border border-white/5">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-primary text-on-primary shadow-[0_0_12px_rgba(196,192,255,0.4)]'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              <FiAlertCircle size={15} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Name (register only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="auth-name" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block ml-2">Full name</label>
                <div className="relative">
                  <FiUser size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nevil Patel"
                    autoComplete="name"
                    className="glass-input w-full rounded-full py-3.5 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:border-tertiary transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="auth-email" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block ml-2">Email address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="glass-input w-full rounded-full py-3.5 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:border-tertiary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-2 mr-2">
                <label htmlFor="auth-password" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); }}
                    className="text-xs text-primary hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className="glass-input w-full rounded-full py-3.5 pl-12 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:border-tertiary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white"
                >
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label htmlFor="auth-confirm" className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block ml-2">Confirm password</label>
                <div className="relative">
                  <FiLock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    id="auth-confirm"
                    type={showPw ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className="glass-input w-full rounded-full py-3.5 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:border-tertiary transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container hover:bg-primary text-white rounded-full py-3.5 font-semibold text-sm mt-3 flex justify-center items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(135,129,255,0.4)] disabled:opacity-60"
            >
              {isLoading ? (
                <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <FiArrowRight size={16} className="mt-0.5" />
                </>
              )}
            </button>
          </form>

          <Divider />

          {/* Social Auth */}
          <GoogleButton />
        </div>

        <p className="text-center text-on-surface-variant text-xs mt-6">
          Your data stays on this device. Private by design.
        </p>
      </main>
    </div>
  );
}
