import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import themesData from '../../data/themes.json';

export interface Theme {
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
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    weights: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
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
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  effects: {
    blur: string;
    glowIntensity: string;
    particleCount: number;
    [key: string]: any;
  };
  decorative?: {
    patterns: string;
    borders: string;
    ornaments?: string;
  };
}

interface ThemeContextType {
  currentTheme: Theme;
  currentThemeId: string;
  themes: Record<string, Theme>;
  setTheme: (themeId: string) => void;
  isThemeUnlocked: (themeId: string) => boolean;
  isPremiumUser: boolean;
  setPremiumUser: (isPremium: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: string;
  isPremiumUser?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'liquid-glass',
  isPremiumUser = false,
}) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>(initialTheme);
  const [isPremium, setIsPremium] = useState<boolean>(isPremiumUser);
  const themes = themesData as Record<string, Theme>;

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('wisdom-oracle-theme');
    const savedPremiumStatus = localStorage.getItem('wisdom-oracle-premium');
    
    if (savedTheme && themes[savedTheme]) {
      setCurrentThemeId(savedTheme);
    }
    
    if (savedPremiumStatus) {
      setIsPremium(JSON.parse(savedPremiumStatus));
    }
  }, []);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wisdom-oracle-theme', currentThemeId);
  }, [currentThemeId]);

  // Save premium status to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('wisdom-oracle-premium', JSON.stringify(isPremium));
  }, [isPremium]);

  const setTheme = (themeId: string) => {
    if (themes[themeId] && isThemeUnlocked(themeId)) {
      setCurrentThemeId(themeId);
      updateCSSVariables(themes[themeId]);
    }
  };

  const isThemeUnlocked = (themeId: string): boolean => {
    const theme = themes[themeId];
    if (!theme) return false;
    return !theme.isPremium || isPremium;
  };

  const setPremiumUser = (premium: boolean) => {
    setIsPremium(premium);
  };

  // Update CSS custom properties when theme changes
  const updateCSSVariables = (theme: Theme) => {
    const root = document.documentElement;
    
    // Color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Gradient variables
    Object.entries(theme.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Typography variables
    root.style.setProperty('--font-primary', theme.typography.primary);
    root.style.setProperty('--font-secondary', theme.typography.secondary);
    
    Object.entries(theme.typography.sizes).forEach(([key, value]) => {
      root.style.setProperty(`--text-${key}`, value);
    });
    
    Object.entries(theme.typography.weights).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    // Animation variables
    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });
    
    Object.entries(theme.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // Spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border radius variables
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Effects variables
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value.toString());
    });

    // Theme-specific class on body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${currentThemeId}`);
  };

  // Initialize CSS variables on mount and theme change
  useEffect(() => {
    updateCSSVariables(themes[currentThemeId]);
  }, [currentThemeId, themes]);

  const value: ThemeContextType = {
    currentTheme: themes[currentThemeId],
    currentThemeId,
    themes,
    setTheme,
    isThemeUnlocked,
    isPremiumUser: isPremium,
    setPremiumUser,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;