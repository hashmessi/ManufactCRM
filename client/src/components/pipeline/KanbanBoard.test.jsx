import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import KanbanBoard from './KanbanBoard';
import useLeadStore from '../../store/leadStore';

// Mock the Zustand store
vi.mock('../../store/leadStore', () => {
  return {
    default: vi.fn(),
  };
});

import { BrowserRouter } from 'react-router';

describe('KanbanBoard Component', () => {
  beforeEach(() => {
    // Setup default store mock behavior
    useLeadStore.mockImplementation((selector) => {
      // Return dummy states based on what KanbanBoard expects
      const state = {
        leads: [
          { _id: '1', companyName: 'Lead 1', stage: 'New', score: 80 },
          { _id: '2', companyName: 'Lead 2', stage: 'Contacted', score: 40 },
        ],
        stages: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'],
        updateLeadStage: vi.fn(),
      };
      // If a selector is passed (which Zustand does), call it with our mock state
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all pipeline stages', () => {
    render(
      <BrowserRouter>
        <KanbanBoard />
      </BrowserRouter>
    );
    
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('Won')).toBeInTheDocument();
  });

  it('renders leads in their respective columns', () => {
    render(
      <BrowserRouter>
        <KanbanBoard />
      </BrowserRouter>
    );
    
    // We expect the text for the leads to be visible on the board
    expect(screen.getByText('Lead 1')).toBeInTheDocument();
    expect(screen.getByText('Lead 2')).toBeInTheDocument();
  });
});
