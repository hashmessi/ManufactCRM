import { render, screen } from '@testing-library/react';
import AnimatedNumber from './AnimatedNumber';

describe('AnimatedNumber Component', () => {
  it('renders correctly initially', () => {
    render(<AnimatedNumber value={100} prefix="$" suffix="K" duration={0} />);
    // With duration 0, it should reach the end immediately or at least render the prefix
    expect(screen.getByText(/\$/)).toBeDefined();
    expect(screen.getByText(/K/)).toBeDefined();
  });

  it('renders 0 immediately if value is 0', () => {
    render(<AnimatedNumber value={0} />);
    expect(screen.getByText('0')).toBeDefined();
  });
});
