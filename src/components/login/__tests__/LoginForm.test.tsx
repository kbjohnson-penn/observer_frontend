import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import LoginForm from '../LoginForm';
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

describe('LoginForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockLogin = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
    });
  });

  it('should render login form', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username or email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('should show register link', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register here/i })).toHaveAttribute('href', '/register');
  });

  it('should update input values on change', async () => {
    const user = userEvent.setup();
    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should call login on form submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('should show error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const user = userEvent.setup();

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument();
    });
  });

  it('should disable submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should redirect to dashboard when already authenticated', () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      isAuthenticated: true,
    });

    render(<LoginForm />, { wrapper: TestWrapper });

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('should clear error on new submission', async () => {
    mockLogin
      .mockRejectedValueOnce(new Error('Invalid credentials'))
      .mockResolvedValueOnce(undefined);
    const user = userEvent.setup();

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // First submission fails
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    // Second submission should clear error
    await user.clear(passwordInput);
    await user.type(passwordInput, 'correctpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });

  it('should handle non-Error exceptions', async () => {
    mockLogin.mockRejectedValueOnce('String error');
    const user = userEvent.setup();

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('should have HTML5 required validation on fields', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByPlaceholderText('Enter your username or email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;

    expect(usernameInput.required).toBe(true);
    expect(passwordInput.required).toBe(true);
  });

  it('should have required fields', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    expect(screen.getAllByText('*')).toHaveLength(2); // Two required indicators
  });

  it('should render Observer logo', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const logo = screen.getByAltText('Observer Project');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/ObserverLogoLightBackground.svg');
  });
});
