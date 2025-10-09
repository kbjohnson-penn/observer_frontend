import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UsernameSettings from '../UsernameSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from '@/components/ui/provider';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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
    global.fetch = jest.fn();

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
    it('should render the username form', () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Username Management')).toBeInTheDocument();
      expect(screen.getByText('Current Username')).toBeInTheDocument();
      expect(screen.getByText('New Username')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update username/i })).toBeInTheDocument();
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

  describe('Form Interaction', () => {
    it('should update new username input on change', async () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username') as HTMLInputElement;

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'newusername');

      expect(newUsernameInput.value).toBe('newusername');
    });

    it('should disable submit button when username is unchanged', () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      const submitButton = screen.getByRole('button', { name: /update username/i });

      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when username is changed', async () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'newusername');

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit username change successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ username: 'newusername' }),
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'newusername');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username updated successfully!')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/accounts/profile/'),
        expect.objectContaining({
          method: 'PATCH',
          credentials: 'include',
          body: JSON.stringify({ username: 'newusername' }),
        })
      );

      expect(mockRefreshToken).toHaveBeenCalled();
    });

    it('should not submit if username is unchanged', async () => {
      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /update username/i });

      // Try to click the disabled button
      await user.click(submitButton);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({}),
        }), 100))
      );

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'newusername');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /updating/i })).toBeInTheDocument();
    });

    it('should display error for username already taken', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          username: ['A user with that username already exists'],
        }),
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'existinguser');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('A user with that username already exists')).toBeInTheDocument();
      });
    });

    it('should display error for invalid username format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          username: ['Enter a valid username'],
        }),
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'invalid username!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid username')).toBeInTheDocument();
      });
    });

    it('should handle generic API error with detail field', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          detail: 'Internal server error',
        }),
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'newusername');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'newusername');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred while updating your username')).toBeInTheDocument();
      });
    });

    it('should not call refreshToken if update fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          username: ['Username is too short'],
        }),
      });

      render(<UsernameSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const newUsernameInput = screen.getByPlaceholderText('Enter your new username');
      const submitButton = screen.getByRole('button', { name: /update username/i });

      await user.clear(newUsernameInput);
      await user.type(newUsernameInput, 'ab');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username is too short')).toBeInTheDocument();
      });

      expect(mockRefreshToken).not.toHaveBeenCalled();
    });
  });
});
