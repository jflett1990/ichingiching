import React from 'react';

interface BackgroundEffectsProps {
  theme: any;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  theme,
  intensity = 'medium',
  className = '',
}) => {
  const particleCount = {
    low: 20,
    medium: 50,
    high: 100,
  }[intensity];

  const baseGradient = `linear-gradient(135deg, ${theme?.colors?.background || '#f7fafc'} 0%, ${theme?.colors?.backgroundSecondary || '#edf2f7'} 100%)`;

  const overlayGradient = theme?.name === 'cyberpunk' 
    ? 'linear-gradient(0deg, rgba(0, 255, 255, 0.02) 0%, transparent 100%)'
    : theme?.name === 'art-nouveau'
    ? 'radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 70%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 70%)';

  return (
    <div 
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    >
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{ background: baseGradient }}
      />

      {/* Theme-specific overlay */}
      <div 
        className="absolute inset-0"
        style={{ background: overlayGradient }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: particleCount }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: theme?.colors?.primary || '#667eea',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Theme-specific effects */}
      {theme?.name === 'cyberpunk' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.1) 2px,
                  rgba(0, 255, 255, 0.1) 4px
                )
              `,
            }}
          />
        </div>
      )}

      {theme?.name === 'art-nouveau' && (
        <div className="absolute inset-0">
          <div
            className="absolute top-10 right-10 w-96 h-96 rounded-full opacity-5"
            style={{
              background: `radial-gradient(circle, ${theme.colors.primary} 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute bottom-20 left-10 w-64 h-64 rounded-full opacity-5"
            style={{
              background: `radial-gradient(circle, ${theme.colors.secondary} 0%, transparent 70%)`,
              filter: 'blur(30px)',
            }}
          />
        </div>
      )}

      {theme?.name === 'pop-art' && (
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-20 w-32 h-32 opacity-10"
            style={{
              background: theme.colors.primary,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              filter: 'blur(20px)',
            }}
          />
          <div
            className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-10"
            style={{
              background: theme.colors.secondary,
              filter: 'blur(25px)',
            }}
          />
        </div>
      )}
    </div>
  );
};