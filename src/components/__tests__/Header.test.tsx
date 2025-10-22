import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Header from '../Header';
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from '@/components/ui/provider';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, ...restProps } = props;
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...restProps} />;
  },
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

describe('Header', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockLogout = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      });
    });

    it('should render header with logo', () => {
      render(<Header />, { wrapper: TestWrapper });

      const logo = screen.getByAltText('Observer Project');
      expect(logo).toBeInTheDocument();
    });

    it('should show public navigation links', () => {
      render(<Header />, { wrapper: TestWrapper });

      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Dataset')).toBeInTheDocument();
    });

    it('should not show Settings in menu when not authenticated', () => {
      render(<Header />, { wrapper: TestWrapper });

      // Settings should not be visible without opening the menu
      expect(screen.queryByText(/settings/i)).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      });
    });

    it('should show user avatar when authenticated', () => {
      render(<Header />, { wrapper: TestWrapper });

      // Look for user avatar with first letter of username
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should show Explore link when authenticated', () => {
      render(<Header />, { wrapper: TestWrapper });

      expect(screen.getByText('Explore')).toBeInTheDocument();
    });

    it('should call logout when logout is clicked', async () => {
      mockLogout.mockResolvedValueOnce(undefined);
      const user = userEvent.setup();

      render(<Header />, { wrapper: TestWrapper });

      // Open user menu by clicking the avatar
      const userAvatar = screen.getByText('T');
      await user.click(userAvatar);

      // Find and click logout button
      const logoutButton = await screen.findByText('Logout');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should show Settings option in menu', async () => {
      const user = userEvent.setup();

      render(<Header />, { wrapper: TestWrapper });

      // Open user menu
      const userAvatar = screen.getByText('T');
      await user.click(userAvatar);

      expect(await screen.findByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      });
    });

    it('should navigate to public dashboard when not authenticated', () => {
      render(<Header />, { wrapper: TestWrapper });

      const exploreLink = screen.getByText('Explore').closest('a');
      expect(exploreLink).toHaveAttribute('href', '/dashboard-public');
    });

    it('should navigate to dataset page', () => {
      render(<Header />, { wrapper: TestWrapper });

      const datasetLink = screen.getByText('Dataset').closest('a');
      expect(datasetLink).toHaveAttribute('href', '/dataset');
    });
  });

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: mockLogout,
      });
    });

    it('should render mobile menu button', () => {
      render(<Header />, { wrapper: TestWrapper });

      // Mobile menu hamburger button
      const mobileMenuButton = screen.getByLabelText(/toggle menu/i);
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu on click', async () => {
      const user = userEvent.setup();

      render(<Header />, { wrapper: TestWrapper });

      const mobileMenuButton = screen.getByLabelText(/toggle menu/i);
      await user.click(mobileMenuButton);

      // Mobile menu should be visible after click
      // Check for navigation items that would be in mobile menu (should have duplicates)
      expect(screen.getAllByText('Explore')).toHaveLength(2); // Desktop + Mobile
    });
  });

  describe('Edge Cases', () => {
    it('should handle user without email', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser' },
        logout: mockLogout,
      });

      render(<Header />, { wrapper: TestWrapper });

      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should handle logout errors gracefully', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { username: 'testuser', email: 'test@example.com' },
        logout: mockLogout,
      });

      mockLogout.mockRejectedValueOnce(new Error('Logout failed'));
      const user = userEvent.setup();

      render(<Header />, { wrapper: TestWrapper });

      const userAvatar = screen.getByText('T');
      await user.click(userAvatar);

      const logoutButton = await screen.findByText('Logout');
      await user.click(logoutButton);

      // Should still call logout even if it fails
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });
});
