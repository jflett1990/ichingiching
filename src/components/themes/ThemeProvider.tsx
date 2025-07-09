import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAppState } from '../../store/AppStateProvider';

// Apple Design System Theme Interface
interface AppleTheme {
  name: string;
  description: string;
  key: string;
  isPremium: boolean;
  colors: {
    // Apple Intelligence Colors
    aiBlue: string;
    aiPurple: string;
    aiPink: string;
    aiOrange: string;
    
    // iOS System Colors
    systemBlue: string;
    systemGreen: string;
    systemRed: string;
    systemOrange: string;
    systemYellow: string;
    systemPink: string;
    systemPurple: string;
    systemTeal: string;
    
    // System Backgrounds
    systemBackground: string;
    systemBackgroundDark: string;
    systemSurface: string;
    systemSurfaceDark: string;
    
    // Text Colors
    textPrimary: string;
    textSecondary: string;
    textPrimaryDark: string;
    textSecondaryDark: string;
    
    // Glass Colors
    glassLight: string;
    glassDark: string;
    glassBorder: string;
    glassBorderDark: string;
  };
  gradients: {
    aiPrimary: string;
    aiBluePurple: string;
    aiPurplePink: string;
    aiPinkOrange: string;
    systemBackground: string;
  };
  effects: {
    glassBlur: string;
    glassShadow: string;
    glassShadowDark: string;
  };
}

interface AppleThemeContextType {
  currentTheme: AppleTheme;
  availableThemes: AppleTheme[];
  isLoading: boolean;
  setTheme: (themeName: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  preloadTheme: (themeName: string) => Promise<void>;
}

const AppleThemeContext = createContext<AppleThemeContextType | null>(null);

// Apple Design System Themes
const appleThemes: AppleTheme[] = [
  {
    name: 'Apple Light',
    description: 'Classic Apple design with light system colors',
    key: 'apple-light',
    isPremium: false,
    colors: {
      // Apple Intelligence Colors
      aiBlue: '#5AC8FA',
      aiPurple: '#5856D6',
      aiPink: '#FF2D55',
      aiOrange: '#FF9500',
      
      // iOS System Colors
      systemBlue: '#007AFF',
      systemGreen: '#4CD964',
      systemRed: '#FF3B30',
      systemOrange: '#FF9500',
      systemYellow: '#FFCC00',
      systemPink: '#FF2D55',
      systemPurple: '#5856D6',
      systemTeal: '#5AC8FA',
      
      // System Backgrounds
      systemBackground: '#F2F2F7',
      systemBackgroundDark: '#000000',
      systemSurface: '#FFFFFF',
      systemSurfaceDark: '#1C1C1E',
      
      // Text Colors
      textPrimary: 'rgba(0, 0, 0, 0.8)',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      textPrimaryDark: 'rgba(255, 255, 255, 0.9)',
      textSecondaryDark: 'rgba(255, 255, 255, 0.7)',
      
      // Glass Colors
      glassLight: 'rgba(255, 255, 255, 0.8)',
      glassDark: 'rgba(0, 0, 0, 0.7)',
      glassBorder: 'rgba(255, 255, 255, 0.2)',
      glassBorderDark: 'rgba(255, 255, 255, 0.1)',
    },
    gradients: {
      aiPrimary: 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 25%, #FF2D55 75%, #FF9500 100%)',
      aiBluePurple: 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 100%)',
      aiPurplePink: 'linear-gradient(135deg, #5856D6 0%, #FF2D55 100%)',
      aiPinkOrange: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)',
      systemBackground: 'linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)',
    },
    effects: {
      glassBlur: '20px',
      glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      glassShadowDark: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
  },
  {
    name: 'Apple Dark',
    description: 'Apple design with dark mode styling',
    key: 'apple-dark',
    isPremium: false,
    colors: {
      // Apple Intelligence Colors
      aiBlue: '#5AC8FA',
      aiPurple: '#5856D6',
      aiPink: '#FF2D55',
      aiOrange: '#FF9500',
      
      // iOS System Colors
      systemBlue: '#007AFF',
      systemGreen: '#4CD964',
      systemRed: '#FF3B30',
      systemOrange: '#FF9500',
      systemYellow: '#FFCC00',
      systemPink: '#FF2D55',
      systemPurple: '#5856D6',
      systemTeal: '#5AC8FA',
      
      // System Backgrounds
      systemBackground: '#000000',
      systemBackgroundDark: '#000000',
      systemSurface: '#1C1C1E',
      systemSurfaceDark: '#1C1C1E',
      
      // Text Colors
      textPrimary: 'rgba(255, 255, 255, 0.9)',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      textPrimaryDark: 'rgba(255, 255, 255, 0.9)',
      textSecondaryDark: 'rgba(255, 255, 255, 0.7)',
      
      // Glass Colors
      glassLight: 'rgba(0, 0, 0, 0.7)',
      glassDark: 'rgba(0, 0, 0, 0.7)',
      glassBorder: 'rgba(255, 255, 255, 0.1)',
      glassBorderDark: 'rgba(255, 255, 255, 0.1)',
    },
    gradients: {
      aiPrimary: 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 25%, #FF2D55 75%, #FF9500 100%)',
      aiBluePurple: 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 100%)',
      aiPurplePink: 'linear-gradient(135deg, #5856D6 0%, #FF2D55 100%)',
      aiPinkOrange: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)',
      systemBackground: 'linear-gradient(135deg, #000000 0%, #1C1C1E 100%)',
    },
    effects: {
      glassBlur: '20px',
      glassShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      glassShadowDark: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
  },
  {
    name: 'Apple Intelligence',
    description: 'Apple Intelligence themed with AI gradients',
    key: 'apple-intelligence',
    isPremium: true,
    colors: {
      // Apple Intelligence Colors
      aiBlue: '#5AC8FA',
      aiPurple: '#5856D6',
      aiPink: '#FF2D55',
      aiOrange: '#FF9500',
      
      // iOS System Colors
      systemBlue: '#007AFF',
      systemGreen: '#4CD964',
      systemRed: '#FF3B30',
      systemOrange: '#FF9500',
      systemYellow: '#FFCC00',
      systemPink: '#FF2D55',
      systemPurple: '#5856D6',
      systemTeal: '#5AC8FA',
      
      // System Backgrounds
      systemBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      systemBackgroundDark: 'linear-gradient(135deg, #2D1B69 0%, #11998E 100%)',
      systemSurface: 'rgba(255, 255, 255, 0.1)',
      systemSurfaceDark: 'rgba(0, 0, 0, 0.3)',
      
      // Text Colors
      textPrimary: 'white',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      textPrimaryDark: 'white',
      textSecondaryDark: 'rgba(255, 255, 255, 0.8)',
      
      // Glass Colors
      glassLight: 'rgba(255, 255, 255, 0.2)',
      glassDark: 'rgba(0, 0, 0, 0.3)',
      glassBorder: 'rgba(255, 255, 255, 0.3)',
      glassBorderDark: 'rgba(255, 255, 255, 0.2)',
    },
    gradients: {
      aiPrimary: 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 25%, #FF2D55 75%, #FF9500 100%)',
      aiBluePurple: 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 100%)',
      aiPurplePink: 'linear-gradient(135deg, #5856D6 0%, #FF2D55 100%)',
      aiPinkOrange: 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)',
      systemBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    effects: {
      glassBlur: '30px',
      glassShadow: '0 12px 40px rgba(90, 200, 250, 0.3)',
      glassShadowDark: '0 12px 40px rgba(90, 200, 250, 0.3)',
    },
  },
];

// Apple Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, updateUserPreferences, user } = useAppState();
  const [isLoading, setIsLoading] = useState(false);

  // Get current theme with fallback
  const currentTheme = useMemo(() => {
    const themeName = preferences?.theme || 'apple-light';
    return appleThemes.find(t => t.key === themeName) || appleThemes[0];
  }, [preferences?.theme]);

  // Check if current theme is dark mode
  const isDarkMode = useMemo(() => {
    return currentTheme.key === 'apple-dark' || currentTheme.key === 'apple-intelligence';
  }, [currentTheme]);

  // Apply CSS custom properties for the current theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Apple Intelligence Colors
    root.style.setProperty('--ai-blue', currentTheme.colors.aiBlue);
    root.style.setProperty('--ai-purple', currentTheme.colors.aiPurple);
    root.style.setProperty('--ai-pink', currentTheme.colors.aiPink);
    root.style.setProperty('--ai-orange', currentTheme.colors.aiOrange);
    
    // iOS System Colors
    root.style.setProperty('--ios-blue', currentTheme.colors.systemBlue);
    root.style.setProperty('--ios-green', currentTheme.colors.systemGreen);
    root.style.setProperty('--ios-red', currentTheme.colors.systemRed);
    root.style.setProperty('--ios-orange', currentTheme.colors.systemOrange);
    root.style.setProperty('--ios-yellow', currentTheme.colors.systemYellow);
    root.style.setProperty('--ios-pink', currentTheme.colors.systemPink);
    root.style.setProperty('--ios-purple', currentTheme.colors.systemPurple);
    root.style.setProperty('--ios-teal', currentTheme.colors.systemTeal);
    
    // System Colors
    root.style.setProperty('--system-bg', currentTheme.colors.systemBackground);
    root.style.setProperty('--system-surface', currentTheme.colors.systemSurface);
    root.style.setProperty('--adaptive-text-light', currentTheme.colors.textPrimary);
    root.style.setProperty('--adaptive-text-secondary', currentTheme.colors.textSecondary);
    
    // Glass Colors
    root.style.setProperty('--glass-opacity', '0.8');
    root.style.setProperty('--glass-blur', currentTheme.effects.glassBlur);
    root.style.setProperty('--glass-border', currentTheme.colors.glassBorder);
    root.style.setProperty('--glass-shadow', currentTheme.effects.glassShadow);
    
    // Gradients
    root.style.setProperty('--ai-gradient-primary', currentTheme.gradients.aiPrimary);
    root.style.setProperty('--ai-gradient-blue-purple', currentTheme.gradients.aiBluePurple);
    root.style.setProperty('--ai-gradient-purple-pink', currentTheme.gradients.aiPurplePink);
    root.style.setProperty('--ai-gradient-pink-orange', currentTheme.gradients.aiPinkOrange);
    
    // Set theme class on body
    document.body.className = `theme-${currentTheme.key}`;
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.colors.systemBlue);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = currentTheme.colors.systemBlue;
      document.head.appendChild(meta);
    }
    
    // Set background based on theme
    if (currentTheme.key === 'apple-intelligence') {
      document.body.style.background = currentTheme.colors.systemBackground;
    } else {
      document.body.style.background = currentTheme.colors.systemBackground;
    }
    
  }, [currentTheme]);

  // Theme switching function
  const setTheme = async (themeName: string) => {
    const theme = appleThemes.find(t => t.key === themeName);
    if (!theme) return;
    
    // Check premium access
    if (theme.isPremium && !user?.isPremium) {
      throw new Error('Premium theme requires subscription');
    }
    
    setIsLoading(true);
    
    try {
      // Use View Transition API if available
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          updateUserPreferences({ theme: themeName });
        });
      } else {
        updateUserPreferences({ theme: themeName });
      }
      
    } catch (error) {
      console.error('Theme switching failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between light and dark mode
  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'apple-light' : 'apple-dark';
    setTheme(newTheme);
  };

  // Preload theme assets (simplified for Apple themes)
  const preloadTheme = async (themeName: string) => {
    const theme = appleThemes.find(t => t.key === themeName);
    if (!theme) return;
    
    try {
      // Preload Apple system fonts
      await document.fonts.load('1rem -apple-system');
      await document.fonts.load('1rem SF Pro Display');
    } catch (error) {
      console.warn(`Theme preloading failed for ${themeName}:`, error);
    }
  };

  // Context value
  const contextValue: AppleThemeContextType = {
    currentTheme,
    availableThemes: appleThemes,
    isLoading,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    preloadTheme,
  };

  return (
    <AppleThemeContext.Provider value={contextValue}>
      {children}
    </AppleThemeContext.Provider>
  );
};

// Hook for using Apple theme context
export const useTheme = (): AppleThemeContextType => {
  const context = useContext(AppleThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hooks for Apple design system
export const useAppleColors = () => {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
};

export const useAppleGradients = () => {
  const { currentTheme } = useTheme();
  return currentTheme.gradients;
};

export const useAppleEffects = () => {
  const { currentTheme } = useTheme();
  return currentTheme.effects;
};

// Premium theme access hook
export const usePremiumThemes = () => {
  const { user } = useAppState();
  
  const premiumThemes = appleThemes.filter(theme => theme.isPremium);
  const freeThemes = appleThemes.filter(theme => !theme.isPremium);
  const accessibleThemes = user?.isPremium ? appleThemes : freeThemes;
  
  return {
    premiumThemes,
    freeThemes,
    accessibleThemes,
    hasPremiumAccess: user?.isPremium || false,
  };
};

export type { AppleTheme };