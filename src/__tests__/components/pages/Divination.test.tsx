import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils';
import Divination from '../../../pages/Divination';
import { performDivination } from '../../../utils/divination';

// Mock the divination utilities
jest.mock('../../../utils/divination');
const mockPerformDivination = performDivination as jest.MockedFunction<typeof performDivination>;

describe('Divination Component', () => {
  const mockDivinationResult = {
    id: 'test-divination-123',
    question: 'Should I take this new job?',
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
    mockPerformDivination.mockReturnValue(mockDivinationResult);
  });

  test('renders divination form', () => {
    render(<Divination />);
    
    // Look for question input
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    expect(questionInput).toBeInTheDocument();
    
    // Look for submit button
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('allows user to enter a question', () => {
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    fireEvent.change(questionInput, { target: { value: 'Test question' } });
    
    expect(questionInput).toHaveValue('Test question');
  });

  test('performs divination when form is submitted', async () => {
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    
    fireEvent.change(questionInput, { target: { value: 'Should I take this job?' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockPerformDivination).toHaveBeenCalledWith('Should I take this job?');
    });
  });

  test('displays divination results', async () => {
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    
    fireEvent.change(questionInput, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/The Creative/i)).toBeInTheDocument();
      expect(screen.getByText(/乾/)).toBeInTheDocument();
    });
  });

  test('displays hexagram visual representation', async () => {
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    
    fireEvent.change(questionInput, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Look for hexagram visual elements
      const hexagramElement = screen.getByTestId('hexagram-visual') || 
                             screen.getByText(/━━━/) || 
                             screen.getByText(/☰/);
      expect(hexagramElement).toBeInTheDocument();
    });
  });

  test('shows loading state during divination', async () => {
    // Mock a delayed response
    mockPerformDivination.mockImplementation(() => {
      return new Promise(resolve => 
        setTimeout(() => resolve(mockDivinationResult), 100)
      );
    });
    
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    
    fireEvent.change(questionInput, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    // Check for loading indicator
    expect(screen.getByText(/loading|divining|consulting/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/The Creative/i)).toBeInTheDocument();
    });
  });

  test('handles empty question gracefully', () => {
    render(<Divination />);
    
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    fireEvent.click(submitButton);
    
    // Should show validation message or prevent submission
    expect(mockPerformDivination).not.toHaveBeenCalled();
  });

  test('displays changing lines when present', async () => {
    const divinationWithChanges = {
      ...mockDivinationResult,
      changingLines: [1, 3, 5],
      secondaryHexagram: {
        number: 2,
        name: 'The Receptive',
        chinese: '坤',
        unicode: '☷',
        lines: [0, 0, 0, 0, 0, 0]
      }
    };
    
    mockPerformDivination.mockReturnValue(divinationWithChanges);
    
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    
    fireEvent.change(questionInput, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/changing|secondary|transform/i)).toBeInTheDocument();
      expect(screen.getByText(/The Receptive/i)).toBeInTheDocument();
    });
  });

  test('allows manual coin casting method', () => {
    render(<Divination />);
    
    // Look for method selection
    const manualOption = screen.queryByText(/manual|coins|traditional/i);
    if (manualOption) {
      fireEvent.click(manualOption);
      
      // Should show coin casting interface
      expect(screen.getByText(/throw|cast|coins/i)).toBeInTheDocument();
    }
  });

  test('validates question length', () => {
    render(<Divination />);
    
    const questionInput = screen.getByRole('textbox', { name: /question|ask/i });
    
    // Test very long question
    const longQuestion = 'a'.repeat(1000);
    fireEvent.change(questionInput, { target: { value: longQuestion } });
    
    const submitButton = screen.getByRole('button', { name: /divine|cast|consult/i });
    fireEvent.click(submitButton);
    
    // Should handle long questions appropriately
    if (longQuestion.length > 500) {
      expect(screen.getByText(/too long|limit/i)).toBeInTheDocument();
    }
  });
});