import React from 'react';
import { motion } from 'framer-motion';
import { ErrorBoundaryPropsWithFallback } from 'react-error-boundary';

interface GlobalErrorFallbackProps extends ErrorBoundaryPropsWithFallback {
  error: Error;
  resetErrorBoundary: () => void;
}

export const GlobalErrorFallback: React.FC<GlobalErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleReset = () => {
    // Clear any cached data that might be causing issues
    localStorage.removeItem('wisdom-oracle-state');
    sessionStorage.clear();
    resetErrorBoundary();
  };

  const handleReportError = () => {
    // In production, this would send error reports to a service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    console.error('Error Report:', errorReport);
    
    // Copy error info to clipboard for user to report
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      alert('Error details copied to clipboard. Please share this with support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="w-full h-full"
              style={{
                backgroundImage: `linear-gradient(
                  45deg,
                  transparent 30%, 
                  rgba(255, 255, 255, 0.1) 50%, 
                  transparent 70%
                )`,
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          <div className="relative z-10">
            {/* Error icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Error message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-white/80 text-sm mb-4">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>
              
              {/* Error details for development */}
              {import.meta.env.DEV && (
                <details className="text-left mt-4">
                  <summary className="text-xs text-white/60 cursor-pointer hover:text-white/80 transition-colors">
                    Technical Details (Dev Mode)
                  </summary>
                  <pre className="text-xs text-red-300 bg-black/20 p-3 rounded mt-2 overflow-auto max-h-32">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <button
                onClick={resetErrorBoundary}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                }}
              >
                Try Again
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Reset App
                </button>

                <button
                  onClick={handleRefresh}
                  className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Refresh Page
                </button>
              </div>

              {/* Report error button */}
              <button
                onClick={handleReportError}
                className="w-full py-2 px-4 rounded-lg text-xs font-medium text-white/60 transition-all hover:text-white/80"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                📋 Copy Error Details
              </button>
            </motion.div>

            {/* Recovery suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-xs text-white/50"
            >
              <p>If the problem persists:</p>
              <ul className="mt-2 space-y-1 text-left">
                <li>• Try refreshing the page</li>
                <li>• Clear your browser cache</li>
                <li>• Check your internet connection</li>
                <li>• Contact support with error details</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};