import { useState } from 'react';
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface Props {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: Props) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // Even on error, show success to prevent email enumeration
      setSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-8 shadow-2xl">
        {!sent ? (
          <>
            {/* Header */}
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors"
            >
              <FiArrowLeft size={16} />
              Back to sign in
            </button>

            <div className="mb-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/30">
                <FiMail size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1">Forgot password?</h2>
              <p className="text-text-secondary text-sm">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="fp-email" className="text-sm font-medium text-text-secondary">
                  Email address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <FiSend size={16} />
                    Send reset link
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success state */}
            <div className="text-center py-4">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
                <FiCheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Check your inbox</h2>
              <p className="text-text-secondary text-sm mb-1">
                If an account exists for
              </p>
              <p className="text-text-primary font-semibold text-sm mb-4">{email}</p>
              <p className="text-text-secondary text-sm mb-6">
                you'll receive a password reset link shortly. The link expires in <strong className="text-text-primary">1 hour</strong>.
              </p>
              <p className="text-text-muted text-xs mb-6">Don't see it? Check your spam folder.</p>
              <button
                onClick={onBack}
                className="text-primary hover:text-primary/80 font-medium text-sm transition-colors flex items-center gap-2 mx-auto"
              >
                <FiArrowLeft size={14} />
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
