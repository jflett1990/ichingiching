import React, { useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface PopArtEffectsProps {
  variant?: 'bold-shadow' | 'halftone' | 'comic-bubble' | 'retro-badge' | 'speech-bubble' | 'pop-frame';
  intensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PopArtEffects: React.FC<PopArtEffectsProps> = ({
  variant = 'bold-shadow',
  intensity = 'medium',
  children,
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme();

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

  const getBoldShadowStyles = () => {
    const multiplier = getIntensityMultiplier();
    const shadowSize = 8 * multiplier;
    const shadowSize2 = 16 * multiplier;
    
    return {
      boxShadow: `
        ${shadowSize}px ${shadowSize}px 0 ${currentTheme.colors.primary},
        ${shadowSize2}px ${shadowSize2}px 0 ${currentTheme.colors.secondary}
      `,
      border: `3px solid ${currentTheme.colors.text}`,
      transform: 'translateZ(0)', // Force hardware acceleration
      transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    };
  };

  const getHalftoneStyles = () => {
    const multiplier = getIntensityMultiplier();
    const dotSize = 8 * multiplier;
    
    return {
      background: `
        radial-gradient(circle, ${currentTheme.colors.primary} 20%, transparent 20%),
        radial-gradient(circle, ${currentTheme.colors.secondary} 20%, transparent 20%),
        ${currentTheme.colors.background}
      `,
      backgroundSize: `${dotSize}px ${dotSize}px, ${dotSize * 1.5}px ${dotSize * 1.5}px, 100% 100%`,
      backgroundPosition: `0 0, ${dotSize / 2}px ${dotSize / 2}px, 0 0`,
      animation: 'halftone-pulse 3s ease-in-out infinite',
    };
  };

  const getComicBubbleStyles = () => {
    const multiplier = getIntensityMultiplier();
    const borderWidth = 3 * multiplier;
    
    return {
      background: currentTheme.colors.background,
      border: `${borderWidth}px solid ${currentTheme.colors.text}`,
      borderRadius: '20px',
      padding: `${16 * multiplier}px`,
      position: 'relative' as const,
      boxShadow: `4px 4px 0 ${currentTheme.colors.primary}`,
    };
  };

  const getRetroBadgeStyles = () => {
    const multiplier = getIntensityMultiplier();
    
    return {
      background: `linear-gradient(45deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
      color: 'white',
      padding: `${8 * multiplier}px ${16 * multiplier}px`,
      borderRadius: '25px',
      border: `3px solid ${currentTheme.colors.text}`,
      boxShadow: `
        0 0 0 ${3 * multiplier}px ${currentTheme.colors.background},
        0 0 0 ${6 * multiplier}px ${currentTheme.colors.text}
      `,
      fontWeight: 'bold',
      textTransform: 'uppercase' as const,
      animation: 'retro-bounce 2s ease-in-out infinite',
    };
  };

  const getSpeechBubbleStyles = () => {
    const multiplier = getIntensityMultiplier();
    
    return {
      background: currentTheme.colors.background,
      border: `3px solid ${currentTheme.colors.text}`,
      borderRadius: '20px',
      padding: `${16 * multiplier}px`,
      position: 'relative' as const,
      boxShadow: `4px 4px 0 ${currentTheme.colors.primary}`,
    };
  };

  const getPopFrameStyles = () => {
    const multiplier = getIntensityMultiplier();
    
    return {
      border: `${6 * multiplier}px solid ${currentTheme.colors.text}`,
      borderRadius: '12px',
      padding: `${20 * multiplier}px`,
      background: `
        linear-gradient(45deg, ${currentTheme.colors.primary}20, ${currentTheme.colors.secondary}20),
        ${currentTheme.colors.background}
      `,
      boxShadow: `
        0 0 0 ${4 * multiplier}px ${currentTheme.colors.background},
        0 0 0 ${8 * multiplier}px ${currentTheme.colors.text},
        ${12 * multiplier}px ${12 * multiplier}px 0 ${currentTheme.colors.primary}
      `,
      position: 'relative' as const,
    };
  };

  const renderComicBubbleTail = () => (
    <div
      className="comic-bubble-tail"
      style={{
        position: 'absolute',
        bottom: '-15px',
        left: '30px',
        width: 0,
        height: 0,
        borderLeft: '15px solid transparent',
        borderRight: '15px solid transparent',
        borderTop: `15px solid ${currentTheme.colors.text}`,
        zIndex: 1,
      }}
    />
  );

  const renderSpeechBubbleTail = () => (
    <div
      className="speech-bubble-tail"
      style={{
        position: 'absolute',
        bottom: '-18px',
        left: '30px',
        width: 0,
        height: 0,
        borderLeft: '18px solid transparent',
        borderRight: '18px solid transparent',
        borderTop: `18px solid ${currentTheme.colors.text}`,
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: '3px',
          left: '-15px',
          width: 0,
          height: 0,
          borderLeft: '15px solid transparent',
          borderRight: '15px solid transparent',
          borderTop: `15px solid ${currentTheme.colors.background}`,
        }}
      />
    </div>
  );

  const renderHalftonePattern = () => (
    <div
      className="halftone-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle, ${currentTheme.colors.primary}40 20%, transparent 20%),
          radial-gradient(circle, ${currentTheme.colors.secondary}40 20%, transparent 20%)
        `,
        backgroundSize: '10px 10px, 15px 15px',
        backgroundPosition: '0 0, 5px 5px',
        pointerEvents: 'none',
        zIndex: 1,
        animation: 'halftone-shift 4s ease-in-out infinite',
      }}
    />
  );

  const renderPopFrameCorners = () => (
    <>
      <div
        className="pop-frame-corner top-left"
        style={{
          position: 'absolute',
          top: '-3px',
          left: '-3px',
          width: '20px',
          height: '20px',
          background: currentTheme.colors.primary,
          borderRadius: '50%',
          zIndex: 2,
        }}
      />
      <div
        className="pop-frame-corner top-right"
        style={{
          position: 'absolute',
          top: '-3px',
          right: '-3px',
          width: '20px',
          height: '20px',
          background: currentTheme.colors.secondary,
          borderRadius: '50%',
          zIndex: 2,
        }}
      />
      <div
        className="pop-frame-corner bottom-left"
        style={{
          position: 'absolute',
          bottom: '-3px',
          left: '-3px',
          width: '20px',
          height: '20px',
          background: currentTheme.colors.accent,
          borderRadius: '50%',
          zIndex: 2,
        }}
      />
      <div
        className="pop-frame-corner bottom-right"
        style={{
          position: 'absolute',
          bottom: '-3px',
          right: '-3px',
          width: '20px',
          height: '20px',
          background: currentTheme.colors.primary,
          borderRadius: '50%',
          zIndex: 2,
        }}
      />
    </>
  );

  const getVariantStyles = () => {
    switch (variant) {
      case 'bold-shadow':
        return getBoldShadowStyles();
      case 'halftone':
        return getHalftoneStyles();
      case 'comic-bubble':
        return getComicBubbleStyles();
      case 'retro-badge':
        return getRetroBadgeStyles();
      case 'speech-bubble':
        return getSpeechBubbleStyles();
      case 'pop-frame':
        return getPopFrameStyles();
      default:
        return {};
    }
  };

  // Inject pop art animations
  useEffect(() => {
    const styleId = 'pop-art-animations';
    const existingStyle = document.getElementById(styleId);
    
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes halftone-pulse {
          0%, 100% { 
            background-size: 8px 8px, 12px 12px, 100% 100%;
            opacity: 1;
          }
          50% { 
            background-size: 12px 12px, 18px 18px, 100% 100%;
            opacity: 0.9;
          }
        }

        @keyframes halftone-shift {
          0%, 100% { 
            background-position: 0 0, 5px 5px;
          }
          50% { 
            background-position: 5px 5px, 10px 10px;
          }
        }

        @keyframes retro-bounce {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          50% { 
            transform: scale(1.05) rotate(1deg);
          }
        }

        @keyframes pop-wiggle {
          0%, 100% { 
            transform: rotate(0deg);
          }
          25% { 
            transform: rotate(1deg);
          }
          75% { 
            transform: rotate(-1deg);
          }
        }

        @keyframes pop-shadow-dance {
          0%, 100% { 
            box-shadow: 8px 8px 0 var(--color-primary), 16px 16px 0 var(--color-secondary);
          }
          50% { 
            box-shadow: 12px 12px 0 var(--color-primary), 20px 20px 0 var(--color-secondary);
          }
        }

        @keyframes comic-zoom {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.02);
          }
        }

        .pop-art-effects:hover.pop-art-bold-shadow {
          animation: pop-shadow-dance 0.5s ease-in-out;
        }

        .pop-art-effects:hover.pop-art-comic-bubble {
          animation: comic-zoom 0.3s ease-in-out;
        }

        .pop-art-effects:hover.pop-art-retro-badge {
          animation: pop-wiggle 0.2s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .pop-art-effects * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <div
      className={`pop-art-effects pop-art-${variant} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
    >
      {variant === 'comic-bubble' && renderComicBubbleTail()}
      {variant === 'speech-bubble' && renderSpeechBubbleTail()}
      {variant === 'halftone' && renderHalftonePattern()}
      {variant === 'pop-frame' && renderPopFrameCorners()}
      
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

export default PopArtEffects;