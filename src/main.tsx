import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';
import { GlobalErrorFallback } from './components/errors/GlobalErrorFallback';
import { ThemeProvider } from './components/themes/ThemeProvider';
import { AppStateProvider } from './store/AppStateProvider';
import { PerformanceMonitor } from './utils/performance';
import './styles/index.css';

// Advanced query client configuration for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Smart retry logic based on error type
        if (error?.status === 404 || error?.status === 403) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Performance monitoring initialization
const performanceMonitor = new PerformanceMonitor({
  enableDevtools: import.meta.env.DEV,
  sampleRate: import.meta.env.PROD ? 0.1 : 1,
  thresholds: {
    fcp: 1500, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
  },
});

// Advanced error reporting for production
const handleError = (error: Error, errorInfo: { componentStack: string }) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Application Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }
  
  // Send to error reporting service in production
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      custom_map: { component_stack: errorInfo.componentStack },
    });
  }
  
  // Track performance impact of errors
  performanceMonitor.trackError(error, errorInfo);
};

// Root component with sophisticated provider nesting
const AppRoot: React.FC = () => (
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={handleError}
      onReset={() => window.location.reload()}
    >
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
          <ThemeProvider>
            <App />
            {import.meta.env.DEV && <ReactQueryDevtools position="bottom-right" />}
          </ThemeProvider>
        </AppStateProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Advanced root initialization with performance monitoring
const initializeApp = async () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>');
  }

  // Performance mark for initialization start
  performance.mark('app-init-start');
  
  try {
    // Initialize performance monitoring
    await performanceMonitor.initialize();
    
    // Create React root with concurrent features
    const root = ReactDOM.createRoot(rootElement, {
      // Enable concurrent features for better performance
      identifierPrefix: 'wisdom-oracle-',
    });
    
    // Start performance monitoring
    performanceMonitor.startMonitoring();
    
    // Render application
    root.render(<AppRoot />);
    
    // Mark initialization complete
    performance.mark('app-init-end');
    performance.measure('app-initialization', 'app-init-start', 'app-init-end');
    
    // Register service worker for PWA capabilities
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.info('Service Worker registered:', registration.scope);
    }
    
    // Initialize analytics in production
    if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
      const { initializeAnalytics } = await import('./utils/analytics');
      initializeAnalytics(import.meta.env.VITE_GA_ID);
    }
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Fallback rendering for critical failures
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          max-width: 500px;
        ">
          <h1 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Wisdom Oracle</h1>
          <p style="margin: 0 0 1rem 0; opacity: 0.9;">
            We're experiencing technical difficulties. Please refresh the page or try again later.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              font-size: 1rem;
              transition: all 0.3s ease;
            "
            onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'"
          >
            Refresh Page
          </button>
        </div>
      </div>
    `;
  }
};

// Initialize application with proper error handling
initializeApp().catch((error) => {
  console.error('Critical application initialization failure:', error);
});

// Advanced development features
if (import.meta.env.DEV) {
  // Development-only features
  if (import.meta.hot) {
    import.meta.hot.accept();
  }
  
  // Development performance monitoring
  performanceMonitor.enableDevFeatures();
  
  // Development-only global utilities
  (window as any).__WISDOM_ORACLE_DEV__ = {
    queryClient,
    performanceMonitor,
    clearCache: () => queryClient.clear(),
    getPerformanceMetrics: () => performanceMonitor.getMetrics(),
  };
}

// Performance observer for Core Web Vitals
if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
  try {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        performanceMonitor.trackWebVital('LCP', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        performanceMonitor.trackWebVital('FID', (entry as any).processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          performanceMonitor.trackWebVital('CLS', (entry as any).value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
    
  } catch (error) {
    console.warn('Performance monitoring setup failed:', error);
  }
}