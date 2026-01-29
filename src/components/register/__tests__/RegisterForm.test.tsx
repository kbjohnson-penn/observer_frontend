import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegisterForm from '../RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { Provider } from '@/components/ui/provider';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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

// Mock toaster
jest.mock('@/components/ui/toaster', () => ({
  toaster: { create: jest.fn() },
  Toaster: () => null,
}));

// Mock fetch for registration API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test wrapper with ChakraProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

describe('RegisterForm', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const mockUseAuth = useAuth as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mockFetch.mockReset();
  });

  it('should render registration form', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your organization')).toBeInTheDocument();
  });

  it('should show login link', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in here/i })).toHaveAttribute('href', '/login');
  });

  it('should update input values on change', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, { wrapper: TestWrapper });

    const firstNameInput = screen.getByPlaceholderText('Enter your first name');
    const lastNameInput = screen.getByPlaceholderText('Enter your last name');
    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const orgInput = screen.getByPlaceholderText('Enter your organization');

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john.doe@university.edu');
    await user.type(orgInput, 'University of Testing');

    expect(firstNameInput).toHaveValue('John');
    expect(lastNameInput).toHaveValue('Doe');
    expect(emailInput).toHaveValue('john.doe@university.edu');
    expect(orgInput).toHaveValue('University of Testing');
  });

  it('should validate email domain', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByPlaceholderText('Enter your email address');
    const firstNameInput = screen.getByPlaceholderText('Enter your first name');
    const lastNameInput = screen.getByPlaceholderText('Enter your last name');
    const orgInput = screen.getByPlaceholderText('Enter your organization');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    // Fill in required fields
    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'john@personal.com');
    await user.type(orgInput, 'Test Org');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please use an institutional email address/i)).toBeInTheDocument();
    });
  });

  it('should render Observer logo', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const logo = screen.getByAltText('Observer Project');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/ObserverLogoLightBackground.svg');
  });

  describe('Back Button Navigation Fix', () => {
    it('should redirect to dashboard when already authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      render(<RegisterForm />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not redirect while auth is still loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
      });

      render(<RegisterForm />, { wrapper: TestWrapper });

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should not redirect when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
      });

      render(<RegisterForm />, { wrapper: TestWrapper });

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should use replace instead of push to prevent back navigation', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
      });

      render(<RegisterForm />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard');
      });

      // Ensure push was NOT called - we want replace to prevent back button issues
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should show loading state during submission', async () => {
      let resolvePromise: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockFetch.mockImplementation(() => fetchPromise);
      const user = userEvent.setup();

      render(<RegisterForm />, { wrapper: TestWrapper });

      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const orgInput = screen.getByPlaceholderText('Enter your organization');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@university.edu');
      await user.type(orgInput, 'University');
      await user.click(submitButton);

      // Check loading state immediately after clicking
      expect(screen.getByRole('button', { name: /creating account/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();

      // Now resolve the promise to complete the submission
      resolvePromise!({ ok: true, json: async () => ({ detail: 'Success' }) });

      // After success, form shows success message (button disappears)
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });

    it('should show success message on successful registration', async () => {
      // Mock CSRF token fetch first, then registration
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ csrfToken: 'test-csrf-token' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ detail: 'Registration successful!' }),
        });
      const user = userEvent.setup();

      render(<RegisterForm />, { wrapper: TestWrapper });

      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const orgInput = screen.getByPlaceholderText('Enter your organization');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@university.edu');
      await user.type(orgInput, 'University');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Registration successful!')).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const user = userEvent.setup();

      render(<RegisterForm />, { wrapper: TestWrapper });

      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const orgInput = screen.getByPlaceholderText('Enter your organization');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'john.doe@university.edu');
      await user.type(orgInput, 'University');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });
});
