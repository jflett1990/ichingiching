import React, { ReactNode, HTMLAttributes } from 'react';
import { useTheme } from '../themes/ThemeProvider';

interface LiquidGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'light' | 'medium' | 'heavy' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  morphing?: boolean;
  ripple?: boolean;
  className?: string;
}

const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  variant = 'medium',
  size = 'md',
  interactive = false,
  morphing = false,
  ripple = false,
  className = '',
  ...props
}) => {
  const { currentTheme } = useTheme();

  const getVariantStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    switch (variant) {
      case 'light':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: `0 8px 32px ${currentTheme.colors.shadow}`,
        };

      case 'heavy':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `0 20px 40px ${currentTheme.colors.shadowHeavy}`,
        };

      case 'dark':
        return {
          ...baseStyles,
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: `blur(${currentTheme.effects.blur})`,
          WebkitBackdropFilter: `blur(${currentTheme.effects.blur})`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `0 8px 32px ${currentTheme.colors.shadow}`,
        };

      default: // medium
        return {
          ...baseStyles,
          background: currentTheme.colors.glass,
          backdropFilter: `blur(${currentTheme.effects.blur})`,
          WebkitBackdropFilter: `blur(${currentTheme.effects.blur})`,
          border: `1px solid ${currentTheme.colors.glassBorder}`,
          boxShadow: `0 8px 32px ${currentTheme.colors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: currentTheme.spacing.sm,
          borderRadius: currentTheme.borderRadius.md,
        };
      case 'lg':
        return {
          padding: currentTheme.spacing.xl,
          borderRadius: currentTheme.borderRadius.xl,
        };
      case 'xl':
        return {
          padding: currentTheme.spacing['2xl'],
          borderRadius: currentTheme.borderRadius['2xl'],
        };
      default: // md
        return {
          padding: currentTheme.spacing.md,
          borderRadius: currentTheme.borderRadius.lg,
        };
    }
  };

  const getInteractiveStyles = () => {
    if (!interactive) return {};

    return {
      cursor: 'pointer' as const,
      '&:hover': {
        background: currentTheme.colors.glassHover,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        boxShadow: `0 12px 40px ${currentTheme.colors.shadow}, 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
        transform: 'translateY(-2px)',
      },
    };
  };

  const getClassNames = () => {
    const classes = ['liquid-glass'];
    
    if (morphing) classes.push('glass-morphing');
    if (ripple) classes.push('glass-ripple');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  const combinedStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...getInteractiveStyles(),
  };

  return (
    <div
      className={getClassNames()}
      style={combinedStyles}
      {...props}
    >
      {/* Gradient overlay for depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 50%,
            rgba(255, 255, 255, 0.1) 100%
          )`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LiquidGlassCard;