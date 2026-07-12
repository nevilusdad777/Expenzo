import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-muted text-success',
  danger: 'bg-danger-muted text-danger',
  warning: 'bg-warning-muted text-warning',
  neutral: 'bg-surface-elevated text-text-secondary',
};

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}