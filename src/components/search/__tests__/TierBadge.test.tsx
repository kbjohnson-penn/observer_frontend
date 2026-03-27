import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import { TierBadge } from '../TierBadge';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

function renderWithProvider(ui: React.ReactElement) {
  return render(<Provider>{ui}</Provider>);
}

describe('TierBadge', () => {
  it('renders tier 1 with correct label', () => {
    renderWithProvider(<TierBadge tier={1} />);
    expect(screen.getByText('Tier 1')).toBeInTheDocument();
  });

  it('renders tier 5 with correct label', () => {
    renderWithProvider(<TierBadge tier={5} />);
    expect(screen.getByText('Tier 5')).toBeInTheDocument();
  });

  it('renders nothing for out-of-range tier', () => {
    const { container } = renderWithProvider(<TierBadge tier={99} />);
    expect(container.querySelector('[class]')).toBeNull();
    expect(screen.queryByText(/Tier/)).not.toBeInTheDocument();
  });
});
