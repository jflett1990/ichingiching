import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { performDivination } from '../../utils/divination';
import { ClaudeIntegrationService } from '../../services/claude/index.js';

// Mock external dependencies
jest.mock('../../utils/divination');
jest.mock('../../services/claude/index.js');

const mockPerformDivination = performDivination;
const mockClaudeService = ClaudeIntegrationService;

describe('Application Flow Integration Tests', () => {
  const mockDivinationResult = {
    id: 'test-id-123',
    question: 'Should I pursue this opportunity?',
    primaryHexagram: {
      number: 1,
      name: 'The Creative',
      chinese: '乾',
      unicode: '☰',
      lines: [1, 1, 1, 1, 1, 1],
      interpretation: {
        general: 'A time of great creative potential and leadership.',
        love: 'New beginnings in relationships.',
        career: 'Excellent time for career advancement.',
        health: 'Strong vitality and energy.'
      }
    },
    secondaryHexagram: null,
    changingLines: [],
    timestamp: new Date('2024-01-01'),
    method: 'random'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Setup default mocks
    mockPerformDivination.mockReturnValue(mockDivinationResult);
    mockClaudeService.mockImplementation(() => ({
      generateInterpretation: jest.fn().mockResolvedValue({
        interpretation: 'AI-enhanced interpretation',
        confidence: 0.95,
        themes: ['opportunity', 'timing'],
        isFallback: false
      }),
      getServiceStatus: jest.fn().mockResolvedValue({
        isConfigured: true,
        isConnected: true
      })
    }));
  });

  describe('Complete Divination Flow', () => {
    test('user can navigate and perform a complete divination', async () => {
      const user = userEvent.setup();
      render(<App />);

      // 1. Navigate to divination page
      const divinationLink = screen.getByRole('link', { name: /divine|consult|oracle/i });
      await user.click(divinationLink);

      // 2. Fill in question
      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'Should I take this new job?');

      // 3. Submit divination
      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      // 4. Wait for results
      await waitFor(() => {
        expect(screen.getByText(/The Creative/i)).toBeInTheDocument();
      });

      // 5. Verify hexagram display
      expect(screen.getByText(/乾/)).toBeInTheDocument();
      expect(screen.getByText(/☰/)).toBeInTheDocument();

      // 6. Check interpretation is displayed
      expect(screen.getByText(/creative potential/i)).toBeInTheDocument();
    });

    test('user can view detailed interpretation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to divination and perform reading
      const divinationLink = screen.getByRole('link', { name: /divine|consult|oracle/i });
      await user.click(divinationLink);

      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'Test question');

      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/The Creative/i)).toBeInTheDocument();
      });

      // Click for detailed view
      const detailsButton = screen.getByRole('button', { name: /details|more|expand/i });
      await user.click(detailsButton);

      // Verify detailed information is shown
      expect(screen.getByText(/career advancement/i)).toBeInTheDocument();
      expect(screen.getByText(/vitality and energy/i)).toBeInTheDocument();
    });

    test('divination is saved to history', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Perform divination
      const divinationLink = screen.getByRole('link', { name: /divine|consult|oracle/i });
      await user.click(divinationLink);

      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'Will I succeed in my endeavor?');

      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/The Creative/i)).toBeInTheDocument();
      });

      // Navigate to history
      const historyLink = screen.getByRole('link', { name: /history|past/i });
      await user.click(historyLink);

      // Verify divination appears in history
      await waitFor(() => {
        expect(screen.getByText(/Will I succeed in my endeavor/i)).toBeInTheDocument();
      });
    });
  });

  describe('Manual Coin Casting Flow', () => {
    test('user can perform manual coin casting', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to divination
      const divinationLink = screen.getByRole('link', { name: /divine|consult|oracle/i });
      await user.click(divinationLink);

      // Select manual method
      const manualOption = screen.getByRole('radio', { name: /manual|traditional|coins/i });
      await user.click(manualOption);

      // Fill question
      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'What is my path forward?');

      // Start coin casting
      const startButton = screen.getByRole('button', { name: /start|begin|cast/i });
      await user.click(startButton);

      // Simulate 6 coin throws
      for (let i = 0; i < 6; i++) {
        const coinButton = screen.getByRole('button', { name: /throw|toss|cast coin/i });
        await user.click(coinButton);
        
        // Wait for coin animation/result
        await waitFor(() => {
          expect(screen.getByText(/Line \d+/i)).toBeInTheDocument();
        });
      }

      // Verify hexagram is generated
      await waitFor(() => {
        expect(screen.getByText(/hexagram/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Routing', () => {
    test('user can navigate between all main pages', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Test navigation to each main page
      const navigationTests = [
        { name: /home/i, expectedContent: /welcome|oracle|wisdom/i },
        { name: /divine|consult/i, expectedContent: /question|ask/i },
        { name: /history/i, expectedContent: /past|readings|history/i },
        { name: /settings/i, expectedContent: /preferences|options/i },
        { name: /instructions/i, expectedContent: /how to|guide|help/i }
      ];

      for (const { name, expectedContent } of navigationTests) {
        const link = screen.getByRole('link', { name });
        await user.click(link);
        
        await waitFor(() => {
          expect(screen.getByText(expectedContent)).toBeInTheDocument();
        });
      }
    });

    test('navigation preserves application state', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Perform a divination
      const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
      await user.click(divinationLink);

      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'Navigation test question');

      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/The Creative/i)).toBeInTheDocument();
      });

      // Navigate away and back
      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      const historyLink = screen.getByRole('link', { name: /history/i });
      await user.click(historyLink);

      // Verify state is preserved in history
      await waitFor(() => {
        expect(screen.getByText(/Navigation test question/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      mockClaudeService.mockImplementation(() => ({
        generateInterpretation: jest.fn().mockRejectedValue(new Error('Network error')),
        getServiceStatus: jest.fn().mockResolvedValue({
          isConfigured: true,
          isConnected: false
        })
      }));

      render(<App />);

      const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
      await user.click(divinationLink);

      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'Test question');

      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      // Should still show basic interpretation (fallback)
      await waitFor(() => {
        expect(screen.getByText(/interpretation|guidance/i)).toBeInTheDocument();
      });

      // Should show error indicator
      expect(screen.getByText(/offline|error|fallback/i)).toBeInTheDocument();
    });

    test('handles invalid routes gracefully', () => {
      // This would test 404 handling
      window.history.pushState({}, 'Test', '/invalid-route');
      render(<App />);

      expect(screen.getByText(/not found|404|page not found/i)).toBeInTheDocument();
    });

    test('handles empty or invalid questions', async () => {
      const user = userEvent.setup();
      render(<App />);

      const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
      await user.click(divinationLink);

      // Try to submit without question
      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      // Should show validation message
      expect(screen.getByText(/required|enter|question/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience', () => {
    test('application is keyboard navigable', async () => {
      render(<App />);

      // Test tab navigation
      const firstFocusable = screen.getAllByRole('link')[0];
      firstFocusable.focus();
      
      // Simulate tab navigation
      fireEvent.keyDown(document.activeElement, { key: 'Tab' });
      
      // Verify focus moves
      expect(document.activeElement).not.toBe(firstFocusable);
    });

    test('application has proper ARIA labels', () => {
      render(<App />);

      // Check for accessibility labels
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Check for form accessibility
      const formElements = screen.getAllByLabelText(/./);
      expect(formElements.length).toBeGreaterThan(0);
    });

    test('loading states are accessible', async () => {
      const user = userEvent.setup();
      
      // Mock slow response
      mockClaudeService.mockImplementation(() => ({
        generateInterpretation: jest.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({
            interpretation: 'Test',
            confidence: 0.95,
            isFallback: false
          }), 1000))
        )
      }));

      render(<App />);

      const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
      await user.click(divinationLink);

      const questionInput = screen.getByLabelText(/question|ask/i);
      await user.type(questionInput, 'Test question');

      const submitButton = screen.getByRole('button', { name: /divine|cast|submit/i });
      await user.click(submitButton);

      // Check for accessible loading indicator
      expect(screen.getByRole('status') || screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });
  });
});