/**
 * Tests for Cohort View Page
 * Tests rendering, data fetching, and error handling for individual cohort views
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CohortViewPage from '../page';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { Provider } from '@/components/ui/provider';

// Mock apiClient
jest.mock('@/lib/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock HealthcareDataBrowser
jest.mock('@/components/healthcare-browser', () => ({
  HealthcareDataBrowser: function MockHealthcareDataBrowser({ sampleData }: any) {
    return (
      <div data-testid="healthcare-data-browser">
        Healthcare Data Browser
        <div data-testid="visit-count">{sampleData?.visits?.length || 0} visits</div>
        <div data-testid="person-count">{sampleData?.persons?.length || 0} persons</div>
      </div>
    );
  },
}));

// Mock ErrorBoundary
jest.mock('@/components/ErrorBoundary', () => {
  return function MockErrorBoundary({ children }: { children: React.ReactNode }) {
    return <div data-testid="error-boundary">{children}</div>;
  };
});

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn(),
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

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

// Mock data
const mockCohort = {
  id: '1',
  name: 'Test Cohort',
  description: 'This is a test cohort for unit testing',
  visit_count: 100,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  filters: {},
};

const mockCohortData = {
  visits: [{ id: 1 }, { id: 2 }],
  persons: [{ id: 1 }],
  providers: [{ id: 1 }],
  conditions: [],
  drugs: [],
  procedures: [],
  measurements: [],
  observations: [],
  notes: [],
  _metadata: {
    count: { visits: 2, persons: 1, providers: 1 },
    description: 'Test Cohort data',
  },
};

describe('CohortViewPage', () => {
  let mockPush: jest.Mock;
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Default successful responses
    mockApiClient.get.mockImplementation((url: string) => {
      if (url.includes('/accounts/cohorts/')) {
        return Promise.resolve({ data: mockCohort });
      }
      if (url.includes('/research/private/cohorts/')) {
        return Promise.resolve({ data: mockCohortData });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  // ============================================================================
  // Loading State Tests
  // ============================================================================

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockApiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      // Check for Chakra Spinner by class
      const spinner = document.querySelector('.chakra-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Cohort Header Tests
  // ============================================================================

  describe('Cohort Header', () => {
    it('should render cohort name in heading', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('Test Cohort')).toBeInTheDocument();
      });
    });

    it('should render cohort description when present', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('This is a test cohort for unit testing')).toBeInTheDocument();
      });
    });

    it('should not render description when empty', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/accounts/cohorts/')) {
          return Promise.resolve({ data: { ...mockCohort, description: '' } });
        }
        if (url.includes('/research/private/cohorts/')) {
          return Promise.resolve({ data: mockCohortData });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('Test Cohort')).toBeInTheDocument();
      });

      expect(screen.queryByText('This is a test cohort for unit testing')).not.toBeInTheDocument();
    });

    it('should display visit count badge', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('100 visits')).toBeInTheDocument();
      });
    });

    it('should display formatted creation date', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText(/Created January 15, 2024/i)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Data Browser Tests
  // ============================================================================

  describe('Data Browser', () => {
    it('should render HealthcareDataBrowser with cohort data', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByTestId('healthcare-data-browser')).toBeInTheDocument();
      });
    });

    it('should pass correct data to HealthcareDataBrowser', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByTestId('visit-count')).toHaveTextContent('2 visits');
        expect(screen.getByTestId('person-count')).toHaveTextContent('1 persons');
      });
    });

    it('should wrap HealthcareDataBrowser in ErrorBoundary', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should redirect to 404 when cohort not found', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/accounts/cohorts/')) {
          return Promise.reject({ response: { status: 404 } });
        }
        return Promise.resolve({ data: mockCohortData });
      });

      render(<CohortViewPage params={Promise.resolve({ cohortId: '999' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/404');
      });
    });

    it('should show error message on fetch failure', async () => {
      mockApiClient.get.mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(
          screen.getByText('Failed to load cohort data. Please try again.')
        ).toBeInTheDocument();
      });
    });

    it('should redirect to 404 when cohort data is null', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/accounts/cohorts/')) {
          return Promise.resolve({ data: null });
        }
        return Promise.resolve({ data: mockCohortData });
      });

      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/404');
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('Integration', () => {
    it('should render complete page with all elements', async () => {
      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        // Header elements
        expect(screen.getByRole('heading', { name: 'Test Cohort' })).toBeInTheDocument();
        expect(screen.getByText('This is a test cohort for unit testing')).toBeInTheDocument();

        // Metadata
        expect(screen.getByText('100 visits')).toBeInTheDocument();
        expect(screen.getByText(/Created January 15, 2024/i)).toBeInTheDocument();

        // Data browser
        expect(screen.getByTestId('healthcare-data-browser')).toBeInTheDocument();
      });
    });

    it('should format large visit counts with commas', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/accounts/cohorts/')) {
          return Promise.resolve({ data: { ...mockCohort, visit_count: 1234567 } });
        }
        if (url.includes('/research/private/cohorts/')) {
          return Promise.resolve({ data: mockCohortData });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText('1,234,567 visits')).toBeInTheDocument();
      });
    });

    it('should handle cohorts with zero visits', async () => {
      mockApiClient.get.mockImplementation((url: string) => {
        if (url.includes('/accounts/cohorts/')) {
          return Promise.resolve({ data: { ...mockCohort, visit_count: 0 } });
        }
        if (url.includes('/research/private/cohorts/')) {
          return Promise.resolve({
            data: {
              visits: [],
              persons: [],
              providers: [],
              _metadata: {
                ...mockCohortData._metadata,
                count: { visits: 0, persons: 0, providers: 0 },
              },
            },
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(<CohortViewPage params={Promise.resolve({ cohortId: '1' })} />, {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        // Check that visit count is displayed (appears in both badge and data browser)
        expect(screen.getAllByText(/0 visits/i).length).toBeGreaterThan(0);
        expect(screen.getByTestId('visit-count')).toHaveTextContent('0 visits');
      });
    });
  });
});
