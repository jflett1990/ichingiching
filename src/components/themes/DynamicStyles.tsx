import React, { useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface DynamicStylesProps {
  includeAnimations?: boolean;
  includeEffects?: boolean;
}

const DynamicStyles: React.FC<DynamicStylesProps> = ({
  includeAnimations = true,
  includeEffects = true,
}) => {
  const { currentTheme, currentThemeId } = useTheme();

  // Generate theme-specific CSS
  const generateThemeStyles = () => {
    const theme = currentTheme;
    let styles = '';

    // Base liquid glass styles
    styles += `
      .liquid-glass {
        background: ${theme.colors.glass};
        backdrop-filter: blur(${theme.effects.blur});
        border: 1px solid ${theme.colors.glassBorder};
        box-shadow: 0 20px 40px ${theme.colors.shadow};
        border-radius: ${theme.borderRadius.xl};
        transition: all ${theme.animations.duration.normal} ${theme.animations.easing.smooth};
      }

      .liquid-glass:hover {
        background: ${theme.colors.glassHover};
        box-shadow: 0 25px 50px ${theme.colors.shadowHeavy};
        transform: translateY(-2px);
      }

      .glass-button {
        background: ${theme.colors.glass};
        backdrop-filter: blur(${theme.effects.blur});
        border: 1px solid ${theme.colors.glassBorder};
        color: ${theme.colors.text};
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        border-radius: ${theme.borderRadius.md};
        font-family: ${theme.typography.primary};
        font-weight: ${theme.typography.weights.medium};
        transition: all ${theme.animations.duration.normal} ${theme.animations.easing.smooth};
        cursor: pointer;
      }

      .glass-button:hover {
        background: ${theme.colors.glassHover};
        transform: translateY(-1px);
        box-shadow: 0 10px 25px ${theme.colors.shadow};
      }

      .glass-button:active {
        transform: translateY(0);
        transition: all ${theme.animations.duration.fast} ${theme.animations.easing.smooth};
      }

      .gradient-text {
        background: ${theme.gradients.primary};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-family: ${theme.typography.secondary};
        font-weight: ${theme.typography.weights.bold};
      }

      .theme-card {
        background: ${theme.gradients.background};
        border-radius: ${theme.borderRadius.xl};
        padding: ${theme.spacing.lg};
        box-shadow: 0 10px 30px ${theme.colors.shadow};
      }
    `;

    // Theme-specific styles
    if (currentThemeId === 'art-nouveau') {
      styles += `
        .art-nouveau-ornament {
          position: relative;
        }

        .art-nouveau-ornament::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
          background: linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary});
          border-radius: ${theme.borderRadius.lg};
          opacity: 0.1;
          z-index: -1;
        }

        .ornate-frame {
          border: 2px solid ${theme.colors.primary};
          position: relative;
          overflow: hidden;
        }

        .ornate-frame::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${theme.colors.primary}20 10px,
            ${theme.colors.primary}20 20px
          );
          pointer-events: none;
        }
      `;
    }

    if (currentThemeId === 'cyberpunk') {
      styles += `
        .cyberpunk-glow {
          box-shadow: 
            0 0 10px ${theme.colors.primary}50,
            0 0 20px ${theme.colors.primary}30,
            0 0 30px ${theme.colors.primary}20;
        }

        .cyberpunk-text {
          text-shadow: 0 0 10px ${theme.colors.primary};
        }

        .scanlines {
          position: relative;
          overflow: hidden;
        }

        .scanlines::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${theme.colors.primary}10 2px,
            ${theme.colors.primary}10 4px
          );
          pointer-events: none;
        }

        .holographic {
          background: linear-gradient(
            45deg,
            ${theme.colors.primary}20,
            ${theme.colors.secondary}20,
            ${theme.colors.accent}20
          );
          animation: holographic-shift 3s ease-in-out infinite;
        }

        @keyframes holographic-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(180deg); }
        }
      `;
    }

    if (currentThemeId === 'pop-art') {
      styles += `
        .pop-art-shadow {
          box-shadow: 
            8px 8px 0 ${theme.colors.primary},
            16px 16px 0 ${theme.colors.secondary};
        }

        .comic-bubble {
          position: relative;
          background: ${theme.colors.background};
          border: 3px solid ${theme.colors.text};
          border-radius: 20px;
          padding: ${theme.spacing.md};
        }

        .comic-bubble::before {
          content: '';
          position: absolute;
          bottom: -15px;
          left: 30px;
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 15px solid ${theme.colors.text};
        }

        .halftone-pattern {
          background-image: radial-gradient(
            circle,
            ${theme.colors.primary} 20%,
            transparent 20%
          );
          background-size: 10px 10px;
        }
      `;
    }

    if (currentThemeId === 'traditional-zen') {
      styles += `
        .zen-texture {
          background-image: 
            radial-gradient(circle at 20% 50%, ${theme.colors.primary}05 20%, transparent 20%),
            radial-gradient(circle at 80% 50%, ${theme.colors.secondary}05 20%, transparent 20%);
          background-size: 50px 50px;
        }

        .ink-brush {
          position: relative;
          border-radius: 0;
        }

        .ink-brush::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            ${theme.colors.primary}10,
            transparent 30%,
            ${theme.colors.secondary}10
          );
          border-radius: ${theme.borderRadius.sm};
        }

        .paper-texture {
          background-image: 
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              ${theme.colors.primary}05 2px,
              ${theme.colors.primary}05 4px
            );
        }
      `;
    }

    // Animation styles
    if (includeAnimations) {
      styles += `
        .fade-in {
          animation: fade-in ${theme.animations.duration.slow} ${theme.animations.easing.smooth};
        }

        .slide-up {
          animation: slide-up ${theme.animations.duration.normal} ${theme.animations.easing.smooth};
        }

        .scale-in {
          animation: scale-in ${theme.animations.duration.normal} ${theme.animations.easing.bounce};
        }

        .pulse {
          animation: pulse 2s ${theme.animations.easing.smooth} infinite;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.8);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `;
    }

    // Particle system styles
    if (includeEffects) {
      styles += `
        .particle-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: ${theme.colors.primary};
          border-radius: 50%;
          opacity: 0.6;
          animation: particle-float 6s ease-in-out infinite;
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-100px) rotate(180deg);
            opacity: 0.6;
          }
        }
      `;
    }

    return styles;
  };

  // Update styles when theme changes
  useEffect(() => {
    const styleId = 'dynamic-theme-styles';
    const existingStyle = document.getElementById(styleId);
    
    if (existingStyle) {
      existingStyle.remove();
    }

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = generateThemeStyles();
    document.head.appendChild(styleElement);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [currentTheme, currentThemeId, includeAnimations, includeEffects]);

  return null;
};

export default DynamicStyles;