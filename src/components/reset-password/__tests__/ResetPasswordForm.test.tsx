import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ResetPasswordForm from '../ResetPasswordForm';
import { Provider } from '@/components/ui/provider';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
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

// Mock toaster
jest.mock('@/components/ui/toaster', () => ({
  toaster: { create: jest.fn() },
  Toaster: () => null,
}));

// Mock apiClient
const mockPost = jest.fn();
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

// Test wrapper with ChakraProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

describe('ResetPasswordForm', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('should render the reset password form with valid token', () => {
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your new password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should render Observer logo', () => {
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const logo = screen.getByAltText('Observer Project');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/ObserverLogoLightBackground.svg');
    });

    it('should display description text', () => {
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      expect(screen.getByText('Enter your new password below')).toBeInTheDocument();
    });

    it('should show password requirements helper text', () => {
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
    });
  });

  describe('Invalid Token Handling', () => {
    it('should show error when token is null', () => {
      render(<ResetPasswordForm token={null} />, { wrapper: TestWrapper });

      expect(
        screen.getByText('Invalid password reset link. Please request a new one.')
      ).toBeInTheDocument();
    });

    it('should show link to request new password reset when token is invalid', () => {
      render(<ResetPasswordForm token={null} />, { wrapper: TestWrapper });

      expect(
        screen.getByRole('link', { name: /request a new password reset link/i })
      ).toHaveAttribute('href', '/forgot-password');
    });

    it('should not show the form when token is null', () => {
      render(<ResetPasswordForm token={null} />, { wrapper: TestWrapper });

      expect(screen.queryByPlaceholderText('Enter your new password')).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update password input values on change', async () => {
      jest.useRealTimers();
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText(
        'Enter your new password'
      ) as HTMLInputElement;
      const confirmInput = screen.getByPlaceholderText(
        'Confirm your new password'
      ) as HTMLInputElement;

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');

      expect(passwordInput.value).toBe('NewPassword123!');
      expect(confirmInput.value).toBe('NewPassword123!');
    });

    it('should clear field-specific error when user starts typing', async () => {
      jest.useRealTimers();
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      // Trigger validation error
      await user.type(passwordInput, 'short');
      await user.type(confirmInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 12 characters long')
        ).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.clear(passwordInput);
      await user.type(passwordInput, 'NewLongPassword123!');

      await waitFor(() => {
        expect(
          screen.queryByText('Password must be at least 12 characters long')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when password is too short', async () => {
      jest.useRealTimers();
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'short');
      await user.type(confirmInput, 'short');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 12 characters long')
        ).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      jest.useRealTimers();
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'DifferentPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should show error when password lacks complexity', async () => {
      jest.useRealTimers();
      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      // Missing special character
      await user.type(passwordInput, 'Newpassword123');
      await user.type(confirmInput, 'Newpassword123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Password must contain uppercase, lowercase, number, and special character'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit password reset successfully', async () => {
      jest.useRealTimers();
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Your password has been reset successfully. You can now log in.',
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Your password has been reset successfully. You can now log in.')
        ).toBeInTheDocument();
      });

      expect(mockPost).toHaveBeenCalledWith('/accounts/auth/password-reset/confirm/', {
        token: 'valid-token-123',
        password: 'NewPassword123!',
        password_confirm: 'NewPassword123!',
      });
    });

    it('should show success view after successful submission (form hidden)', async () => {
      jest.useRealTimers();
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset successful.',
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        // After success, the success view should be shown
        expect(screen.getByText('Password reset successful.')).toBeInTheDocument();
        expect(screen.getByText(/redirecting to login page/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      jest.useRealTimers();
      mockPost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    detail: 'Password reset successful.',
                  },
                }),
              100
            )
          )
      );

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /resetting/i })).toBeInTheDocument();
    });

    it('should redirect to login after successful reset', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset successful.',
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Password reset successful.')).toBeInTheDocument();
      });

      // Advance timers by 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should display error for invalid token from API', async () => {
      jest.useRealTimers();
      // When API returns a token error via detail (not nested errors), it shows the error view
      mockPost.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            detail: 'Invalid or expired token.',
          },
        },
      });

      render(<ResetPasswordForm token="expired-token" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid or expired token.')).toBeInTheDocument();
      });
    });

    it('should display error for weak password from API', async () => {
      jest.useRealTimers();
      mockPost.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            errors: {
              password: ['This password is too common.'],
            },
          },
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'Password123456!');
      await user.type(confirmInput, 'Password123456!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('This password is too common.')).toBeInTheDocument();
      });
    });

    it('should display generic API error', async () => {
      jest.useRealTimers();
      mockPost.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            detail: 'Internal server error',
          },
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      jest.useRealTimers();
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should show success view with redirect message', async () => {
      jest.useRealTimers();
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset successful.',
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/redirecting to login page/i)).toBeInTheDocument();
      });
    });

    it('should show link to login immediately after success', async () => {
      jest.useRealTimers();
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset successful.',
        },
      });

      render(<ResetPasswordForm token="valid-token-123" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /click here to login now/i })).toHaveAttribute(
          'href',
          '/login'
        );
      });
    });
  });

  describe('Error State', () => {
    it('should show link to request new reset when error occurs', async () => {
      jest.useRealTimers();
      mockPost.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            detail: 'Token expired',
          },
        },
      });

      render(<ResetPasswordForm token="expired-token" />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const passwordInput = screen.getByPlaceholderText('Enter your new password');
      const confirmInput = screen.getByPlaceholderText('Confirm your new password');
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await user.type(passwordInput, 'NewPassword123!');
      await user.type(confirmInput, 'NewPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByRole('link', { name: /request a new password reset link/i })
        ).toHaveAttribute('href', '/forgot-password');
      });
    });
  });
});
