import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordSettings from '../PasswordSettings';
import { Provider } from '@/components/ui/provider';

// Mock useAuth hook
const mockLogout = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { username: 'testuser', email: 'test@example.com', id: 1 },
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    refreshToken: jest.fn(),
  }),
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

describe('PasswordSettings', () => {
  beforeEach(() => {
    // Ensure we start with real timers, then clear everything
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
    // Explicitly reset mockLogout to ensure clean state
    mockLogout.mockClear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clean up any timers that might be running
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render the password form', () => {
      render(<PasswordSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Password Security')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update input values on change', async () => {
      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText(
        'Enter your current password'
      ) as HTMLInputElement;
      const newPasswordInput = screen.getByPlaceholderText(
        'Enter your new password'
      ) as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText(
        'Confirm your new password'
      ) as HTMLInputElement;

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');

      expect(currentPasswordInput.value).toBe('OldPassword123!');
      expect(newPasswordInput.value).toBe('NewPassword456!');
      expect(confirmPasswordInput.value).toBe('NewPassword456!');
    });
  });

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
      });
    });

    it('should show error when password is too short', async () => {
      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'short');
      await user.type(confirmPasswordInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 12 characters long')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit password change successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          detail: 'Password updated successfully. Please log in again with your new password.',
          logout_required: true,
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Password updated successfully. Please log in again with your new password.'
          )
        ).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/accounts/auth/change-password/'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            old_password: 'OldPassword123!',
            new_password: 'NewPassword456!',
            new_password_confirm: 'NewPassword456!',
          }),
        })
      );
    });

    it('should clear form fields after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          detail: 'Password updated successfully. Please log in again with your new password.',
          logout_required: true,
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText(
        'Enter your current password'
      ) as HTMLInputElement;
      const newPasswordInput = screen.getByPlaceholderText(
        'Enter your new password'
      ) as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText(
        'Confirm your new password'
      ) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(currentPasswordInput.value).toBe('');
        expect(newPasswordInput.value).toBe('');
        expect(confirmPasswordInput.value).toBe('');
      });
    });

    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    detail:
                      'Password updated successfully. Please log in again with your new password.',
                    logout_required: true,
                  }),
                }),
              100
            )
          )
      );

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /updating/i })).toBeInTheDocument();
    });

    it('should display error message for incorrect current password', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          old_password: ['Incorrect password'],
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'WrongPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      });
    });

    it('should handle weak password error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          new_password: ['This password is too common'],
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'Password123456!'); // Must be 12+ chars to pass client validation
      await user.type(confirmPasswordInput, 'Password123456!');
      await user.click(submitButton);

      await waitFor(
        () => {
          // Look for the API error message from backend
          expect(screen.getByText(/too common/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should handle generic API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          detail: 'Internal server error',
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('An error occurred while updating your password')
        ).toBeInTheDocument();
      });
    });

    it('should trigger logout when logout_required flag is true', async () => {
      // Wait for any pending timers from previous tests to fire, then reset the mock
      await new Promise((resolve) => setTimeout(resolve, 3200));
      const callsFromPreviousTests = mockLogout.mock.calls.length;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          detail: 'Password updated successfully. Please log in again with your new password.',
          logout_required: true,
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(
          screen.getByText(
            'Password updated successfully. Please log in again with your new password.'
          )
        ).toBeInTheDocument();
      });

      // Wait 3 seconds for the logout timer to fire
      await new Promise((resolve) => setTimeout(resolve, 3100));

      // Verify logout was called exactly once MORE than the baseline
      expect(mockLogout.mock.calls.length).toBe(callsFromPreviousTests + 1);
    });

    it('should not trigger logout when logout_required flag is false', async () => {
      // Wait for any pending timers from previous tests to fire, then get baseline
      await new Promise((resolve) => setTimeout(resolve, 3200));
      const callsFromPreviousTests = mockLogout.mock.calls.length;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          detail: 'Password updated successfully!',
          logout_required: false,
        }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'OldPassword123!');
      await user.type(newPasswordInput, 'NewPassword456!');
      await user.type(confirmPasswordInput, 'NewPassword456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
      });

      // Wait 4 seconds to ensure no logout timer fires from THIS test
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Logout should NOT have been called any additional times beyond the baseline
      expect(mockLogout.mock.calls.length).toBe(callsFromPreviousTests);
    });
  });
});
