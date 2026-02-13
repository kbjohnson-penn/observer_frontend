import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSettings from '../ProfileSettings';
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

// Mock apiClient
const mockGet = jest.fn();
const mockPatch = jest.fn();
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
    get: (...args: unknown[]) => mockGet(...args),
    put: jest.fn(),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: jest.fn(),
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

describe('ProfileSettings', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      user: mockUser,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the profile form', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          first_name: 'John',
          last_name: 'Doe',
          date_of_birth: '1990-01-01',
          phone_number: '1234567890',
          address: '123 Main St',
          city: 'Philadelphia',
          state: 'PA',
          country: 'USA',
          zip_code: '19104',
          bio: 'Test bio',
        },
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
        expect(screen.getByText('Address Information')).toBeInTheDocument();
        expect(screen.getByText('Additional Information')).toBeInTheDocument();
      });
    });

    it('should show loading state while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });
  });

  describe('Profile Data Loading', () => {
    it('should load profile data on mount', async () => {
      const profileData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1990-01-01',
        phone_number: '1234567890',
        address: '123 Main St',
        city: 'Philadelphia',
        state: 'PA',
        country: 'USA',
        zip_code: '19104',
        bio: 'Test bio',
      };

      mockGet.mockResolvedValueOnce({
        data: profileData,
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/accounts/profile/');
      });
    });

    it('should handle profile load failure gracefully', async () => {
      mockGet.mockRejectedValueOnce({
        response: {
          status: 500,
        },
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      // Component should render even if profile load fails
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      // Form should still be functional with empty values
      expect(screen.getByPlaceholderText('Enter your first name')).toHaveValue('');
    });
  });

  describe('Form Interaction', () => {
    beforeEach(async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '',
        },
      });
    });

    it('should update input values on change', async () => {
      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('999-999-9999')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const phoneInput = screen.getByPlaceholderText('999-999-9999') as HTMLInputElement;

      await user.type(phoneInput, '5551234567');

      expect(phoneInput.value).toBe('5551234567');
    });

    it('should limit phone number to 10 digits', async () => {
      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('999-999-9999')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const phoneInput = screen.getByPlaceholderText('999-999-9999') as HTMLInputElement;

      await user.type(phoneInput, '12345678901234');

      expect(phoneInput.value).toBe('1234567890');
    });

    it('should strip non-numeric characters from phone number', async () => {
      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('999-999-9999')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const phoneInput = screen.getByPlaceholderText('999-999-9999') as HTMLInputElement;

      await user.type(phoneInput, '(555) 123-4567');

      expect(phoneInput.value).toBe('5551234567');
    });

    it('should have read-only first and last name fields', async () => {
      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        const firstNameInput = screen.getByPlaceholderText(
          'Enter your first name'
        ) as HTMLInputElement;
        const lastNameInput = screen.getByPlaceholderText(
          'Enter your last name'
        ) as HTMLInputElement;

        expect(firstNameInput.readOnly).toBe(true);
        expect(lastNameInput.readOnly).toBe(true);
      });
    });
  });

  describe('Form Submission', () => {
    beforeEach(async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          first_name: 'John',
          last_name: 'Doe',
        },
      });
    });

    it('should submit profile update successfully', async () => {
      mockPatch.mockResolvedValueOnce({
        data: {
          phone_number: '5551234567',
        },
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /save changes/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      mockPatch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {},
                }),
              100
            )
          )
      );

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /save changes/i });

      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    it('should display error message on submission failure', async () => {
      mockPatch.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            phone_number: ['Invalid phone number format'],
          },
        },
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /save changes/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Phone: Invalid phone number format/)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      mockPatch.mockRejectedValueOnce(new Error('Network error'));

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /save changes/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle 401 unauthorized error', async () => {
      mockPatch.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { detail: 'Unauthorized' },
        },
      });

      render(<ProfileSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /save changes/i });

      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Authentication required. Please log in again.')
        ).toBeInTheDocument();
      });
    });
  });
});
