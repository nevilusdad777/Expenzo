import vyntraLogo from '@/assets/vyntra_logo.png';
import vyntraWordmark from '@/assets/vyntra_wordmark.png';

interface LogoProps {
  variant?: 'navbar' | 'auth';
  className?: string;
}

export function Logo({ variant = 'navbar', className = '' }: LogoProps) {
  if (variant === 'auth') {
    return (
      <div className={`flex flex-col items-center gap-[12px] select-none ${className}`}>
        {/* Icon */}
        <img
          src={vyntraLogo}
          alt="Vyntra Logo"
          className="h-[52px] w-[52px] md:h-[60px] md:w-[60px] lg:h-[72px] lg:w-[72px] object-contain shrink-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        />
        {/* Wordmark */}
        <img
          src={vyntraWordmark}
          alt="Vyntra"
          className="h-[20px] md:h-[23px] lg:h-[28px] w-auto object-contain shrink-0 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]"
        />
      </div>
    );
  }

  // navbar variant (horizontal layout)
  return (
    <div className={`flex items-center gap-[12px] select-none transition-opacity duration-200 hover:opacity-85 ${className}`}>
      {/* Icon */}
      <img
        src={vyntraLogo}
        alt="Vyntra Logo"
        className="h-[28px] w-[28px] md:h-[32px] md:w-[32px] lg:h-[36px] lg:w-[36px] object-contain shrink-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
      />
      {/* Wordmark */}
      <img
        src={vyntraWordmark}
        alt="Vyntra"
        className="h-[16px] md:h-[18px] lg:h-[20px] w-auto object-contain shrink-0 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
      />
    </div>
  );
}
