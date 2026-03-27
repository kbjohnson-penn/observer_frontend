import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';
import SearchBar from '../SearchBar';

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

describe('SearchBar', () => {
  it('renders the input', () => {
    renderWithProvider(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.getByPlaceholderText(/Search by ICD code/i)).toBeInTheDocument();
  });

  it('calls onChange when user types', () => {
    const onChange = jest.fn();
    renderWithProvider(<SearchBar value="" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(/Search by ICD code/i), {
      target: { value: 'metformin' },
    });
    expect(onChange).toHaveBeenCalledWith('metformin');
  });

  it('shows clear button when value is non-empty', () => {
    renderWithProvider(<SearchBar value="test" onChange={jest.fn()} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clear button calls onChange with empty string', () => {
    const onChange = jest.fn();
    renderWithProvider(<SearchBar value="test" onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Clear search'));
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('does not show clear button when value is empty', () => {
    renderWithProvider(<SearchBar value="" onChange={jest.fn()} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('shows result count badge when hasSearched=true and totalCount provided', () => {
    renderWithProvider(<SearchBar value="test" onChange={jest.fn()} hasSearched totalCount={87} />);
    expect(screen.getByText(/87/)).toBeInTheDocument();
  });

  it('does not show result count badge when hasSearched=false', () => {
    renderWithProvider(
      <SearchBar value="" onChange={jest.fn()} hasSearched={false} totalCount={87} />
    );
    expect(screen.queryByText(/87/)).not.toBeInTheDocument();
  });

  it('shows active filter count when hasSearched=true and activeFilterCount > 0', () => {
    renderWithProvider(
      <SearchBar
        value="test"
        onChange={jest.fn()}
        hasSearched
        totalCount={5}
        activeFilterCount={3}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/Active filters/i)).toBeInTheDocument();
  });

  it('does not show active filter count when activeFilterCount=0', () => {
    renderWithProvider(
      <SearchBar
        value="test"
        onChange={jest.fn()}
        hasSearched
        totalCount={5}
        activeFilterCount={0}
      />
    );
    expect(screen.queryByText(/Active filters/i)).not.toBeInTheDocument();
  });
});
