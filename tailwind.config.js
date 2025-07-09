/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Intelligence Colors
        'ai': {
          blue: '#5AC8FA',
          purple: '#5856D6',
          pink: '#FF2D55',
          orange: '#FF9500',
        },
        // Traditional iOS Colors
        'ios': {
          pink: '#FF2D55',
          purple: '#5856D6',
          orange: '#FF9500',
          yellow: '#FFCC00',
          red: '#FF3B30',
          teal: '#5AC8FA',
          blue: '#007AFF',
          green: '#4CD964',
        },
        // Apple System Colors
        'apple': {
          'bg-light': '#F2F2F7',
          'bg-dark': '#000000',
          'surface-light': '#FFFFFF',
          'surface-dark': '#1C1C1E',
          'text-light': 'rgba(0, 0, 0, 0.8)',
          'text-dark': 'rgba(255, 255, 255, 0.9)',
        },
        // Liquid Glass Colors
        'glass': {
          50: 'rgba(255, 255, 255, 0.05)',
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.3)',
          400: 'rgba(255, 255, 255, 0.4)',
          500: 'rgba(255, 255, 255, 0.5)',
          600: 'rgba(255, 255, 255, 0.6)',
          700: 'rgba(255, 255, 255, 0.7)',
          800: 'rgba(255, 255, 255, 0.8)',
          900: 'rgba(255, 255, 255, 0.9)',
          'border': 'rgba(255, 255, 255, 0.2)',
          'dark-border': 'rgba(255, 255, 255, 0.1)',
        },
      },
      fontFamily: {
        'system': ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      spacing: {
        // Apple 8pt grid system
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'ai': '0 4px 20px rgba(90, 200, 250, 0.3)',
        'ios-blue': '0 4px 15px rgba(0, 122, 255, 0.3)',
        'ios-red': '0 4px 15px rgba(255, 59, 48, 0.3)',
        'ios-green': '0 4px 15px rgba(76, 217, 100, 0.3)',
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gentle': 'pulse 3s ease-in-out infinite',
        'apple-bounce': 'apple-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(90, 200, 250, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(90, 200, 250, 0.6)' },
        },
        'apple-bounce': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.2, 0, 0, 1)',
        'apple-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 25%, #FF2D55 75%, #FF9500 100%)',
        'ai-blue-purple': 'linear-gradient(135deg, #5AC8FA 0%, #5856D6 100%)',
        'ai-purple-pink': 'linear-gradient(135deg, #5856D6 0%, #FF2D55 100%)',
        'ai-pink-orange': 'linear-gradient(135deg, #FF2D55 0%, #FF9500 100%)',
        'apple-system': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },
  plugins: [],
  darkMode: 'media', // Use system preference for dark mode
}