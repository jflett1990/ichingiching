import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAppState } from '../../store/AppStateProvider';
import themeData from '../../data/themes.json';

// Advanced theme interface extending the base theme data
interface Theme {
  name: string;
  description: string;
  isPremium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundSecondary: string;
    text: string;
    textSecondary: string;
    textLight: string;
    glass: string;
    glassHover: string;
    glassBorder: string;
    shadow: string;
    shadowHeavy: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    glass: string;
    background: string;
  };
  typography: {
    primary: string;
    secondary: string;
    sizes: Record<string, string>;
    weights: Record<string, string>;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      smooth: string;
      bounce: string;
      ease: string;
    };
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  effects: {
    blur: string;
    glowIntensity: string;
    particleCount: number;
    [key: string]: any; // Allow for theme-specific effects
  };
}

interface ThemeContextType {
  currentTheme: Theme;
  availableThemes: Theme[];
  isLoading: boolean;
  setTheme: (themeName: string) => void;
  preloadTheme: (themeName: string) => Promise<void>;
  getThemePreview: (themeName: string) => Theme | null;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  customizations: ThemeCustomizations;
  updateCustomizations: (customizations: Partial<ThemeCustomizations>) => void;
}

interface ThemeCustomizations {
  primaryColor?: string;
  accentColor?: string;
  backgroundOpacity?: number;
  glassIntensity?: number;
  animationSpeed?: number;
  borderRadius?: number;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Theme processing utilities
const processThemeData = (rawTheme: any): Theme => ({
  ...rawTheme,
  // Ensure all required properties exist with fallbacks
  colors: {
    primary: rawTheme.colors?.primary || '#667eea',
    secondary: rawTheme.colors?.secondary || '#764ba2',
    accent: rawTheme.colors?.accent || '#f093fb',
    background: rawTheme.colors?.background || '#f7fafc',
    backgroundSecondary: rawTheme.colors?.backgroundSecondary || '#edf2f7',
    text: rawTheme.colors?.text || '#2d3748',
    textSecondary: rawTheme.colors?.textSecondary || '#4a5568',
    textLight: rawTheme.colors?.textLight || '#a0aec0',
    glass: rawTheme.colors?.glass || 'rgba(255, 255, 255, 0.1)',
    glassHover: rawTheme.colors?.glassHover || 'rgba(255, 255, 255, 0.2)',
    glassBorder: rawTheme.colors?.glassBorder || 'rgba(255, 255, 255, 0.2)',
    shadow: rawTheme.colors?.shadow || 'rgba(0, 0, 0, 0.1)',
    shadowHeavy: rawTheme.colors?.shadowHeavy || 'rgba(0, 0, 0, 0.25)',
    ...rawTheme.colors,
  },
  gradients: {
    primary: rawTheme.gradients?.primary || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: rawTheme.gradients?.secondary || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    glass: rawTheme.gradients?.glass || 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
    background: rawTheme.gradients?.background || 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
    ...rawTheme.gradients,
  },
  effects: {
    blur: rawTheme.effects?.blur || '20px',
    glowIntensity: rawTheme.effects?.glowIntensity || '0.5',
    particleCount: rawTheme.effects?.particleCount || 50,
    ...rawTheme.effects,
  },
});

// Advanced theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences, updateUserPreferences, user } = useAppState();
  const [isLoading, setIsLoading] = useState(false);
  const [customizations, setCustomizations] = useState<ThemeCustomizations>({});
  const [preloadedThemes, setPreloadedThemes] = useState<Map<string, Theme>>(new Map());

  // Process and memoize available themes
  const availableThemes = useMemo(() => {
    return Object.entries(themeData).map(([key, theme]) => 
      processThemeData({ ...theme, key })
    );
  }, []);

  // Get current theme with fallback
  const currentTheme = useMemo(() => {
    const themeName = preferences?.theme || 'liquid-glass';
    const theme = availableThemes.find(t => t.key === themeName) || availableThemes[0];
    
    // Apply customizations if any
    if (Object.keys(customizations).length > 0) {
      return applyCustomizations(theme, customizations);
    }
    
    return theme;
  }, [availableThemes, preferences?.theme, customizations]);

  // Dark mode detection
  const isDarkMode = useMemo(() => {
    const darkThemes = ['cyberpunk', 'art-nouveau'];
    return darkThemes.includes(currentTheme.key || '');
  }, [currentTheme]);

  // Apply CSS custom properties for the current theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Set primary theme variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(currentTheme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });
    
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    Object.entries(currentTheme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });
    
    // Set typography variables
    root.style.setProperty('--font-primary', currentTheme.typography.primary);
    root.style.setProperty('--font-secondary', currentTheme.typography.secondary);
    
    // Set animation variables
    root.style.setProperty('--duration-fast', currentTheme.animations.duration.fast);
    root.style.setProperty('--duration-normal', currentTheme.animations.duration.normal);
    root.style.setProperty('--duration-slow', currentTheme.animations.duration.slow);
    
    // Set effect variables
    root.style.setProperty('--blur-intensity', currentTheme.effects.blur);
    root.style.setProperty('--glow-intensity', currentTheme.effects.glowIntensity);
    
    // Set theme class on body for CSS targeting
    document.body.className = `theme-${currentTheme.key || 'liquid-glass'}`;
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', currentTheme.colors.primary);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = currentTheme.colors.primary;
      document.head.appendChild(meta);
    }
    
  }, [currentTheme]);

  // Preload theme fonts and assets
  useEffect(() => {
    const preloadFonts = async () => {
      const fontsToPreload = [
        currentTheme.typography.primary,
        currentTheme.typography.secondary,
      ];
      
      const fontPromises = fontsToPreload.map(font => {
        if (!font.includes('system') && !font.includes('serif') && !font.includes('sans-serif')) {
          return document.fonts.load(`1rem "${font.split(',')[0].trim()}"`);
        }
        return Promise.resolve();
      });
      
      try {
        await Promise.all(fontPromises);
      } catch (error) {
        console.warn('Font preloading failed:', error);
      }
    };
    
    preloadFonts();
  }, [currentTheme.typography]);

  // Theme switching function
  const setTheme = async (themeName: string) => {
    const theme = availableThemes.find(t => t.key === themeName);
    if (!theme) return;
    
    // Check premium access
    if (theme.isPremium && !user?.isPremium) {
      throw new Error('Premium theme requires subscription');
    }
    
    setIsLoading(true);
    
    try {
      // Preload theme if not already cached
      if (!preloadedThemes.has(themeName)) {
        await preloadTheme(themeName);
      }
      
      // Update user preferences
      updateUserPreferences({ theme: themeName });
      
      // Animate theme transition
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          // Theme change will trigger via preferences update
        });
      }
      
    } catch (error) {
      console.error('Theme switching failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Preload theme assets
  const preloadTheme = async (themeName: string) => {
    const theme = availableThemes.find(t => t.key === themeName);
    if (!theme || preloadedThemes.has(themeName)) return;
    
    try {
      // Preload theme-specific fonts
      const fontFamily = theme.typography.primary.split(',')[0].trim();
      if (!fontFamily.includes('system')) {
        await document.fonts.load(`1rem "${fontFamily}"`);
      }
      
      // Cache the processed theme
      setPreloadedThemes(prev => new Map(prev).set(themeName, theme));
      
    } catch (error) {
      console.warn(`Theme preloading failed for ${themeName}:`, error);
    }
  };

  // Get theme preview without switching
  const getThemePreview = (themeName: string): Theme | null => {
    return availableThemes.find(t => t.key === themeName) || null;
  };

  // Toggle dark mode (switch between compatible themes)
  const toggleDarkMode = () => {
    const currentKey = currentTheme.key || 'liquid-glass';
    const darkModeMap: Record<string, string> = {
      'liquid-glass': 'cyberpunk',
      'cyberpunk': 'liquid-glass',
      'art-nouveau': 'traditional-zen',
      'traditional-zen': 'art-nouveau',
      'pop-art': 'cyberpunk',
    };
    
    const newTheme = darkModeMap[currentKey] || (isDarkMode ? 'liquid-glass' : 'cyberpunk');
    setTheme(newTheme);
  };

  // Apply theme customizations
  const applyCustomizations = (theme: Theme, customizations: ThemeCustomizations): Theme => {
    const customized = { ...theme };
    
    if (customizations.primaryColor) {
      customized.colors.primary = customizations.primaryColor;
    }
    
    if (customizations.accentColor) {
      customized.colors.accent = customizations.accentColor;
    }
    
    if (customizations.backgroundOpacity !== undefined) {
      const opacity = customizations.backgroundOpacity;
      customized.colors.glass = customized.colors.glass.replace(/[\d.]+\)$/, `${opacity})`);
    }
    
    if (customizations.glassIntensity !== undefined) {
      customized.effects.blur = `${customizations.glassIntensity * 20}px`;
    }
    
    if (customizations.animationSpeed !== undefined) {
      const speed = customizations.animationSpeed;
      customized.animations.duration.fast = `${150 / speed}ms`;
      customized.animations.duration.normal = `${300 / speed}ms`;
      customized.animations.duration.slow = `${500 / speed}ms`;
    }
    
    if (customizations.borderRadius !== undefined) {
      const radius = customizations.borderRadius;
      Object.keys(customized.borderRadius).forEach(key => {
        const originalValue = parseFloat(customized.borderRadius[key]);
        customized.borderRadius[key] = `${originalValue * radius}rem`;
      });
    }
    
    return customized;
  };

  // Update customizations
  const updateCustomizations = (newCustomizations: Partial<ThemeCustomizations>) => {
    setCustomizations(prev => ({ ...prev, ...newCustomizations }));
  };

  // Context value
  const contextValue: ThemeContextType = {
    currentTheme,
    availableThemes,
    isLoading,
    setTheme,
    preloadTheme,
    getThemePreview,
    isDarkMode,
    toggleDarkMode,
    customizations,
    updateCustomizations,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hooks for specific theme aspects
export const useThemeColors = () => {
  const { currentTheme } = useTheme();
  return currentTheme.colors;
};

export const useThemeEffects = () => {
  const { currentTheme } = useTheme();
  return currentTheme.effects;
};

export const useThemeTransition = () => {
  const { setTheme, isLoading } = useTheme();
  
  const switchWithTransition = async (themeName: string) => {
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await setTheme(themeName);
      });
    } else {
      await setTheme(themeName);
    }
  };
  
  return { switchWithTransition, isLoading };
};

// Premium theme access hook
export const usePremiumThemes = () => {
  const { availableThemes } = useTheme();
  const { user } = useAppState();
  
  const premiumThemes = availableThemes.filter(theme => theme.isPremium);
  const freeThemes = availableThemes.filter(theme => !theme.isPremium);
  const accessibleThemes = user?.isPremium ? availableThemes : freeThemes;
  
  return {
    premiumThemes,
    freeThemes,
    accessibleThemes,
    hasPremiumAccess: user?.isPremium || false,
  };
};

export type { Theme, ThemeCustomizations };