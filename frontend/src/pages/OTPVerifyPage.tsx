import { useState, useRef, useEffect } from 'react';
import { FiMail, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function OTPVerifyPage() {
  const { user, verifyOTP, sendOTP, logout } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits entered
    if (value && index === 5) {
      const full = [...next].join('');
      if (full.length === 6) handleVerify(full);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (fullCode?: string) => {
    const otp = fullCode ?? code.join('');
    if (otp.length < 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    setIsVerifying(true);
    try {
      await verifyOTP(otp);
      toast.success('Email verified! Welcome aboard 🎉');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    try {
      await sendOTP();
      toast.success('New code sent!');
      setResendCooldown(60);
    } catch (err) {
      toast.error('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-8 shadow-2xl text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/30">
            <FiMail size={28} className="text-white" />
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">Check your email</h1>
          <p className="text-text-secondary text-sm mb-1">
            We sent a 6-digit verification code to
          </p>
          <p className="text-text-primary font-semibold text-sm mb-8">{user?.email}</p>

          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-14 rounded-xl border text-center text-xl font-bold bg-surface-elevated text-text-primary outline-none transition-all duration-150
                  ${digit ? 'border-primary shadow-sm shadow-primary/20' : 'border-border'}
                  focus:border-primary focus:shadow-sm focus:shadow-primary/20`}
                disabled={isVerifying}
                autoFocus={i === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying || code.join('').length < 6}
            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
          >
            {isVerifying ? (
              <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <FiCheckCircle size={16} />
                Verify Email
              </>
            )}
          </button>

          {/* Resend */}
          <p className="text-text-secondary text-sm">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className="text-primary hover:text-primary/80 font-medium disabled:opacity-50 inline-flex items-center gap-1"
            >
              {isResending ? (
                <FiRefreshCw size={13} className="animate-spin" />
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend code'
              )}
            </button>
          </p>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => void logout()}
              className="text-text-muted text-xs hover:text-text-secondary transition-colors"
            >
              Sign out and use a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
