import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeSelectorProps {
  className?: string;
  showPremiumUpgrade?: boolean;
  onPremiumUpgrade?: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  showPremiumUpgrade = true,
  onPremiumUpgrade,
}) => {
  const {
    currentThemeId,
    themes,
    setTheme,
    isThemeUnlocked,
    isPremiumUser,
  } = useTheme();
  
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const themeEntries = Object.entries(themes);

  const handleThemeSelect = (themeId: string) => {
    if (isThemeUnlocked(themeId)) {
      setTheme(themeId);
    } else if (onPremiumUpgrade) {
      onPremiumUpgrade();
    }
  };

  const getPremiumBadge = () => (
    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-lg">
      Premium
    </div>
  );

  const getLockedOverlay = () => (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
      <div className="text-center">
        <div className="w-6 h-6 mx-auto mb-2 opacity-60">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
          </svg>
        </div>
        <div className="text-xs text-white font-medium">Locked</div>
      </div>
    </div>
  );

  return (
    <div className={`theme-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
          Choose Your Theme
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {isPremiumUser 
            ? "Select from all available themes" 
            : "Upgrade to premium to unlock all themes"
          }
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {themeEntries.map(([themeId, theme]) => {
          const isSelected = currentThemeId === themeId;
          const isUnlocked = isThemeUnlocked(themeId);
          const isPremium = theme.isPremium;

          return (
            <div
              key={themeId}
              className="relative group cursor-pointer"
              onClick={() => handleThemeSelect(themeId)}
              onMouseEnter={() => setShowTooltip(themeId)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              {/* Theme Preview Card */}
              <div
                className={`
                  relative overflow-hidden rounded-lg border-2 transition-all duration-300
                  ${isSelected
                    ? 'border-[var(--color-primary)] shadow-lg scale-105'
                    : 'border-transparent hover:border-[var(--color-primary)] hover:shadow-md'
                  }
                  ${!isUnlocked ? 'opacity-75' : ''}
                `}
                style={{
                  background: theme.gradients.background,
                  height: '120px',
                }}
              >
                {/* Theme Color Swatches */}
                <div className="absolute inset-0 p-3">
                  <div className="flex space-x-1 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-white border-opacity-20"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-white border-opacity-20"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-white border-opacity-20"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  
                  {/* Glass Effect Preview */}
                  <div
                    className="w-full h-8 rounded border border-white border-opacity-20"
                    style={{
                      background: theme.colors.glass,
                      backdropFilter: `blur(${theme.effects.blur})`,
                    }}
                  />
                </div>

                {/* Theme Name */}
                <div className="absolute bottom-2 left-3 right-3">
                  <div
                    className="text-xs font-medium truncate"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.name}
                  </div>
                </div>

                {/* Premium Badge */}
                {isPremium && getPremiumBadge()}

                {/* Locked Overlay */}
                {!isUnlocked && getLockedOverlay()}

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Tooltip */}
              {showTooltip === themeId && (
                <div className="absolute z-10 -top-12 left-1/2 transform -translate-x-1/2 bg-[var(--color-text)] text-[var(--color-background)] text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {theme.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[var(--color-text)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Premium Upgrade Section */}
      {!isPremiumUser && showPremiumUpgrade && (
        <div className="mt-6 p-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Unlock All Themes</h4>
              <p className="text-sm opacity-90">
                Get access to all premium themes and enhanced features
              </p>
            </div>
            <button
              onClick={onPremiumUpgrade}
              className="px-4 py-2 bg-white text-[var(--color-primary)] rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;