import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppStateProvider } from '../../store/AppStateProvider';

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AppStateProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock data helpers
export const mockHexagram = {
  number: 1,
  name: 'The Creative',
  chinese: '乾',
  unicode: '☰',
  trigrams: {
    upper: { name: 'Heaven', symbol: '☰' },
    lower: { name: 'Heaven', symbol: '☰' }
  },
  lines: [1, 1, 1, 1, 1, 1],
  interpretation: {
    general: 'Test interpretation',
    love: 'Test love interpretation',
    career: 'Test career interpretation',
    health: 'Test health interpretation'
  }
};

export const mockDivinationResult = {
  question: 'Test question',
  primaryHexagram: mockHexagram,
  secondaryHexagram: null,
  changingLines: [],
  interpretation: 'Test interpretation',
  timestamp: new Date('2024-01-01'),
  id: 'test-id'
};

export const mockUser = {
  id: 'test-user',
  preferences: {
    theme: 'light',
    soundEnabled: true,
    animationsEnabled: true
  },
  history: [mockDivinationResult]
};

// Helper functions for testing
export const createMockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

export const mockClaudeResponse = {
  interpretation: 'Mocked Claude interpretation',
  confidence: 0.95,
  themes: ['wisdom', 'change'],
  guidance: 'Mocked guidance',
  followUp: 'Mocked follow-up questions'
};