/**
 * End-to-End Tests for I Ching Divination App
 * These tests simulate real user interactions from start to finish
 */

import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock API responses
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('E2E: Complete Divination Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        interpretation: 'AI-powered interpretation of your reading',
        confidence: 0.95,
        themes: ['wisdom', 'change', 'opportunity'],
        guidance: 'Trust your intuition and move forward with confidence.'
      })
    });
  });

  test('Complete user journey: First-time visitor to reading completion', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: User arrives at home page
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Step 2: User navigates to instructions to learn about I Ching
    const instructionsLink = screen.getByRole('link', { name: /instructions|guide|how/i });
    await user.click(instructionsLink);
    
    expect(screen.getByText(/i ching|how to|instructions/i)).toBeInTheDocument();

    // Step 3: User navigates to divination page
    const divinationLink = screen.getByRole('link', { name: /divine|consult|oracle/i });
    await user.click(divinationLink);

    // Step 4: User enters their question
    const questionInput = screen.getByLabelText(/question|ask/i);
    await user.type(questionInput, 'Should I pursue this new career opportunity that has recently presented itself?');

    // Step 5: User submits the divination
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    await user.click(submitButton);

    // Step 6: User sees loading state
    expect(screen.getByText(/divining|consulting|loading/i)).toBeInTheDocument();

    // Step 7: User sees results
    await waitFor(() => {
      expect(screen.getByText(/hexagram/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Step 8: User views detailed interpretation
    const hexagramName = screen.getByText(/creative|receptive|difficulty|progress/i);
    expect(hexagramName).toBeInTheDocument();

    // Step 9: User navigates to history to see their reading
    const historyLink = screen.getByRole('link', { name: /history|past/i });
    await user.click(historyLink);

    // Step 10: User sees their reading in history
    await waitFor(() => {
      expect(screen.getByText(/career opportunity/i)).toBeInTheDocument();
    });

    // Step 11: User can view reading details from history
    const historyItem = screen.getByText(/career opportunity/i);
    await user.click(historyItem);

    expect(screen.getByText(/hexagram/i)).toBeInTheDocument();
  });

  test('Manual coin casting complete flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to divination
    const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
    await user.click(divinationLink);

    // Switch to manual mode
    const manualModeButton = screen.getByRole('button', { name: /manual|traditional|coins/i });
    await user.click(manualModeButton);

    // Enter question
    const questionInput = screen.getByLabelText(/question|ask/i);
    await user.type(questionInput, 'What should I know about my spiritual journey?');

    // Start coin casting process
    const startCastingButton = screen.getByRole('button', { name: /start|begin/i });
    await user.click(startCastingButton);

    // Cast coins for each line (6 times)
    for (let lineNumber = 1; lineNumber <= 6; lineNumber++) {
      // Cast 3 coins for this line
      for (let coinThrow = 1; coinThrow <= 3; coinThrow++) {
        const castButton = screen.getByRole('button', { name: /cast|throw|toss/i });
        await user.click(castButton);
        
        // Wait for coin result
        await waitFor(() => {
          expect(screen.getByText(/heads|tails/i)).toBeInTheDocument();
        });
      }

      // Confirm line result
      const confirmButton = screen.getByRole('button', { name: /confirm|next/i });
      await user.click(confirmButton);
    }

    // View complete hexagram
    await waitFor(() => {
      expect(screen.getByText(/hexagram|interpretation/i)).toBeInTheDocument();
    });

    // Verify the manual casting preserved the traditional method
    expect(screen.getByText(/traditional|manual|coin/i)).toBeInTheDocument();
  });

  test('Settings configuration and theme persistence', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Navigate to settings
    const settingsLink = screen.getByRole('link', { name: /settings|preferences/i });
    await user.click(settingsLink);

    // Change theme
    const darkThemeOption = screen.getByRole('button', { name: /dark|night/i });
    await user.click(darkThemeOption);

    // Disable sound
    const soundToggle = screen.getByRole('checkbox', { name: /sound|audio/i });
    await user.click(soundToggle);

    // Save settings
    const saveButton = screen.getByRole('button', { name: /save|apply/i });
    await user.click(saveButton);

    // Navigate away and back to verify persistence
    const homeLink = screen.getByRole('link', { name: /home/i });
    await user.click(homeLink);

    const settingsLinkAgain = screen.getByRole('link', { name: /settings/i });
    await user.click(settingsLinkAgain);

    // Verify settings persisted
    expect(screen.getByRole('button', { name: /dark|night/i })).toHaveClass(/active|selected/);
    expect(screen.getByRole('checkbox', { name: /sound/i })).not.toBeChecked();
  });

  test('Error recovery and offline functionality', async () => {
    const user = userEvent.setup();
    
    // Mock network failure
    mockFetch.mockRejectedValue(new Error('Network Error'));
    
    render(<App />);

    const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
    await user.click(divinationLink);

    const questionInput = screen.getByLabelText(/question|ask/i);
    await user.type(questionInput, 'Will this error be handled gracefully?');

    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    await user.click(submitButton);

    // Should show fallback interpretation
    await waitFor(() => {
      expect(screen.getByText(/interpretation|hexagram/i)).toBeInTheDocument();
    });

    // Should indicate offline/fallback mode
    expect(screen.getByText(/offline|fallback|basic/i)).toBeInTheDocument();

    // User should still be able to view history
    const historyLink = screen.getByRole('link', { name: /history/i });
    await user.click(historyLink);

    expect(screen.getByText(/error be handled gracefully/i)).toBeInTheDocument();
  });

  test('Mobile-responsive navigation and interaction', async () => {
    const user = userEvent.setup();
    
    // Simulate mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667
    });

    render(<App />);

    // Should show mobile navigation (hamburger menu)
    const mobileMenuButton = screen.getByRole('button', { name: /menu|navigation/i });
    await user.click(mobileMenuButton);

    // Navigation should be visible
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeVisible();

    // Navigate to divination
    const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
    await user.click(divinationLink);

    // Should work on mobile
    const questionInput = screen.getByLabelText(/question|ask/i);
    await user.type(questionInput, 'Mobile test question');

    const submitButton = screen.getByRole('button', { name: /divine|cast/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/hexagram/i)).toBeInTheDocument();
    });
  });

  test('Accessibility compliance throughout the flow', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Test keyboard navigation
    const firstLink = screen.getAllByRole('link')[0];
    firstLink.focus();

    // Tab through the interface
    await user.tab();
    expect(document.activeElement).toHaveAttribute('role');

    // Navigate to divination with keyboard
    const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
    divinationLink.focus();
    await user.keyboard('{Enter}');

    // Form should be accessible
    const questionInput = screen.getByLabelText(/question|ask/i);
    expect(questionInput).toBeInTheDocument();
    expect(questionInput).toHaveAccessibleName();

    // Submit with keyboard
    await user.type(questionInput, 'Accessibility test question');
    await user.tab(); // Tab to submit button
    await user.keyboard('{Enter}');

    // Results should be accessible
    await waitFor(() => {
      const results = screen.getByRole('main');
      expect(results).toHaveAccessibleName;
    });

    // Should have proper heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('Data persistence across browser sessions', async () => {
    const user = userEvent.setup();
    
    // First session
    render(<App />);

    const divinationLink = screen.getByRole('link', { name: /divine|consult/i });
    await user.click(divinationLink);

    const questionInput = screen.getByLabelText(/question|ask/i);
    await user.type(questionInput, 'Persistence test question');

    const submitButton = screen.getByRole('button', { name: /divine|cast/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/hexagram/i)).toBeInTheDocument();
    });

    // Simulate browser restart by clearing component state but keeping localStorage
    const storedData = { ...localStorage };
    
    // Simulate new session
    render(<App />);

    // Restore localStorage (simulating persistence)
    Object.keys(storedData).forEach(key => {
      localStorage.setItem(key, storedData[key]);
    });

    // Navigate to history
    const historyLink = screen.getByRole('link', { name: /history/i });
    await user.click(historyLink);

    // Should see persisted reading
    expect(screen.getByText(/Persistence test question/i)).toBeInTheDocument();
  });
});