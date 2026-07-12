import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ elevated = false, padding = 'md', className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] ${elevated ? 'glass-elevated' : 'glass'} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}