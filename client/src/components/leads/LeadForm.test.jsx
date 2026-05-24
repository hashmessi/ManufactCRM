import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import LeadForm from './LeadForm';
import useLeadStore from '../../store/leadStore';

// Mock the Zustand store
vi.mock('../../store/leadStore', () => {
  return {
    default: vi.fn(),
  };
});

describe('LeadForm Component', () => {
  const mockCreateLead = vi.fn().mockResolvedValue({});
  const mockOnClose = vi.fn();

  beforeEach(() => {
    // Setup default store mock behavior
    useLeadStore.mockImplementation((selector) => {
      const state = {
        createLead: mockCreateLead,
      };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<LeadForm onClose={mockOnClose} />);
    
    // Check for essential form elements based on what LeadForm might have
    expect(screen.getByText(/Add New Lead/i)).toBeInTheDocument();
    // Use getByRole or getByLabelText depending on actual HTML, assuming text fields are rendered:
    // This is a generic check. Wait, we should just check the save/cancel buttons exist.
    expect(screen.getByRole('button', { name: /create lead/i })).toBeInTheDocument();
  });

  it('calls onClose when the cancel button is clicked', () => {
    render(<LeadForm onClose={mockOnClose} />);
    
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
