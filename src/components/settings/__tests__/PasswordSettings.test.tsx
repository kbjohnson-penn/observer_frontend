import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordSettings from '../PasswordSettings';
import { Provider } from '@/components/ui/provider';

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

describe('PasswordSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password') as HTMLInputElement;
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password') as HTMLInputElement;

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');

      expect(currentPasswordInput.value).toBe('oldpassword123');
      expect(newPasswordInput.value).toBe('newpassword456');
      expect(confirmPasswordInput.value).toBe('newpassword456');
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

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'differentpassword');
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

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'short');
      await user.type(confirmPasswordInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit password change successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Password updated successfully' }),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/accounts/auth/change-password/'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            old_password: 'oldpassword123',
            new_password: 'newpassword456',
            new_password_confirm: 'newpassword456',
          }),
        })
      );
    });

    it('should clear form fields after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password') as HTMLInputElement;
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password') as HTMLInputElement;
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password') as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(currentPasswordInput.value).toBe('');
        expect(newPasswordInput.value).toBe('');
        expect(confirmPasswordInput.value).toBe('');
      });
    });

    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({}),
        }), 100))
      );

      render(<PasswordSettings />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const currentPasswordInput = screen.getByPlaceholderText('Enter your current password');
      const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /update password/i });

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');
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

      await user.type(currentPasswordInput, 'wrongpassword');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');
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

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This password is too common')).toBeInTheDocument();
      });
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

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');
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

      await user.type(currentPasswordInput, 'oldpassword123');
      await user.type(newPasswordInput, 'newpassword456');
      await user.type(confirmPasswordInput, 'newpassword456');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An error occurred while updating your password')).toBeInTheDocument();
      });
    });
  });
});
