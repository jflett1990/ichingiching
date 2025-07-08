import React from 'react';

interface LoadingScreenProps {
  progress?: number;
  theme?: any;
  message?: string;
  variant?: 'full' | 'minimal' | 'overlay';
  className?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress = 0,
  theme,
  message = 'Loading...',
  variant = 'full',
  className = '',
}) => {
  const baseStyles = {
    background: theme?.colors?.background || '#f7fafc',
    color: theme?.colors?.text || '#2d3748',
  };

  const glassStyles = {
    background: theme?.colors?.glass || 'rgba(255, 255, 255, 0.1)',
    backdropFilter: `blur(${theme?.effects?.blur || '20px'})`,
    border: `1px solid ${theme?.colors?.glassBorder || 'rgba(255, 255, 255, 0.2)'}`,
    borderRadius: theme?.borderRadius?.lg || '0.75rem',
  };

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="loading-spinner"></div>
        {message && (
          <span className="ml-3 text-sm opacity-80">{message}</span>
        )}
      </div>
    );
  }

  if (variant === 'overlay') {
    return (
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div 
          className="p-8 text-center max-w-sm w-full mx-4"
          style={glassStyles}
        >
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-sm opacity-80">{message}</p>
          {progress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: theme?.colors?.primary || '#667eea',
                  }}
                />
              </div>
              <p className="text-xs opacity-60 mt-2">{Math.round(progress)}%</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full screen variant
  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 ${className}`}
      style={baseStyles}
    >
      <div className="text-center max-w-md w-full">
        {/* Logo/Brand */}
        <div className="mb-8">
          <div 
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{
              background: `linear-gradient(135deg, ${theme?.colors?.primary || '#667eea'} 0%, ${theme?.colors?.secondary || '#764ba2'} 100%)`,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            <span className="text-white text-2xl font-bold">WO</span>
          </div>
          <h1 
            className="text-2xl font-bold gradient-text"
            style={{
              fontFamily: theme?.typography?.secondary || 'Playfair Display, serif',
            }}
          >
            Wisdom Oracle
          </h1>
        </div>

        {/* Loading content */}
        <div 
          className="p-8 rounded-2xl"
          style={glassStyles}
        >
          <div className="loading-spinner mx-auto mb-6"></div>
          
          <p className="text-lg font-medium mb-2">{message}</p>
          
          {progress > 0 && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${theme?.colors?.primary || '#667eea'}, ${theme?.colors?.secondary || '#764ba2'})`,
                  }}
                />
              </div>
              <p className="text-sm opacity-70">{Math.round(progress)}% complete</p>
            </>
          )}

          <div className="mt-6 text-xs opacity-60">
            <p>Preparing your divination experience...</p>
          </div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-32 h-32 rounded-full opacity-20 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${theme?.colors?.primary || '#667eea'} 0%, transparent 70%)`,
              top: '10%',
              left: '10%',
              animationDelay: '0s',
            }}
          />
          <div 
            className="absolute w-24 h-24 rounded-full opacity-15 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${theme?.colors?.secondary || '#764ba2'} 0%, transparent 70%)`,
              top: '60%',
              right: '15%',
              animationDelay: '1s',
            }}
          />
          <div 
            className="absolute w-16 h-16 rounded-full opacity-10 animate-pulse"
            style={{
              background: `radial-gradient(circle, ${theme?.colors?.accent || '#f093fb'} 0%, transparent 70%)`,
              bottom: '20%',
              left: '20%',
              animationDelay: '2s',
            }}
          />
        </div>
      </div>
    </div>
  );
};