import React from 'react';
import vyntraIcon from '../../assets/vyntra_icon.svg';
import vyntraWordmark from '../../assets/vyntra_wordmark.svg';

interface LogoProps {
  variant?: 'navbar' | 'auth' | 'custom';
  showIcon?: boolean;
  showWordmark?: boolean;
  iconHeight?: number | string;
  wordmarkHeight?: number | string;
  gap?: number | string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'navbar',
  showIcon,
  showWordmark,
  iconHeight,
  wordmarkHeight,
  gap,
  className = '',
}) => {
  let displayIcon = showIcon;
  let displayWordmark = showWordmark;

  let resolvedIconHeight = iconHeight ?? 36;
  let resolvedWordmarkHeight = wordmarkHeight ?? 24;
  let resolvedGap = gap ?? 12;

  if (variant === 'navbar') {
    displayIcon = showIcon ?? false;       // Remove icon from navbar, keep wordmark only
    displayWordmark = showWordmark ?? true;
    resolvedWordmarkHeight = wordmarkHeight ?? 24;
  } else if (variant === 'auth') {
    displayIcon = showIcon ?? true;        // Remove wordmark from auth page, keep logo icon only
    displayWordmark = showWordmark ?? false;
    resolvedIconHeight = iconHeight ?? 64;
  } else {
    displayIcon = showIcon ?? true;
    displayWordmark = showWordmark ?? true;
  }

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: typeof resolvedGap === 'number' ? `${resolvedGap}px` : resolvedGap }}
    >
      {displayIcon && (
        <img
          src={vyntraIcon}
          alt="Vyntra Icon"
          style={{ height: typeof resolvedIconHeight === 'number' ? `${resolvedIconHeight}px` : resolvedIconHeight, width: 'auto', objectFit: 'contain' }}
          className="select-none"
        />
      )}
      {displayWordmark && (
        <img
          src={vyntraWordmark}
          alt="Vyntra Wordmark"
          style={{ height: typeof resolvedWordmarkHeight === 'number' ? `${resolvedWordmarkHeight}px` : resolvedWordmarkHeight, width: 'auto', objectFit: 'contain' }}
          className="select-none"
        />
      )}
    </div>
  );
};
