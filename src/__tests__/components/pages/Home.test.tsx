import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils';
import Home from '../../../pages/Home';

// Mock the divination utilities
jest.mock('../../../utils/divination', () => ({
  performDivination: jest.fn(() => ({
    id: 'test-id',
    question: 'Test question',
    primaryHexagram: {
      number: 1,
      name: 'The Creative',
      chinese: '乾',
      lines: [1, 1, 1, 1, 1, 1]
    },
    changingLines: [],
    timestamp: new Date(),
    method: 'random'
  }))
}));

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders home page with main elements', () => {
    render(<Home />);
    
    // Check for main heading or title
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Look for common I Ching app elements
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('displays welcome message or introduction', () => {
    render(<Home />);
    
    // Look for text that would typically be on a home page
    const welcomeText = screen.getByText(/welcome|oracle|wisdom|ching/i);
    expect(welcomeText).toBeInTheDocument();
  });

  test('has navigation elements', () => {
    render(<Home />);
    
    // Look for navigation links or buttons
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  test('renders without crashing', () => {
    expect(() => render(<Home />)).not.toThrow();
  });

  test('displays loading state appropriately', async () => {
    render(<Home />);
    
    // If there are any async operations, test loading states
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});