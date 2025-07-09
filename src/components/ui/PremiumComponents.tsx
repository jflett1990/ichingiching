import React, { ReactNode } from 'react';
import { useTheme } from '../themes/ThemeProvider';

// Premium Button Component
interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'luxury' | 'premium' | 'glass' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'premium',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'luxury': return 'btn-luxury';
      case 'glass': return 'btn-glass';
      case 'gradient': return 'btn-premium';
      default: return 'btn-premium';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'px-6 py-3 text-sm';
      case 'lg': return 'px-12 py-5 text-lg';
      case 'xl': return 'px-16 py-6 text-xl';
      default: return 'px-10 py-4 text-base';
    }
  };

  const classes = [
    getVariantClass(),
    getSizeClass(),
    'hover-lift',
    'focus-luxury',
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};

// Luxury Text Component
interface LuxuryTextProps {
  children: ReactNode;
  variant?: 'luxury' | 'premium' | 'shimmer';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export const LuxuryText: React.FC<LuxuryTextProps> = ({
  children,
  variant = 'premium',
  size = 'md',
  className = '',
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'luxury': return 'text-luxury';
      case 'shimmer': return 'text-shimmer';
      default: return 'text-premium';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-sm';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      case '3xl': return 'text-3xl';
      default: return 'text-base';
    }
  };

  const classes = [
    getVariantClass(),
    getSizeClass(),
    'text-luxury-spacing',
    'font-semibold',
    className
  ].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

// Premium Icon Container
interface PremiumIconProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: 'primary' | 'secondary' | 'luxury' | 'crystal';
  glow?: boolean;
  floating?: boolean;
  className?: string;
}

export const PremiumIcon: React.FC<PremiumIconProps> = ({
  children,
  size = 'md',
  gradient = 'primary',
  glow = false,
  floating = false,
  className = '',
}) => {
  const { currentTheme } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { width: '3rem', height: '3rem', fontSize: '1.25rem' };
      case 'lg': return { width: '6rem', height: '6rem', fontSize: '2.5rem' };
      case 'xl': return { width: '8rem', height: '8rem', fontSize: '3.5rem' };
      default: return { width: '4rem', height: '4rem', fontSize: '1.75rem' };
    }
  };

  const getGradientBackground = () => {
    switch (gradient) {
      case 'luxury': return 'linear-gradient(135deg, #D4AF37, #B8860B, #DAA520)';
      case 'crystal': return 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))';
      case 'secondary': return `linear-gradient(135deg, ${currentTheme.colors.secondary}, ${currentTheme.colors.accent})`;
      default: return `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`;
    }
  };

  const classes = [
    'rounded-2xl',
    'flex items-center justify-center',
    'shadow-luxury',
    'transition-all duration-300',
    glow ? 'hover-glow' : '',
    floating ? 'float-gentle' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{
        ...getSizeStyles(),
        background: getGradientBackground(),
        color: 'white',
      }}
    >
      {children}
    </div>
  );
};

// Luxury Divider
interface LuxuryDividerProps {
  variant?: 'gradient' | 'shimmer' | 'glow';
  thickness?: 'thin' | 'medium' | 'thick';
  className?: string;
}

export const LuxuryDivider: React.FC<LuxuryDividerProps> = ({
  variant = 'gradient',
  thickness = 'medium',
  className = '',
}) => {
  const { currentTheme } = useTheme();

  const getThickness = () => {
    switch (thickness) {
      case 'thin': return '1px';
      case 'thick': return '3px';
      default: return '2px';
    }
  };

  const getBackground = () => {
    switch (variant) {
      case 'shimmer': 
        return `linear-gradient(90deg, transparent, ${currentTheme.colors.primary}, transparent)`;
      case 'glow': 
        return `linear-gradient(90deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`;
      default: 
        return `linear-gradient(90deg, transparent, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary}, transparent)`;
    }
  };

  const classes = [
    'w-full',
    'my-8',
    'rounded-full',
    variant === 'shimmer' ? 'animate-luxury-shimmer' : '',
    variant === 'glow' ? 'shadow-glow' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{
        height: getThickness(),
        background: getBackground(),
      }}
    />
  );
};

// Premium Stats Card
interface PremiumStatsProps {
  value: string | number;
  label: string;
  icon?: ReactNode;
  variant?: 'luxury' | 'crystal' | 'glow';
  animated?: boolean;
  className?: string;
}

export const PremiumStats: React.FC<PremiumStatsProps> = ({
  value,
  label,
  icon,
  variant = 'luxury',
  animated = true,
  className = '',
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'crystal': return 'glass-luxury border-2 border-white/20';
      case 'glow': return 'glass-ultra hover-glow';
      default: return 'glass-luxury';
    }
  };

  const classes = [
    'p-6',
    'rounded-2xl',
    'text-center',
    'transition-all duration-300',
    getVariantClass(),
    animated ? 'hover-lift' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {icon && (
        <div className="mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <div className="text-4xl font-bold text-luxury mb-2 animate-glow-pulse">
        {value}
      </div>
      <p className="text-sm opacity-80 text-premium-spacing uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
};

// Floating Action Elements
interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  intensity?: 'gentle' | 'medium' | 'strong';
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  delay = 0,
  intensity = 'gentle',
  className = '',
}) => {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'medium': return 'animate-bounce-gentle';
      case 'strong': return 'animate-pulse-slow';
      default: return 'float-gentle';
    }
  };

  return (
    <div
      className={`${getIntensityClass()} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};

// Premium Loading Spinner
interface PremiumLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'luxury' | 'glow' | 'shimmer';
  className?: string;
}

export const PremiumLoader: React.FC<PremiumLoaderProps> = ({
  size = 'md',
  variant = 'luxury',
  className = '',
}) => {
  const { currentTheme } = useTheme();

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 border-2';
      case 'lg': return 'w-16 h-16 border-4';
      default: return 'w-12 h-12 border-3';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'glow':
        return {
          borderColor: `transparent ${currentTheme.colors.primary} transparent transparent`,
          filter: 'drop-shadow(0 0 10px currentColor)',
        };
      case 'shimmer':
        return {
          borderColor: `transparent ${currentTheme.colors.primary} transparent transparent`,
          background: `conic-gradient(from 0deg, transparent, ${currentTheme.colors.primary})`,
        };
      default:
        return {
          borderColor: `transparent #D4AF37 transparent transparent`,
        };
    }
  };

  const classes = [
    getSizeClass(),
    'rounded-full',
    'animate-spin',
    'mx-auto',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={getVariantStyles()}
    />
  );
};