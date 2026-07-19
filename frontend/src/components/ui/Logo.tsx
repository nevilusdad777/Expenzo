import React from 'react';
import vyntraIcon from '../../assets/vyntra_icon.svg';
import vyntraWordmark from '../../assets/vyntra_wordmark.svg';

interface LogoProps {
  variant?: 'navbar' | 'auth' | 'custom';
  iconHeight?: number | string;
  wordmarkHeight?: number | string;
  gap?: number | string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'navbar',
  iconHeight,
  wordmarkHeight,
  gap,
  className = '',
}) => {
  let resolvedIconHeight = iconHeight ?? 36;
  let resolvedWordmarkHeight = wordmarkHeight ?? 20;
  let resolvedGap = gap ?? 12;

  if (variant === 'navbar') {
    resolvedIconHeight = iconHeight ?? 36;
    resolvedWordmarkHeight = wordmarkHeight ?? 20;
    resolvedGap = gap ?? 12;
  } else if (variant === 'auth') {
    resolvedIconHeight = iconHeight ?? 72;
    resolvedWordmarkHeight = wordmarkHeight ?? 28;
    resolvedGap = gap ?? 12;
  }

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: typeof resolvedGap === 'number' ? `${resolvedGap}px` : resolvedGap }}
    >
      <img
        src={vyntraIcon}
        alt="Vyntra Icon"
        style={{ height: typeof resolvedIconHeight === 'number' ? `${resolvedIconHeight}px` : resolvedIconHeight, width: 'auto', objectFit: 'contain' }}
        className="select-none"
      />
      <img
        src={vyntraWordmark}
        alt="Vyntra Wordmark"
        style={{ height: typeof resolvedWordmarkHeight === 'number' ? `${resolvedWordmarkHeight}px` : resolvedWordmarkHeight, width: 'auto', objectFit: 'contain' }}
        className="select-none"
      />
    </div>
  );
};
