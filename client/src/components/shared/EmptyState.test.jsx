import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
  it('renders title and subtitle correctly', () => {
    render(
      <EmptyState
        title="No leads found"
        subtitle="Try adjusting your filters"
        icon={<span data-testid="test-icon">Icon</span>}
      />
    );

    expect(screen.getByText('No leads found')).toBeDefined();
    expect(screen.getByText('Try adjusting your filters')).toBeDefined();
    expect(screen.getByTestId('test-icon')).toBeDefined();
  });

  it('renders action button if provided', () => {
    let clicked = false;
    render(
      <EmptyState
        title="Empty"
        action={{ label: 'Create New', onClick: () => { clicked = true; } }}
      />
    );

    const button = screen.getByText('Create New');
    expect(button).toBeDefined();
    button.click();
    expect(clicked).toBe(true);
  });
});
