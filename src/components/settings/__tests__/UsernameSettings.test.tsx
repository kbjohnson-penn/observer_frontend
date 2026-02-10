import React from 'react';
import { render, screen } from '@testing-library/react';
import UsernameSettings from '../UsernameSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from '@/components/ui/provider';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock toaster
jest.mock('@/components/ui/toaster', () => ({
  toaster: { create: jest.fn() },
  Toaster: () => null,
}));

// Mock window.matchMedia
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

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Test wrapper with ChakraProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

describe('UsernameSettings', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockRefreshToken = jest.fn();
  const mockUser = {
    username: 'oldusername',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
      refreshToken: mockRefreshToken,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the username management section', () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Username Management')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText(/username changes are currently disabled/i)).toBeInTheDocument();
    });

    it('should display current username', () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('oldusername')).toBeInTheDocument();
    });

    it('should show loading state while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        refreshToken: mockRefreshToken,
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Loading username settings...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing username gracefully', () => {
      mockUseAuth.mockReturnValue({
        user: { username: '', email: 'test@example.com' },
        isLoading: false,
        refreshToken: mockRefreshToken,
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      // Component should render without errors
      expect(screen.getByText('Username Management')).toBeInTheDocument();
    });

    it('should update display when user prop changes', () => {
      const { rerender } = render(<UsernameSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('oldusername')).toBeInTheDocument();

      // Update the mock to return different user
      mockUseAuth.mockReturnValue({
        user: { username: 'newusername', email: 'test@example.com' },
        isLoading: false,
        refreshToken: mockRefreshToken,
      });

      rerender(<UsernameSettings />);

      expect(screen.getByText('newusername')).toBeInTheDocument();
      expect(screen.queryByText('oldusername')).not.toBeInTheDocument();
    });
  });
});
