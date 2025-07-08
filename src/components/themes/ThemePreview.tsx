import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ThemePreviewProps {
  themeId?: string;
  className?: string;
  showInteractive?: boolean;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({
  themeId,
  className = '',
  showInteractive = true,
}) => {
  const { themes, currentThemeId } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const previewTheme = themeId ? themes[themeId] : themes[currentThemeId];
  const effectiveThemeId = themeId || currentThemeId;

  if (!previewTheme) {
    return <div>Theme not found</div>;
  }

  const getThemeSpecificElements = () => {
    switch (effectiveThemeId) {
      case 'art-nouveau':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-current rounded-full opacity-20" />
            <div className="absolute bottom-2 right-2 w-12 h-12 border-2 border-current rounded-full opacity-15" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 border border-current rounded-full opacity-10" />
            </div>
          </div>
        );
      
      case 'cyberpunk':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-cyan-500/10 to-magenta-500/10" />
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-current rounded-full animate-pulse" />
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        );
      
      case 'pop-art':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-current opacity-30" />
            <div className="absolute top-3 right-3 w-4 h-4 rounded-sm bg-current opacity-25" />
            <div className="absolute bottom-2 left-1/2 w-8 h-2 bg-current opacity-20" />
          </div>
        );
      
      case 'traditional-zen':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-3 left-3 w-12 h-0.5 bg-current opacity-20" />
            <div className="absolute bottom-3 right-3 w-8 h-0.5 bg-current opacity-15" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border border-current rounded-full opacity-10" />
            </div>
          </div>
        );
      
      default:
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-current opacity-20" />
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-current opacity-15" />
          </div>
        );
    }
  };

  const getGlowEffect = () => {
    if (effectiveThemeId === 'cyberpunk') {
      return {
        boxShadow: `0 0 20px ${previewTheme.colors.primary}30`,
      };
    }
    return {};
  };

  return (
    <div className={`theme-preview ${className}`}>
      <div className="space-y-4">
        {/* Theme Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: previewTheme.colors.text }}>
              {previewTheme.name}
            </h3>
            <p className="text-sm opacity-80" style={{ color: previewTheme.colors.textSecondary }}>
              {previewTheme.description}
            </p>
          </div>
          {previewTheme.isPremium && (
            <div className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-medium">
              Premium
            </div>
          )}
        </div>

        {/* Main Preview Card */}
        <div
          className="relative p-6 rounded-xl border transition-all duration-300 overflow-hidden"
          style={{
            background: previewTheme.gradients.background,
            borderColor: previewTheme.colors.glassBorder,
            ...getGlowEffect(),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Theme-specific background elements */}
          {getThemeSpecificElements()}

          {/* Content */}
          <div className="relative z-10 space-y-4">
            {/* Glass Card Example */}
            <div
              className="p-4 rounded-lg border backdrop-blur-sm transition-all duration-300"
              style={{
                background: previewTheme.colors.glass,
                borderColor: previewTheme.colors.glassBorder,
                backdropFilter: `blur(${previewTheme.effects.blur})`,
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isHovered 
                  ? `0 10px 30px ${previewTheme.colors.shadow}` 
                  : `0 5px 20px ${previewTheme.colors.shadow}`,
              }}
            >
              <h4 
                className="font-medium mb-2"
                style={{ 
                  color: previewTheme.colors.text,
                  fontFamily: previewTheme.typography.primary,
                }}
              >
                Hexagram Reading
              </h4>
              <p 
                className="text-sm opacity-90"
                style={{ color: previewTheme.colors.textSecondary }}
              >
                Your question reveals wisdom through ancient symbols
              </p>
            </div>

            {/* Color Palette */}
            <div className="flex space-x-2">
              <div
                className="w-8 h-8 rounded-full border border-white border-opacity-30 flex-shrink-0"
                style={{ backgroundColor: previewTheme.colors.primary }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded-full border border-white border-opacity-30 flex-shrink-0"
                style={{ backgroundColor: previewTheme.colors.secondary }}
                title="Secondary"
              />
              <div
                className="w-8 h-8 rounded-full border border-white border-opacity-30 flex-shrink-0"
                style={{ backgroundColor: previewTheme.colors.accent }}
                title="Accent"
              />
              <div className="flex-1 flex items-center">
                <div
                  className="flex-1 h-8 rounded border border-white border-opacity-30"
                  style={{ background: previewTheme.gradients.primary }}
                />
              </div>
            </div>

            {/* Interactive Elements */}
            {showInteractive && (
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 rounded-md border backdrop-blur-sm transition-all duration-200 hover:scale-105"
                  style={{
                    background: previewTheme.colors.glass,
                    borderColor: previewTheme.colors.glassBorder,
                    color: previewTheme.colors.text,
                    fontFamily: previewTheme.typography.primary,
                  }}
                >
                  Button
                </button>
                <div
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    background: previewTheme.gradients.primary,
                    color: 'white',
                  }}
                >
                  Gradient
                </div>
              </div>
            )}

            {/* Typography Preview */}
            <div className="space-y-2">
              <div
                className="text-lg font-bold"
                style={{
                  background: previewTheme.gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: previewTheme.typography.secondary,
                }}
              >
                The Creative
              </div>
              <div
                className="text-sm"
                style={{
                  color: previewTheme.colors.textSecondary,
                  fontFamily: previewTheme.typography.primary,
                }}
              >
                Heaven above, Heaven below
              </div>
            </div>
          </div>
        </div>

        {/* Theme Features */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="font-medium" style={{ color: previewTheme.colors.text }}>
              Effects
            </div>
            <div className="opacity-80" style={{ color: previewTheme.colors.textSecondary }}>
              Blur: {previewTheme.effects.blur}
            </div>
            <div className="opacity-80" style={{ color: previewTheme.colors.textSecondary }}>
              Glow: {previewTheme.effects.glowIntensity}
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-medium" style={{ color: previewTheme.colors.text }}>
              Typography
            </div>
            <div className="opacity-80" style={{ color: previewTheme.colors.textSecondary }}>
              {previewTheme.typography.primary.split(',')[0]}
            </div>
            <div className="opacity-80" style={{ color: previewTheme.colors.textSecondary }}>
              {previewTheme.typography.secondary.split(',')[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;