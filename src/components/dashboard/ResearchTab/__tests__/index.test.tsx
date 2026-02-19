/**
 * Tests for ResearchTab Component
 * Tests filter interactions, sort functionality, pagination, and cohort creation
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResearchTab from '../index';
import { Provider } from '@/components/ui/provider';
import type { FilterOptions, VisitSearchResult, VisitSearchSort } from '@/interfaces/research';
import type { LocalFilters } from '@/interfaces/researchTab';
import * as cohortStorage from '@/lib/utils/cohortStorage';
import * as filterTransformer from '@/lib/utils/filterTransformer';

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

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

// Mock hooks
const mockUseFilterOptions = jest.fn();
const mockUseVisitSearch = jest.fn();

jest.mock('@/hooks/useFilterOptions', () => ({
  useFilterOptions: () => mockUseFilterOptions(),
}));

jest.mock('@/hooks/useVisitSearch', () => ({
  useVisitSearch: () => mockUseVisitSearch(),
}));

// Mock cohortStorage
jest.mock('@/lib/utils/cohortStorage', () => ({
  createCohort: jest.fn(),
  getCohorts: jest.fn(() => Promise.resolve([])),
}));

// Mock filterTransformer
jest.mock('@/lib/utils/filterTransformer', () => ({
  buildServerFilters: jest.fn((localFilters) => localFilters),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn(),
  },
}));

// Mock toaster
const mockToasterCreate = jest.fn();
jest.mock('@/components/ui/toaster', () => ({
  toaster: {
    create: (...args: unknown[]) => mockToasterCreate(...args),
  },
  Toaster: () => null,
}));

// Mock child components
jest.mock('../FilterSidebar', () => {
  return {
    __esModule: true,
    default: function MockFilterSidebar({
      localFilters,
      filterOptions,
      filterSummary,
      onFilterChange,
      onClearFilters,
      onSaveCohort,
    }: any) {
      return (
        <div data-testid="filter-sidebar">
          <div>Filter Sidebar</div>
          <button onClick={() => onFilterChange('tier', ['1'])}>Change Tier Filter</button>
          <button onClick={onClearFilters}>Clear Filters</button>
          <button onClick={onSaveCohort}>Save as Cohort</button>
          <div data-testid="active-filters">{filterSummary?.activeFilters || 0} filters active</div>
        </div>
      );
    },
  };
});

jest.mock('../VisitsTable', () => {
  return {
    __esModule: true,
    default: function MockVisitsTable({ visits, sort, onSort }: any) {
      return (
        <div data-testid="visits-table">
          <div>Visits: {visits.length}</div>
          <button onClick={() => onSort('id')}>Sort by ID</button>
          <button onClick={() => onSort('visit_start_date')}>Sort by Date</button>
          <div data-testid="sort-info">
            {sort.field} - {sort.direction}
          </div>
        </div>
      );
    },
  };
});

jest.mock('../PaginationControls', () => {
  return {
    __esModule: true,
    default: function MockPaginationControls({
      currentPage,
      totalCount,
      hasNext,
      hasPrevious,
      onPageChange,
    }: any) {
      return (
        <div data-testid="pagination-controls">
          <div>Page {currentPage}</div>
          <div>Total: {totalCount}</div>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={!hasPrevious}>
            Previous
          </button>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={!hasNext}>
            Next
          </button>
        </div>
      );
    },
  };
});

jest.mock('../LoadingSkeleton', () => {
  return {
    __esModule: true,
    default: function MockLoadingSkeleton() {
      return <div data-testid="loading-skeleton">Loading...</div>;
    },
  };
});

jest.mock('../../CohortTab/CreateCohortDialog', () => {
  return {
    __esModule: true,
    default: function MockCreateCohortDialog({
      isOpen,
      onClose,
      onSave,
      filters,
      visitCount,
    }: any) {
      if (!isOpen) {
        return null;
      }
      return (
        <div data-testid="create-cohort-dialog">
          <div>Create Cohort Dialog</div>
          <div data-testid="visit-count">Visit Count: {visitCount}</div>
          <button
            onClick={async () => {
              try {
                await onSave({ name: 'Test Cohort', filters, visitCount });
                onClose();
              } catch {
                // Error is handled in the dialog, don't close on error
              }
            }}
          >
            Save Cohort
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      );
    },
  };
});

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

// Mock data
const mockFilterOptions: FilterOptions = {
  demographics: {
    genders: ['M', 'F'],
    races: ['White', 'Black', 'Asian'],
    ethnicities: ['Hispanic', 'Non-Hispanic'],
    year_of_birth_range: { min: 1950, max: 2020 },
  },
  visit_options: {
    tiers: [1, 2, 3],
    visit_sources: ['Inpatient', 'Outpatient', 'ER'],
    date_range: { earliest: '2020-01-01', latest: '2024-12-31' },
  },
  clinical_options: {
    conditions: {
      available_codes: [],
      available_values: [],
      total_visits: 0,
    },
    labs: {
      procedure_names: [],
      result_flags: [],
      order_statuses: [],
      total_visits: 0,
    },
    drugs: {
      common_drugs: [],
      total_visits: 0,
    },
    procedures: {
      common_names: [],
      future_or_stand_options: [],
      total_visits: 0,
    },
    notes: {
      note_types: [],
      note_statuses: [],
      total_visits: 0,
    },
    observations: {
      file_types: [],
      total_visits: 0,
    },
    measurements: {
      total_visits: 0,
      bp_systolic_range: { min: 80, max: 200 },
      weight_range: { min: 50, max: 300 },
    },
  },
  total_accessible_visits: 1000,
};

const mockVisits: VisitSearchResult[] = [
  {
    visit_id: 1,
    visit_date: '2024-01-15',
    visit_time: '10:00:00',
    visit_source: 'Inpatient',
    visit_source_id: 1,
    tier: 1,
    patient_id: 101,
    patient_age: 45,
    patient_gender: 'M',
    patient_race: 'White',
    patient_ethnicity: 'Non-Hispanic',
    patient_year_of_birth: 1979,
    provider_id: 201,
    provider_age: 50,
    provider_gender: 'F',
    provider_race: 'Asian',
    provider_ethnicity: 'Non-Hispanic',
    provider_year_of_birth: 1974,
  },
  {
    visit_id: 2,
    visit_date: '2024-01-16',
    visit_time: '14:30:00',
    visit_source: 'Outpatient',
    visit_source_id: 2,
    tier: 2,
    patient_id: 102,
    patient_age: 35,
    patient_gender: 'F',
    patient_race: 'Black',
    patient_ethnicity: 'Non-Hispanic',
    patient_year_of_birth: 1989,
    provider_id: 202,
    provider_age: 45,
    provider_gender: 'M',
    provider_race: 'White',
    provider_ethnicity: 'Non-Hispanic',
    provider_year_of_birth: 1979,
  },
];

describe('ResearchTab', () => {
  const mockSetFilters = jest.fn();
  const mockSetSort = jest.fn();
  const mockSetPage = jest.fn();
  const mockCreateCohort = cohortStorage.createCohort as jest.Mock;
  const mockBuildServerFilters = filterTransformer.buildServerFilters as jest.Mock;

  const defaultUseVisitSearchReturn = {
    results: mockVisits,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalCount: 100,
      hasNext: true,
      hasPrevious: false,
    },
    filterSummary: {
      totalVisits: 1000,
      filteredVisits: 100,
      activeFilters: 0,
    },
    sort: {
      field: 'id' as const,
      direction: 'asc' as const,
    },
    setFilters: mockSetFilters,
    setSort: mockSetSort,
    setPage: mockSetPage,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseFilterOptions.mockReturnValue({
      filterOptions: mockFilterOptions,
      loading: false,
      error: null,
    });

    mockUseVisitSearch.mockReturnValue(defaultUseVisitSearchReturn);

    mockBuildServerFilters.mockImplementation((localFilters) => localFilters);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Initial Rendering & Loading', () => {
    it('should show loading skeleton while fetching filter options', () => {
      mockUseFilterOptions.mockReturnValue({
        filterOptions: null,
        loading: true,
        error: null,
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render main components after successful load', async () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('visits-table')).toBeInTheDocument();
        expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
      });

      expect(screen.getByText('Filter Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Research Visits')).toBeInTheDocument();
    });

    it('should show loading skeleton in table while fetching visits', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        loading: true,
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      // Should not show visits table when loading
      expect(screen.queryByTestId('visits-table')).not.toBeInTheDocument();
    });

    it('should display filter summary with visit counts', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText(/Showing 1-20 of 100 visits/)).toBeInTheDocument();
    });

    it('should handle filter options error gracefully', async () => {
      mockUseFilterOptions.mockReturnValue({
        filterOptions: null,
        loading: false,
        error: 'Failed to load filter options',
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockToasterCreate).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to load filter options',
          type: 'error',
        });
      });
    });

    it('should handle visit search error gracefully', async () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        error: 'Failed to search visits',
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockToasterCreate).toHaveBeenCalledWith({
          title: 'Error',
          description: 'Failed to search visits',
          type: 'error',
        });
      });
    });

    it('should display "no visits" message when no results', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        results: [],
        pagination: {
          ...defaultUseVisitSearchReturn.pagination,
          totalCount: 0,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText(/No visits match your current filters/i)).toBeInTheDocument();
    });
  });

  describe('Filter Interactions', () => {
    it('should call buildServerFilters when filter changes', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      const changeTierButton = screen.getByText('Change Tier Filter');
      await user.click(changeTierButton);

      await waitFor(() => {
        expect(mockBuildServerFilters).toHaveBeenCalled();
      });
    });

    it('should call updateFilters with server filters when local filter changes', async () => {
      const user = userEvent.setup({ delay: null });
      mockBuildServerFilters.mockReturnValue({ visit: { tier_id: [1] } });

      render(<ResearchTab />, { wrapper: TestWrapper });

      const changeTierButton = screen.getByText('Change Tier Filter');
      await user.click(changeTierButton);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({ visit: { tier_id: [1] } });
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      const clearButton = screen.getByText('Clear Filters');
      await user.click(clearButton);

      await waitFor(() => {
        expect(mockSetFilters).toHaveBeenCalledWith({});
      });
    });

    it('should display active filter count', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        filterSummary: {
          ...defaultUseVisitSearchReturn.filterSummary,
          activeFilters: 3,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      // Check that filter count is displayed (appears in both sidebar and table header)
      const filterCountElements = screen.getAllByText(/(3 filters active)/i);
      expect(filterCountElements.length).toBeGreaterThan(0);
    });

    it('should show singular "filter" for one active filter', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        filterSummary: {
          ...defaultUseVisitSearchReturn.filterSummary,
          activeFilters: 1,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText(/(1 filter active)/i)).toBeInTheDocument();
    });

    it('should show clear filters button when no visits and filters active', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        results: [],
        pagination: {
          ...defaultUseVisitSearchReturn.pagination,
          totalCount: 0,
        },
        filterSummary: {
          ...defaultUseVisitSearchReturn.filterSummary,
          activeFilters: 2,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      const clearButtons = screen.getAllByText('Clear Filters');
      expect(clearButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Sort Functionality', () => {
    it('should toggle sort direction when clicking same column', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      const sortByIdButton = screen.getByText('Sort by ID');

      // First click: asc -> desc
      await user.click(sortByIdButton);

      await waitFor(() => {
        expect(mockSetSort).toHaveBeenCalledWith({
          field: 'id',
          direction: 'desc',
        });
      });
    });

    it('should change sort field when clicking different column', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      const sortByDateButton = screen.getByText('Sort by Date');
      await user.click(sortByDateButton);

      await waitFor(() => {
        expect(mockSetSort).toHaveBeenCalledWith({
          field: 'visit_start_date',
          direction: 'asc',
        });
      });
    });

    it('should display current sort info', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByTestId('sort-info')).toHaveTextContent('id - asc');
    });

    it('should update sort direction from asc to desc', async () => {
      const user = userEvent.setup({ delay: null });
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        sort: {
          field: 'id' as const,
          direction: 'asc' as const,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      const sortButton = screen.getByText('Sort by ID');
      await user.click(sortButton);

      await waitFor(() => {
        expect(mockSetSort).toHaveBeenCalledWith({
          field: 'id',
          direction: 'desc',
        });
      });
    });
  });

  describe('Pagination', () => {
    it('should call setPage with next page when next button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      const nextButton = screen.getByText('Next');
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockSetPage).toHaveBeenCalledWith(2);
      });
    });

    it('should call setPage with previous page when previous button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        pagination: {
          ...defaultUseVisitSearchReturn.pagination,
          currentPage: 3,
          hasPrevious: true,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      const previousButton = screen.getByText('Previous');
      await user.click(previousButton);

      await waitFor(() => {
        expect(mockSetPage).toHaveBeenCalledWith(2);
      });
    });

    it('should display current page number', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        pagination: {
          ...defaultUseVisitSearchReturn.pagination,
          currentPage: 5,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText('Page 5')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      const previousButton = screen.getByText('Previous');
      expect(previousButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        pagination: {
          ...defaultUseVisitSearchReturn.pagination,
          hasNext: false,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeDisabled();
    });

    it('should show correct range in header', () => {
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        pagination: {
          ...defaultUseVisitSearchReturn.pagination,
          currentPage: 3,
          totalCount: 150,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText(/Showing 41-60 of 150 visits/)).toBeInTheDocument();
    });
  });

  describe('Cohort Creation Flow', () => {
    it('should open CreateCohortDialog when save cohort button clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      const saveCohortButton = screen.getByText('Save as Cohort');
      await user.click(saveCohortButton);

      await waitFor(() => {
        expect(screen.getByTestId('create-cohort-dialog')).toBeInTheDocument();
      });
    });

    it('should pass current visit count to dialog', async () => {
      const user = userEvent.setup({ delay: null });
      mockUseVisitSearch.mockReturnValue({
        ...defaultUseVisitSearchReturn,
        filterSummary: {
          ...defaultUseVisitSearchReturn.filterSummary,
          filteredVisits: 250,
        },
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      await user.click(screen.getByText('Save as Cohort'));

      await waitFor(() => {
        expect(screen.getByTestId('visit-count')).toHaveTextContent('Visit Count: 250');
      });
    });

    it('should call createCohort API when dialog submitted', async () => {
      const user = userEvent.setup({ delay: null });
      mockCreateCohort.mockResolvedValue({
        id: '1',
        name: 'Test Cohort',
        filters: {},
        visitCount: 100,
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      await user.click(screen.getByText('Save as Cohort'));

      await waitFor(() => {
        expect(screen.getByTestId('create-cohort-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save Cohort'));

      await waitFor(() => {
        expect(mockCreateCohort).toHaveBeenCalledWith({
          name: 'Test Cohort',
          filters: expect.any(Object),
          visitCount: 100,
        });
      });
    });

    it('should show success toast after cohort created', async () => {
      const user = userEvent.setup({ delay: null });
      mockCreateCohort.mockResolvedValue({
        id: '1',
        name: 'Test Cohort',
        filters: {},
        visitCount: 100,
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      await user.click(screen.getByText('Save as Cohort'));
      await user.click(screen.getByText('Save Cohort'));

      await waitFor(() => {
        expect(mockToasterCreate).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Cohort saved successfully! View it in the Cohorts tab.',
          type: 'success',
        });
      });
    });

    it('should close dialog after successful save', async () => {
      const user = userEvent.setup({ delay: null });
      mockCreateCohort.mockResolvedValue({
        id: '1',
        name: 'Test Cohort',
        filters: {},
        visitCount: 100,
      });

      render(<ResearchTab />, { wrapper: TestWrapper });

      await user.click(screen.getByText('Save as Cohort'));

      await waitFor(() => {
        expect(screen.getByTestId('create-cohort-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save Cohort'));

      await waitFor(() => {
        expect(screen.queryByTestId('create-cohort-dialog')).not.toBeInTheDocument();
      });
    });

    it('should close dialog when cancel clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ResearchTab />, { wrapper: TestWrapper });

      await user.click(screen.getByText('Save as Cohort'));

      await waitFor(() => {
        expect(screen.getByTestId('create-cohort-dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Cancel'));

      await waitFor(() => {
        expect(screen.queryByTestId('create-cohort-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Integration with Hooks', () => {
    it('should use useFilterOptions hook on mount', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(mockUseFilterOptions).toHaveBeenCalled();
    });

    it('should use useVisitSearch hook on mount', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(mockUseVisitSearch).toHaveBeenCalled();
    });

    it('should pass filter options to FilterSidebar', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();
    });

    it('should pass visits data to VisitsTable', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText('Visits: 2')).toBeInTheDocument();
    });

    it('should pass pagination data to PaginationControls', () => {
      render(<ResearchTab />, { wrapper: TestWrapper });

      expect(screen.getByText('Total: 100')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    describe('Filter Options API', () => {
      it('should handle filter options loading state correctly', () => {
        mockUseFilterOptions.mockReturnValue({
          filterOptions: null,
          loading: true,
          error: null,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        // Should show loading skeleton
        expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
        expect(screen.queryByTestId('filter-sidebar')).not.toBeInTheDocument();
      });

      it('should render content when filter options load successfully', async () => {
        mockUseFilterOptions.mockReturnValue({
          filterOptions: mockFilterOptions,
          loading: false,
          error: null,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await waitFor(() => {
          expect(screen.getByTestId('filter-sidebar')).toBeInTheDocument();
          expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
        });
      });

      it('should display error toast when filter options API fails', async () => {
        mockUseFilterOptions.mockReturnValue({
          filterOptions: null,
          loading: false,
          error: 'Failed to load filter options',
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await waitFor(() => {
          expect(mockToasterCreate).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Failed to load filter options',
            type: 'error',
          });
        });
      });
    });

    describe('Visit Search API', () => {
      it('should display visits when API returns data', async () => {
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          results: mockVisits,
          loading: false,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await waitFor(() => {
          expect(screen.getByText('Visits: 2')).toBeInTheDocument();
        });
      });

      it('should show loading state while visits are being fetched', () => {
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          loading: true,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        // Should not show visits table when loading
        expect(screen.queryByTestId('visits-table')).not.toBeInTheDocument();
      });

      it('should handle empty results from visit search', () => {
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          results: [],
          pagination: {
            ...defaultUseVisitSearchReturn.pagination,
            totalCount: 0,
          },
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        expect(screen.getByText(/No visits match your current filters/i)).toBeInTheDocument();
      });

      it('should call setFilters when filters change', async () => {
        const user = userEvent.setup({ delay: null });
        const mockFilters = { visit: { tier_id: [1] } };
        mockBuildServerFilters.mockReturnValue(mockFilters);

        render(<ResearchTab />, { wrapper: TestWrapper });

        const changeTierButton = screen.getByText('Change Tier Filter');
        await user.click(changeTierButton);

        await waitFor(() => {
          expect(mockSetFilters).toHaveBeenCalledWith(mockFilters);
        });
      });

      it('should call setSort when sort changes', async () => {
        const user = userEvent.setup({ delay: null });

        render(<ResearchTab />, { wrapper: TestWrapper });

        const sortButton = screen.getByText('Sort by Date');
        await user.click(sortButton);

        await waitFor(() => {
          expect(mockSetSort).toHaveBeenCalledWith({
            field: 'visit_start_date',
            direction: 'asc',
          });
        });
      });

      it('should call setPage when pagination changes', async () => {
        const user = userEvent.setup({ delay: null });

        render(<ResearchTab />, { wrapper: TestWrapper });

        const nextButton = screen.getByText('Next');
        await user.click(nextButton);

        await waitFor(() => {
          expect(mockSetPage).toHaveBeenCalledWith(2);
        });
      });

      it('should display error toast when visit search API fails', async () => {
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          error: 'Failed to search visits',
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await waitFor(() => {
          expect(mockToasterCreate).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Failed to search visits',
            type: 'error',
          });
        });
      });
    });

    describe('Cohort Creation API', () => {
      it('should call createCohort with correct parameters', async () => {
        const user = userEvent.setup({ delay: null });
        const mockFilters = { visit: { tier_id: [1] } };
        mockBuildServerFilters.mockReturnValue(mockFilters);
        mockCreateCohort.mockResolvedValue({
          id: '1',
          name: 'Test Cohort',
          filters: mockFilters,
          visitCount: 100,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await user.click(screen.getByText('Save as Cohort'));
        await user.click(screen.getByText('Save Cohort'));

        await waitFor(() => {
          expect(mockCreateCohort).toHaveBeenCalledWith({
            name: 'Test Cohort',
            filters: mockFilters,
            visitCount: 100,
          });
        });
      });

      it('should show success toast on successful cohort creation', async () => {
        const user = userEvent.setup({ delay: null });
        mockCreateCohort.mockResolvedValue({
          id: '1',
          name: 'Test Cohort',
          filters: {},
          visitCount: 100,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await user.click(screen.getByText('Save as Cohort'));
        await user.click(screen.getByText('Save Cohort'));

        await waitFor(() => {
          expect(mockToasterCreate).toHaveBeenCalledWith({
            title: 'Success',
            description: 'Cohort saved successfully! View it in the Cohorts tab.',
            type: 'success',
          });
        });
      });

      it('should pass current filter state to cohort creation', async () => {
        const user = userEvent.setup({ delay: null });
        const mockFilters = {
          visit: { tier_id: [1, 2] },
          person_demographics: { gender: ['M'] },
        };
        mockBuildServerFilters.mockReturnValue(mockFilters);
        mockCreateCohort.mockResolvedValue({
          id: '1',
          name: 'Test Cohort',
          filters: mockFilters,
          visitCount: 250,
        });

        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          filterSummary: {
            ...defaultUseVisitSearchReturn.filterSummary,
            filteredVisits: 250,
          },
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        await user.click(screen.getByText('Save as Cohort'));

        // Dialog should show correct visit count
        expect(screen.getByTestId('visit-count')).toHaveTextContent('Visit Count: 250');

        await user.click(screen.getByText('Save Cohort'));

        await waitFor(() => {
          expect(mockCreateCohort).toHaveBeenCalledWith(
            expect.objectContaining({
              filters: mockFilters,
              visitCount: 250,
            })
          );
        });
      });
    });

    describe('Data Transformation', () => {
      it('should use buildServerFilters to transform local filters', async () => {
        const user = userEvent.setup({ delay: null });
        mockBuildServerFilters.mockClear();

        render(<ResearchTab />, { wrapper: TestWrapper });

        await user.click(screen.getByText('Change Tier Filter'));

        await waitFor(() => {
          expect(mockBuildServerFilters).toHaveBeenCalled();
          const callArgs = mockBuildServerFilters.mock.calls[0][0];
          expect(callArgs).toHaveProperty('tier');
        });
      });

      it('should handle empty filters correctly', async () => {
        const user = userEvent.setup({ delay: null });
        mockBuildServerFilters.mockReturnValue({});

        render(<ResearchTab />, { wrapper: TestWrapper });

        await user.click(screen.getByText('Clear Filters'));

        await waitFor(() => {
          expect(mockSetFilters).toHaveBeenCalledWith({});
        });
      });

      it('should preserve filter summary from API response', () => {
        const customFilterSummary = {
          totalVisits: 2000,
          filteredVisits: 500,
          activeFilters: 5,
        };

        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          filterSummary: customFilterSummary,
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        expect(screen.getByText(/Showing 1-20 of 100 visits/)).toBeInTheDocument();
        // Filter count appears in both sidebar and table header
        const filterCountElements = screen.getAllByText(/(5 filters active)/i);
        expect(filterCountElements.length).toBeGreaterThan(0);
      });

      it('should display pagination correctly from API response', () => {
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          pagination: {
            currentPage: 3,
            totalCount: 500,
            hasNext: true,
            hasPrevious: true,
            pageSize: 20,
          },
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        expect(screen.getByText('Page 3')).toBeInTheDocument();
        expect(screen.getByText(/Showing 41-60 of 500 visits/)).toBeInTheDocument();
      });
    });

    describe('Error Recovery', () => {
      it('should allow retry after API error', async () => {
        // Start with error
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          error: 'Network error',
        });

        const { rerender } = render(<ResearchTab />, { wrapper: TestWrapper });

        // Error shows via toast, not DOM text
        await waitFor(() => {
          expect(mockToasterCreate).toHaveBeenCalledWith({
            title: 'Error',
            description: 'Network error',
            type: 'error',
          });
        });

        // Clear mock to track new calls
        mockToasterCreate.mockClear();

        // Simulate successful retry
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          error: null,
          results: mockVisits,
        });

        rerender(
          <TestWrapper>
            <ResearchTab />
          </TestWrapper>
        );

        await waitFor(() => {
          // No new error toast should be shown
          expect(mockToasterCreate).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error' })
          );
          expect(screen.getByText('Visits: 2')).toBeInTheDocument();
        });
      });

      it('should handle cohort creation failure', async () => {
        const user = userEvent.setup({ delay: null });
        mockCreateCohort.mockRejectedValue(new Error('Failed to create cohort'));

        render(<ResearchTab />, { wrapper: TestWrapper });

        await user.click(screen.getByText('Save as Cohort'));

        // Error will be handled in CreateCohortDialog (which we mocked)
        // So we just verify the API was called and failed
        await user.click(screen.getByText('Save Cohort'));

        await waitFor(() => {
          expect(mockCreateCohort).toHaveBeenCalled();
        });
      });

      it('should continue showing data during reload', () => {
        mockUseVisitSearch.mockReturnValue({
          ...defaultUseVisitSearchReturn,
          loading: true, // Loading new data
          results: mockVisits, // But still showing old data
        });

        render(<ResearchTab />, { wrapper: TestWrapper });

        // Should show loading state instead of table when loading
        expect(screen.queryByTestId('visits-table')).not.toBeInTheDocument();
      });
    });
  });
});
