import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';

interface PinInputProps {
  onComplete: (pin: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PinInput({ onComplete, error, disabled }: PinInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((digit) => digit !== '')) {
      onComplete(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split('');
      setDigits(next);
      onComplete(pasted);
    }
    e.preventDefault();
  };

  return (
    <div>
      <div className="flex justify-center gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`h-14 w-11 rounded-[var(--radius-button)] border bg-surface text-center text-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 ${error ? 'border-danger' : 'border-border'}`}
          />
        ))}
      </div>
      {error ? <p className="mt-3 text-center text-sm text-danger">{error}</p> : null}
    </div>
  );
}