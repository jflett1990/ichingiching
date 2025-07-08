import React from 'react';
import { useTheme } from './ThemeProvider';

interface ArtNouveauDecorativeProps {
  variant?: 'ornament' | 'frame' | 'border' | 'corner' | 'divider' | 'flourish';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const ArtNouveauDecorative: React.FC<ArtNouveauDecorativeProps> = ({
  variant = 'ornament',
  size = 'md',
  className = '',
  style = {},
}) => {
  const { currentTheme } = useTheme();

  const getSizeMultiplier = () => {
    switch (size) {
      case 'sm':
        return 0.7;
      case 'lg':
        return 1.4;
      default:
        return 1;
    }
  };

  const baseStyle = {
    fill: currentTheme.colors.primary,
    stroke: currentTheme.colors.secondary,
    strokeWidth: 1,
    transform: `scale(${getSizeMultiplier()})`,
    transformOrigin: 'center',
  };

  const getOrnamentSvg = () => (
    <svg
      width="60"
      height="60"
      viewBox="0 0 60 60"
      className={`art-nouveau-ornament ${className}`}
      style={{ ...baseStyle, ...style }}
    >
      <path
        d="M30 10 C20 15, 15 20, 10 30 C15 35, 20 40, 30 50 C40 40, 45 35, 50 30 C45 20, 40 15, 30 10 Z"
        fill="none"
        stroke={currentTheme.colors.primary}
        strokeWidth="2"
      />
      <path
        d="M30 15 C25 20, 20 25, 15 30 C20 35, 25 40, 30 45 C35 40, 40 35, 45 30 C40 25, 35 20, 30 15 Z"
        fill={currentTheme.colors.primary}
        opacity="0.3"
      />
      <circle
        cx="30"
        cy="30"
        r="5"
        fill={currentTheme.colors.secondary}
      />
      <circle
        cx="30"
        cy="30"
        r="2"
        fill={currentTheme.colors.accent}
      />
    </svg>
  );

  const getFrameSvg = () => (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      className={`art-nouveau-frame ${className}`}
      style={{ ...baseStyle, ...style }}
    >
      <defs>
        <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={currentTheme.colors.primary} />
          <stop offset="100%" stopColor={currentTheme.colors.secondary} />
        </linearGradient>
      </defs>
      
      {/* Corner ornaments */}
      <path
        d="M10 10 Q20 5, 30 10 Q25 20, 10 30 Q5 20, 10 10 Z"
        fill="url(#frameGradient)"
        opacity="0.8"
      />
      <path
        d="M170 10 Q180 5, 190 10 Q195 20, 190 30 Q175 20, 170 10 Z"
        fill="url(#frameGradient)"
        opacity="0.8"
      />
      <path
        d="M10 170 Q5 180, 10 190 Q20 195, 30 190 Q25 175, 10 170 Z"
        fill="url(#frameGradient)"
        opacity="0.8"
      />
      <path
        d="M170 170 Q175 180, 190 190 Q195 180, 190 170 Q180 175, 170 170 Z"
        fill="url(#frameGradient)"
        opacity="0.8"
      />
      
      {/* Frame edges */}
      <path
        d="M40 10 Q100 5, 160 10 Q100 15, 40 10 Z"
        fill="url(#frameGradient)"
        opacity="0.6"
      />
      <path
        d="M190 40 Q195 100, 190 160 Q185 100, 190 40 Z"
        fill="url(#frameGradient)"
        opacity="0.6"
      />
      <path
        d="M160 190 Q100 195, 40 190 Q100 185, 160 190 Z"
        fill="url(#frameGradient)"
        opacity="0.6"
      />
      <path
        d="M10 160 Q5 100, 10 40 Q15 100, 10 160 Z"
        fill="url(#frameGradient)"
        opacity="0.6"
      />
    </svg>
  );

  const getBorderSvg = () => (
    <svg
      width="100%"
      height="20"
      viewBox="0 0 400 20"
      className={`art-nouveau-border ${className}`}
      style={{ ...baseStyle, ...style }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="borderPattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M0 10 Q10 5, 20 10 Q30 15, 40 10"
            fill="none"
            stroke={currentTheme.colors.primary}
            strokeWidth="2"
          />
          <circle cx="10" cy="10" r="2" fill={currentTheme.colors.secondary} opacity="0.7" />
          <circle cx="30" cy="10" r="2" fill={currentTheme.colors.accent} opacity="0.7" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#borderPattern)" />
    </svg>
  );

  const getCornerSvg = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className={`art-nouveau-corner ${className}`}
      style={{ ...baseStyle, ...style }}
    >
      <path
        d="M5 5 Q15 0, 25 5 Q35 10, 35 20 Q30 30, 20 35 Q10 35, 5 25 Q0 15, 5 5 Z"
        fill={currentTheme.colors.primary}
        opacity="0.3"
      />
      <path
        d="M5 5 Q15 0, 25 5 Q35 10, 35 20"
        fill="none"
        stroke={currentTheme.colors.primary}
        strokeWidth="2"
      />
      <path
        d="M35 20 Q30 30, 20 35 Q10 35, 5 25"
        fill="none"
        stroke={currentTheme.colors.secondary}
        strokeWidth="2"
      />
      <circle cx="20" cy="20" r="3" fill={currentTheme.colors.accent} />
    </svg>
  );

  const getDividerSvg = () => (
    <svg
      width="100%"
      height="30"
      viewBox="0 0 300 30"
      className={`art-nouveau-divider ${className}`}
      style={{ ...baseStyle, ...style }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="dividerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={currentTheme.colors.primary} stopOpacity="0" />
          <stop offset="50%" stopColor={currentTheme.colors.primary} stopOpacity="1" />
          <stop offset="100%" stopColor={currentTheme.colors.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      <path
        d="M0 15 Q75 10, 150 15 Q225 20, 300 15"
        fill="none"
        stroke="url(#dividerGradient)"
        strokeWidth="2"
      />
      <path
        d="M0 15 Q75 20, 150 15 Q225 10, 300 15"
        fill="none"
        stroke={currentTheme.colors.secondary}
        strokeWidth="1"
        opacity="0.7"
      />
      
      {/* Central ornament */}
      <circle cx="150" cy="15" r="4" fill={currentTheme.colors.primary} />
      <circle cx="150" cy="15" r="2" fill={currentTheme.colors.accent} />
      
      {/* Side ornaments */}
      <circle cx="75" cy="15" r="2" fill={currentTheme.colors.secondary} opacity="0.8" />
      <circle cx="225" cy="15" r="2" fill={currentTheme.colors.secondary} opacity="0.8" />
    </svg>
  );

  const getFlourishSvg = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      className={`art-nouveau-flourish ${className}`}
      style={{ ...baseStyle, ...style }}
    >
      <defs>
        <radialGradient id="flourishGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={currentTheme.colors.accent} />
          <stop offset="100%" stopColor={currentTheme.colors.primary} />
        </radialGradient>
      </defs>
      
      <path
        d="M40 20 Q30 10, 20 20 Q10 30, 20 40 Q30 50, 40 40 Q50 30, 60 40 Q70 50, 60 60 Q50 70, 40 60 Q30 50, 40 40 Q50 30, 40 20 Z"
        fill="url(#flourishGradient)"
        opacity="0.6"
      />
      <path
        d="M40 25 Q35 20, 30 25 Q25 30, 30 35 Q35 40, 40 35 Q45 30, 50 35 Q55 40, 50 45 Q45 50, 40 45 Q35 40, 40 35 Q45 30, 40 25 Z"
        fill="none"
        stroke={currentTheme.colors.primary}
        strokeWidth="2"
      />
      <circle cx="40" cy="40" r="3" fill={currentTheme.colors.secondary} />
    </svg>
  );

  const renderVariant = () => {
    switch (variant) {
      case 'frame':
        return getFrameSvg();
      case 'border':
        return getBorderSvg();
      case 'corner':
        return getCornerSvg();
      case 'divider':
        return getDividerSvg();
      case 'flourish':
        return getFlourishSvg();
      default:
        return getOrnamentSvg();
    }
  };

  return (
    <div
      className={`art-nouveau-decorative art-nouveau-${variant} ${className}`}
      style={style}
    >
      {renderVariant()}
    </div>
  );
};

export default ArtNouveauDecorative;