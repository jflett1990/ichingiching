import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface CyberpunkEffectsProps {
  variant?: 'glow' | 'scanlines' | 'holographic' | 'glitch' | 'matrix' | 'neon-border';
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const CyberpunkEffects: React.FC<CyberpunkEffectsProps> = ({
  variant = 'glow',
  intensity = 'medium',
  children,
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);
  const [glitchText, setGlitchText] = useState('');

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'low':
        return 0.5;
      case 'high':
        return 1.5;
      default:
        return 1;
    }
  };

  const getGlowStyles = () => {
    const multiplier = getIntensityMultiplier();
    return {
      boxShadow: `
        0 0 ${10 * multiplier}px ${currentTheme.colors.primary}50,
        0 0 ${20 * multiplier}px ${currentTheme.colors.primary}30,
        0 0 ${30 * multiplier}px ${currentTheme.colors.primary}20,
        inset 0 0 ${15 * multiplier}px ${currentTheme.colors.primary}10
      `,
      border: `1px solid ${currentTheme.colors.primary}80`,
      animation: `cyberpunk-pulse ${3 / multiplier}s ease-in-out infinite`,
    };
  };

  const getScanlinesStyles = () => {
    return {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          ${currentTheme.colors.primary}20 2px,
          ${currentTheme.colors.primary}20 4px
        )`,
        pointerEvents: 'none' as const,
        zIndex: 1,
        animation: 'scanlines-move 1s linear infinite',
      },
    };
  };

  const getHolographicStyles = () => {
    const multiplier = getIntensityMultiplier();
    return {
      background: `linear-gradient(
        45deg,
        ${currentTheme.colors.primary}20,
        ${currentTheme.colors.secondary}20,
        ${currentTheme.colors.accent}20
      )`,
      animation: `holographic-shift ${5 / multiplier}s ease-in-out infinite`,
      backgroundSize: '200% 200%',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };
  };

  const getNeonBorderStyles = () => {
    const multiplier = getIntensityMultiplier();
    return {
      border: `2px solid ${currentTheme.colors.primary}`,
      boxShadow: `
        0 0 ${5 * multiplier}px ${currentTheme.colors.primary},
        inset 0 0 ${5 * multiplier}px ${currentTheme.colors.primary}20
      `,
      animation: `neon-flicker ${2 / multiplier}s ease-in-out infinite`,
    };
  };

  const getMatrixStyles = () => {
    return {
      background: `linear-gradient(
        0deg,
        ${currentTheme.colors.background},
        ${currentTheme.colors.primary}10
      )`,
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };
  };

  const getGlitchStyles = () => {
    return {
      position: 'relative' as const,
      color: currentTheme.colors.text,
      animation: `glitch-base 0.5s ease-in-out infinite`,
    };
  };

  // Generate glitch text effect
  useEffect(() => {
    if (variant === 'glitch' && typeof children === 'string') {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const interval = setInterval(() => {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        setGlitchText(randomChar);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [variant, children]);

  const renderScanlines = () => (
    <div
      className="cyberpunk-scanlines"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          ${currentTheme.colors.primary}15 2px,
          ${currentTheme.colors.primary}15 4px
        )`,
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'scanlines-move 2s linear infinite',
      }}
    />
  );

  const renderMatrix = () => {
    const matrixChars = Array.from({ length: 20 }, (_, i) => (
      <div
        key={i}
        className="matrix-char"
        style={{
          position: 'absolute',
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          color: currentTheme.colors.primary,
          fontSize: `${Math.random() * 10 + 8}px`,
          fontFamily: 'monospace',
          animation: `matrix-fall ${Math.random() * 3 + 2}s linear infinite`,
          animationDelay: `${Math.random() * 2}s`,
        }}
      >
        {String.fromCharCode(0x30A0 + Math.random() * 96)}
      </div>
    ));

    return (
      <div
        className="matrix-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.3,
        }}
      >
        {matrixChars}
      </div>
    );
  };

  const renderGlitch = () => (
    <>
      <div
        className="glitch-overlay glitch-1"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${currentTheme.colors.primary}20, transparent)`,
          animation: 'glitch-1 0.3s ease-in-out infinite',
          zIndex: 1,
        }}
      />
      <div
        className="glitch-overlay glitch-2"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent, ${currentTheme.colors.secondary}20, transparent)`,
          animation: 'glitch-2 0.4s ease-in-out infinite',
          animationDelay: '0.1s',
          zIndex: 1,
        }}
      />
      {glitchText && (
        <div
          className="glitch-text"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: currentTheme.colors.primary,
            fontSize: '1.2em',
            fontFamily: 'monospace',
            zIndex: 2,
            animation: 'glitch-text 0.1s ease-in-out infinite',
          }}
        >
          {glitchText}
        </div>
      )}
    </>
  );

  const getVariantStyles = () => {
    switch (variant) {
      case 'glow':
        return getGlowStyles();
      case 'scanlines':
        return getScanlinesStyles();
      case 'holographic':
        return getHolographicStyles();
      case 'neon-border':
        return getNeonBorderStyles();
      case 'matrix':
        return getMatrixStyles();
      case 'glitch':
        return getGlitchStyles();
      default:
        return {};
    }
  };

  // Inject cyberpunk animations
  useEffect(() => {
    const styleId = 'cyberpunk-animations';
    const existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes cyberpunk-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }

        @keyframes scanlines-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }

        @keyframes holographic-shift {
          0%, 100% { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          50% { 
            background-position: 100% 50%;
            filter: hue-rotate(180deg);
          }
        }

        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
          75% { opacity: 0.9; }
        }

        @keyframes matrix-fall {
          0% { transform: translateY(-100px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }

        @keyframes glitch-base {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes glitch-1 {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }

        @keyframes glitch-2 {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(1px); }
          50% { transform: translateX(-1px); }
          75% { transform: translateX(2px); }
        }

        @keyframes glitch-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.1; }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Don't remove styles as they may be used by other components
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={`cyberpunk-effects cyberpunk-${variant} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
    >
      {variant === 'scanlines' && renderScanlines()}
      {variant === 'matrix' && renderMatrix()}
      {variant === 'glitch' && renderGlitch()}
      
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

export default CyberpunkEffects;