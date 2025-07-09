import React, { ReactNode, HTMLAttributes } from 'react';
import { useTheme } from '../themes/ThemeProvider';

interface LiquidGlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'light' | 'medium' | 'heavy' | 'dark' | 'luxury' | 'ultra' | 'crystal';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  interactive?: boolean;
  morphing?: boolean;
  ripple?: boolean;
  floating?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  className?: string;
}

const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  variant = 'medium',
  size = 'md',
  interactive = false,
  morphing = false,
  ripple = false,
  floating = false,
  shimmer = false,
  glow = false,
  className = '',
  ...props
}) => {
  const { currentTheme } = useTheme();

  const getVariantStyles = () => {
    const baseStyles = {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    switch (variant) {
      case 'light':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: `0 10px 40px ${currentTheme.colors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
        };

      case 'heavy':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(35px)',
          WebkitBackdropFilter: 'blur(35px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `0 25px 50px ${currentTheme.colors.shadowHeavy}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        };

      case 'dark':
        return {
          ...baseStyles,
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: `blur(${currentTheme.effects.blur})`,
          WebkitBackdropFilter: `blur(${currentTheme.effects.blur})`,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `0 15px 40px ${currentTheme.colors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
        };

      case 'luxury':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: `
            0 20px 40px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05)
          `,
        };

      case 'ultra':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 30px 60px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 2px 0 rgba(255, 255, 255, 0.1),
            inset 0 -1px 0 rgba(0, 0, 0, 0.08)
          `,
        };

      case 'crystal':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `
            0 15px 35px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `,
        };

      default: // medium
        return {
          ...baseStyles,
          background: currentTheme.colors.glass,
          backdropFilter: `blur(${currentTheme.effects.blur})`,
          WebkitBackdropFilter: `blur(${currentTheme.effects.blur})`,
          border: `1px solid ${currentTheme.colors.glassBorder}`,
          boxShadow: `0 12px 35px ${currentTheme.colors.shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.15)`,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '1rem',
          borderRadius: '0.75rem',
        };
      case 'lg':
        return {
          padding: '2rem',
          borderRadius: '1.25rem',
        };
      case 'xl':
        return {
          padding: '2.5rem',
          borderRadius: '1.5rem',
        };
      case '2xl':
        return {
          padding: '3rem',
          borderRadius: '2rem',
        };
      default: // md
        return {
          padding: '1.5rem',
          borderRadius: '1rem',
        };
    }
  };

  const getInteractiveStyles = () => {
    if (!interactive) return {};

    return {
      cursor: 'pointer' as const,
      transform: 'translateZ(0)', // Optimize for hardware acceleration
    };
  };

  const getClassNames = () => {
    const classes = ['liquid-glass'];
    
    if (morphing) classes.push('glass-morphing');
    if (ripple) classes.push('glass-ripple');
    if (floating) classes.push('float-gentle');
    if (shimmer) classes.push('loading-luxury');
    if (glow) classes.push('hover-glow');
    if (interactive) classes.push('hover-lift', 'interactive-luxury');
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
      {/* Enhanced gradient overlay for luxury depth */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: variant === 'luxury' || variant === 'ultra' 
            ? `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.15) 0%,
                rgba(255, 255, 255, 0.05) 30%,
                rgba(255, 255, 255, 0.1) 70%,
                rgba(255, 255, 255, 0.15) 100%
              )`
            : `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.1) 0%,
                rgba(255, 255, 255, 0.05) 50%,
                rgba(255, 255, 255, 0.1) 100%
              )`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      
      {/* Premium top highlight */}
      {(variant === 'luxury' || variant === 'ultra' || variant === 'crystal') && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
            zIndex: 2,
          }}
        />
      )}

      {/* Shimmer effect overlay */}
      {shimmer && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            backgroundSize: '200% 100%',
            animation: 'luxury-shimmer 3s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* Glow effect */}
      {glow && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: `linear-gradient(135deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
            borderRadius: 'inherit',
            filter: 'blur(8px)',
            opacity: 0.3,
            zIndex: -1,
            animation: 'glow-pulse 2s ease-in-out infinite',
          }}
        />
      )}
      
      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default LiquidGlassCard;