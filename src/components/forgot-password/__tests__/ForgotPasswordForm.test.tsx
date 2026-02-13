import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';
import { Provider } from '@/components/ui/provider';

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

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the forgot password form', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      expect(screen.getByText('Forgot Password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should render Observer logo', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const logo = screen.getByAltText('Observer Project');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/ObserverLogoLightBackground.svg');
    });

    it('should show link back to login page', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      expect(screen.getByText('Remember your password?')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
    });

    it('should display description text', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      expect(
        screen.getByText(/enter your email address and we'll send you a link/i)
      ).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update email input value on change', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText(
        'Enter your email address'
      ) as HTMLInputElement;

      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should disable submit button when email is empty', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const submitButton = screen.getByRole('button', { name: /send reset link/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when email is entered', async () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit password reset request successfully', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'If an account exists with this email, you will receive a password reset link.',
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/if an account exists with this email/i)).toBeInTheDocument();
      });

      expect(mockPost).toHaveBeenCalledWith('/accounts/auth/password-reset/', {
        email: 'test@example.com',
      });
    });

    it('should show success view after successful submission (email form hidden)', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'If an account exists with this email, you will receive a password reset link.',
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        // After success, form should be replaced with success view
        expect(screen.queryByPlaceholderText('Enter your email address')).not.toBeInTheDocument();
        expect(screen.getByText(/check your email for a password reset link/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      mockPost.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    detail: 'Password reset link sent.',
                  },
                }),
              100
            )
          )
      );

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /sending/i })).toBeInTheDocument();
    });

    it('should display error message from API for email validation', async () => {
      // Note: HTML5 validation prevents submission of truly invalid emails
      // This tests the API error response when email passes HTML5 validation but fails backend validation
      mockPost.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            errors: {
              email: ['Enter a valid email address.'],
            },
          },
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      // Use a technically valid email format that might fail backend validation
      await user.type(emailInput, 'test@invalid-domain.invalid');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
      });
    });

    it('should display generic error message from API', async () => {
      mockPost.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            detail: 'Rate limit exceeded. Please try again later.',
          },
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Rate limit exceeded. Please try again later.')
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should show success view after successful submission', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'If an account exists with this email, you will receive a password reset link.',
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/check your email for a password reset link/i)).toBeInTheDocument();
        expect(screen.getByText(/the link will expire in 1 hour/i)).toBeInTheDocument();
      });
    });

    it('should show "try again" link after success', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset link sent.',
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });

    it('should allow user to try again after success', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset link sent.',
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });

      // Click "try again"
      const tryAgainButton = screen.getByText(/try again/i);
      await user.click(tryAgainButton);

      // Should show the form again
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
      });
    });

    it('should show "Back to Sign In" link in success view', async () => {
      mockPost.mockResolvedValueOnce({
        data: {
          detail: 'Password reset link sent.',
        },
      });

      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /send reset link/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute(
          'href',
          '/login'
        );
      });
    });
  });

  describe('HTML5 Validation', () => {
    it('should have required email field', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const emailInput = screen.getByPlaceholderText(
        'Enter your email address'
      ) as HTMLInputElement;
      expect(emailInput.required).toBe(true);
    });

    it('should have email type on input', () => {
      render(<ForgotPasswordForm />, { wrapper: TestWrapper });

      const emailInput = screen.getByPlaceholderText(
        'Enter your email address'
      ) as HTMLInputElement;
      expect(emailInput.type).toBe('email');
    });
  });
});
