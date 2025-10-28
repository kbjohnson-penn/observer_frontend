/**
 * DataTable Component Tests
 * Tests for table rendering, sorting, pagination, search, column visibility, and accessibility
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders, userEvent, setupBrowserMocks } from '@/__tests__/utils';
import DataTable from '../DataTable';
import { mockPersons } from '@/__mocks__/omopData';
import { OMOPTableName } from '@/interfaces/observer-omop';

// Setup browser mocks
beforeAll(() => {
  setupBrowserMocks();
});

// Mock data for tests
const mockTable = {
  name: 'PERSON' as OMOPTableName,
  displayName: 'Persons',
  description: 'Patient demographic information',
  data: mockPersons,
};

const mockTableInfo = {
  displayName: 'Persons',
  category: 'person' as const,
};

const defaultProps = {
  table: mockTable,
  selectedTableInfo: mockTableInfo,
  filteredData: mockPersons,
  totalFilteredCount: mockPersons.length,
  searchTerm: '',
  onSearchChange: jest.fn(),
  getTableIcon: jest.fn(() => <div>Icon</div>),
  renderFieldValue: jest.fn((value) => String(value || '-')),
  currentPage: 1,
  pageSize: 20,
  hasNext: false,
  hasPrevious: false,
  onPageChange: jest.fn(),
  sortConfig: null,
  onSortChange: jest.fn(),
  columnVisibility: {
    id: true,
    person_display_id: true,
    year_of_birth: true,
    gender_source_value: true,
    race_source_value: true,
  },
  onColumnVisibilityChange: jest.fn(),
  onShowAllColumns: jest.fn(),
  onHideAllColumns: jest.fn(),
};

describe('DataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render table with data', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      expect(screen.getByText('Persons')).toBeInTheDocument();
      expect(screen.getByText('Patient demographic information')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.getByText('person display id')).toBeInTheDocument();
      expect(screen.getByText('year of birth')).toBeInTheDocument();
    });

    it('should render table rows with correct data', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      expect(screen.getByText('101')).toBeInTheDocument();
      expect(screen.getByText('1985')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('should display empty state when no data', () => {
      const emptyProps = {
        ...defaultProps,
        table: { ...mockTable, data: [] },
        filteredData: [],
        totalFilteredCount: 0,
      };

      renderWithProviders(<DataTable {...emptyProps} />);

      expect(screen.getByText(/No data available for Persons/i)).toBeInTheDocument();
    });

    it('should display record count', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      // Check for the record count text (text is split across elements by Chakra UI)
      expect(screen.getByText(/records/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should call onSortChange when clicking column header', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTable {...defaultProps} />);

      const idHeader = screen.getByRole('button', { name: /sort by id/i });
      await user.click(idHeader);

      expect(defaultProps.onSortChange).toHaveBeenCalledWith('id');
    });

    it('should handle keyboard sorting with Enter key', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTable {...defaultProps} />);

      const idHeader = screen.getByRole('button', { name: /sort by id/i });
      idHeader.focus();
      await user.keyboard('{Enter}');

      expect(defaultProps.onSortChange).toHaveBeenCalledWith('id');
    });

    it('should handle keyboard sorting with Space key', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTable {...defaultProps} />);

      const idHeader = screen.getByRole('button', { name: /sort by id/i });
      idHeader.focus();
      await user.keyboard(' ');

      expect(defaultProps.onSortChange).toHaveBeenCalledWith('id');
    });

    it('should show ascending sort icon when sorted ascending', () => {
      const sortedProps = {
        ...defaultProps,
        sortConfig: { field: 'id', direction: 'asc' as const },
      };

      renderWithProviders(<DataTable {...sortedProps} />);

      const headers = screen.getAllByRole('columnheader');
      const idHeader = headers.find((h) => h.getAttribute('aria-sort') === 'ascending');
      expect(idHeader).toBeDefined();
    });

    it('should show descending sort icon when sorted descending', () => {
      const sortedProps = {
        ...defaultProps,
        sortConfig: { field: 'id', direction: 'desc' as const },
      };

      renderWithProviders(<DataTable {...sortedProps} />);

      const headers = screen.getAllByRole('columnheader');
      const idHeader = headers.find((h) => h.getAttribute('aria-sort') === 'descending');
      expect(idHeader).toBeDefined();
    });
  });

  describe('Search and Highlighting', () => {
    it('should render search input', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search persons/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should call onSearchChange when typing in search', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTable {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText(/search persons/i);
      await user.type(searchInput, 'test');

      expect(defaultProps.onSearchChange).toHaveBeenCalled();
    });

    it('should show filtered count when search is active', () => {
      const searchProps = {
        ...defaultProps,
        searchTerm: 'Male',
        filteredData: [mockPersons[0]],
        totalFilteredCount: 1,
      };

      renderWithProviders(<DataTable {...searchProps} />);

      // Text contains ldquo/rdquo HTML entities
      expect(screen.getByText(/matching/i)).toBeInTheDocument();
      expect(screen.getByText(/Male/i)).toBeInTheDocument();
    });

    it('should show "no results" message when search has no matches', () => {
      const noResultsProps = {
        ...defaultProps,
        searchTerm: 'nonexistent',
        filteredData: [],
        totalFilteredCount: 0,
      };

      renderWithProviders(<DataTable {...noResultsProps} />);

      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
      // getAllByText since "nonexistent" appears in both empty state and search term display
      const matches = screen.getAllByText(/nonexistent/i);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when needed', () => {
      const paginatedProps = {
        ...defaultProps,
        totalFilteredCount: 50,
        hasNext: true,
      };

      renderWithProviders(<DataTable {...paginatedProps} />);

      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should show correct page range in record count', () => {
      const paginatedProps = {
        ...defaultProps,
        currentPage: 1,
        pageSize: 20,
        totalFilteredCount: 50,
        hasNext: true,
      };

      renderWithProviders(<DataTable {...paginatedProps} />);

      // Text is split across multiple elements - check for range and total
      expect(screen.getByText(/1-20/)).toBeInTheDocument();
      expect(screen.getByText(/records/i)).toBeInTheDocument();
      // Total count of 50 appears in the record count
      const recordCountText = screen.getByText(/1-20/).parentElement?.textContent;
      expect(recordCountText).toContain('50');
    });

    it('should call onPageChange when clicking next', async () => {
      const user = userEvent.setup();
      const paginatedProps = {
        ...defaultProps,
        totalFilteredCount: 50,
        hasNext: true,
      };

      renderWithProviders(<DataTable {...paginatedProps} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
    });

    it('should disable previous button on first page', () => {
      const paginatedProps = {
        ...defaultProps,
        currentPage: 1,
        totalFilteredCount: 50,
        hasPrevious: false,
        hasNext: true,
      };

      renderWithProviders(<DataTable {...paginatedProps} />);

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      const paginatedProps = {
        ...defaultProps,
        currentPage: 3,
        totalFilteredCount: 50,
        hasPrevious: true,
        hasNext: false,
      };

      renderWithProviders(<DataTable {...paginatedProps} />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Column Visibility', () => {
    it('should render ColumnSelector component', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      const columnSelector = screen.getByRole('button', { name: /manage columns/i });
      expect(columnSelector).toBeInTheDocument();
    });

    it('should only show visible columns in table', () => {
      const hiddenColumnProps = {
        ...defaultProps,
        columnVisibility: {
          id: true,
          person_display_id: false, // Hidden
          year_of_birth: true,
          gender_source_value: true,
          race_source_value: true,
        },
      };

      renderWithProviders(<DataTable {...hiddenColumnProps} />);

      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.queryByText('person display id')).not.toBeInTheDocument();
      expect(screen.getByText('year of birth')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on column headers', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      const headers = screen.getAllByRole('columnheader');
      expect(headers.length).toBeGreaterThan(0);

      headers.forEach((header) => {
        expect(header).toHaveAttribute('aria-sort');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTable {...defaultProps} />);

      const sortButtons = screen.getAllByRole('button', { name: /sort by/i });

      // Focus on first sort button directly (search input gets focus first by default)
      sortButtons[0].focus();
      expect(sortButtons[0]).toHaveFocus();

      // Tab to next sort button
      await user.tab();
      expect(sortButtons[1]).toHaveFocus();
    });

    it('should have focus indicators on sort buttons', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      const sortButtons = screen.getAllByRole('button', { name: /sort by/i });
      sortButtons.forEach((button) => {
        expect(button).toHaveAttribute('tabindex', '0');
      });
    });

    it('should have aria-label on sort buttons', () => {
      renderWithProviders(<DataTable {...defaultProps} />);

      expect(screen.getByRole('button', { name: /sort by id/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by year of birth/i })).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should handle sorting, pagination, and search together', () => {
      const integrationProps = {
        ...defaultProps,
        totalFilteredCount: 50,
        hasNext: true,
        searchTerm: 'test',
        sortConfig: { field: 'id', direction: 'asc' as const },
      };

      renderWithProviders(<DataTable {...integrationProps} />);

      // Verify all features are present
      expect(screen.getByPlaceholderText(/search persons/i)).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      const sortedHeader = headers.find((h) => h.getAttribute('aria-sort') === 'ascending');
      expect(sortedHeader).toBeDefined();

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText(/matching/i)).toBeInTheDocument();
    });
  });
});
