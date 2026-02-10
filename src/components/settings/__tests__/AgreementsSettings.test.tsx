import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AgreementsSettings from '../AgreementsSettings';
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
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    post: jest.fn(),
    get: (...args: unknown[]) => mockGet(...args),
    put: jest.fn(),
    patch: jest.fn(),
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

// Mock window.open
global.open = jest.fn();

// Test wrapper with ChakraProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

describe('AgreementsSettings', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockDataUseAgreements = [
    {
      id: 1,
      date: '2023-01-15',
      agreement: 'Data Use Agreement v1.0',
      project: 'Research Project A',
      viewUrl: 'https://example.com/dua1.pdf',
      version: '1.0',
      name: 'DUA',
    },
    {
      id: 2,
      date: '2023-03-20',
      agreement: 'Data Use Agreement v1.1',
      project: 'Research Project B',
      viewUrl: 'https://example.com/dua2.pdf',
      version: '1.1',
      name: 'DUA',
    },
  ];

  const mockCodeOfConduct = [
    {
      id: 3,
      date: '2023-01-10',
      agreement: '',
      project: '',
      version: '2.0',
      name: 'Code of Conduct',
    },
  ];

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
    it('should render agreements sections', () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Data Use Agreements')).toBeInTheDocument();
      expect(screen.getByText('Code of Conduct')).toBeInTheDocument();
    });

    it('should show loading state while auth is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      expect(screen.getByText('Loading agreements...')).toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load agreements on mount', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: mockDataUseAgreements,
          code_of_conduct: mockCodeOfConduct,
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/accounts/agreements/user-agreements/grouped/');
      });
    });

    it('should display loaded data use agreements', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: mockDataUseAgreements,
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('2023-01-15')).toBeInTheDocument();
        expect(screen.getByText('Data Use Agreement v1.0')).toBeInTheDocument();
        expect(screen.getByText('Research Project A')).toBeInTheDocument();
        expect(screen.getByText('2023-03-20')).toBeInTheDocument();
        expect(screen.getByText('Research Project B')).toBeInTheDocument();
      });
    });

    it('should display loaded code of conduct agreements', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [],
          code_of_conduct: mockCodeOfConduct,
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('2023-01-10')).toBeInTheDocument();
        expect(screen.getAllByText('Code of Conduct').length).toBeGreaterThan(0);
        expect(screen.getByText('2.0')).toBeInTheDocument();
      });
    });

    it('should handle loading errors gracefully', async () => {
      mockGet.mockRejectedValueOnce({
        response: {
          status: 500,
        },
      });

      // Mock logger.error since we use logger instead of console
      const mockLogger = require('@/lib/logger');
      const loggerErrorSpy = jest.spyOn(mockLogger.logger, 'error').mockImplementation();

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(loggerErrorSpy).toHaveBeenCalledWith('Error loading agreements:', expect.anything());
      });

      loggerErrorSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'));

      // Mock logger.error since we use logger instead of console
      const mockLogger = require('@/lib/logger');
      const loggerErrorSpy = jest.spyOn(mockLogger.logger, 'error').mockImplementation();

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(loggerErrorSpy).toHaveBeenCalledWith('Error loading agreements:', expect.any(Error));
      });

      loggerErrorSpy.mockRestore();
    });
  });

  describe('Empty States', () => {
    it('should show empty state for data use agreements', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('No data use agreements signed')).toBeInTheDocument();
        expect(
          screen.getAllByText('Contact your administrator to sign required agreements').length
        ).toBe(2);
      });
    });

    it('should show empty state for code of conduct', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('No code of conduct agreements signed')).toBeInTheDocument();
      });
    });
  });

  describe('View Agreement Functionality', () => {
    it('should open agreement URL in new tab when View Document is clicked', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: mockDataUseAgreements,
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getAllByText('View Document')).toHaveLength(2);
      });

      const user = userEvent.setup();
      const viewButtons = screen.getAllByText('View Document');

      await user.click(viewButtons[0]);

      expect(global.open).toHaveBeenCalledWith('https://example.com/dua1.pdf', '_blank');
    });

    it('should show "Not Available" for agreements without viewUrl', async () => {
      const agreementWithoutUrl = {
        ...mockDataUseAgreements[0],
        viewUrl: undefined,
      };

      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [agreementWithoutUrl],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Not Available')).toBeInTheDocument();
      });
    });

    it('should not open window when viewUrl is "#"', async () => {
      const agreementWithHashUrl = {
        ...mockDataUseAgreements[0],
        viewUrl: '#',
      };

      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [agreementWithHashUrl],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('View Document')).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const viewButton = screen.getByText('View Document');

      await user.click(viewButton);

      expect(global.open).not.toHaveBeenCalled();
    });
  });

  describe('Table Display', () => {
    it('should display correct column headers for data use agreements', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: mockDataUseAgreements,
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        const headers = screen.getAllByText('Date of Agreement');
        expect(headers[0]).toBeInTheDocument();
        expect(screen.getByText('Agreement')).toBeInTheDocument();
        expect(screen.getByText('Project')).toBeInTheDocument();
        expect(screen.getByText('View Agreement')).toBeInTheDocument();
      });
    });

    it('should display correct column headers for code of conduct', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [],
          code_of_conduct: mockCodeOfConduct,
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getAllByText('Date of Agreement')[1]).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Version')).toBeInTheDocument();
      });
    });

    it('should display "N/A" for missing project field', async () => {
      const agreementWithoutProject = {
        ...mockDataUseAgreements[0],
        project: '',
      };

      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [agreementWithoutProject],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });

    it('should display fallback agreement name when agreement field is empty', async () => {
      const agreementWithoutName = {
        ...mockDataUseAgreements[0],
        agreement: '',
        name: 'Custom DUA',
        version: '3.0',
      };

      mockGet.mockResolvedValueOnce({
        data: {
          data_use_agreements: [agreementWithoutName],
          code_of_conduct: [],
        },
      });

      render(<AgreementsSettings />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Custom DUA v3.0')).toBeInTheDocument();
      });
    });
  });
});
