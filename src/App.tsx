import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTheme } from './components/themes/ThemeProvider';
import { useAppState } from './store/AppStateProvider';
import { LoadingScreen } from './components/ui/LoadingScreen';
import GlobalErrorFallback from './components/ui/GlobalErrorFallback';
import AppRouter from './router';

function App() {
  const { currentTheme } = useTheme();
  const { isLoading } = useAppState();

  if (isLoading) {
    return (
      <LoadingScreen
        theme={currentTheme}
        message="Initializing Wisdom Oracle..."
        variant="full"
      />
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
      }}
    >
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;