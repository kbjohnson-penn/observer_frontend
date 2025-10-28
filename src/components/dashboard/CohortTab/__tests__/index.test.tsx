/**
 * Tests for CohortTab Component
 * Tests initial loading, refresh functionality, and cohort operations
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CohortTab from '../index';
import { Provider } from '@/components/ui/provider';
import type { Cohort } from '@/interfaces/cohort';
import * as cohortStorage from '@/lib/utils/cohortStorage';
import { useRouter } from 'next/navigation';

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

// Mock cohortStorage module
jest.mock('@/lib/utils/cohortStorage', () => ({
  getCohorts: jest.fn(),
  deleteCohort: jest.fn(),
  duplicateCohort: jest.fn(),
  exportCohortToJSON: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    log: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock child components
jest.mock('../CohortCard', () => {
  return function MockCohortCard({
    cohort,
    onView,
    onDuplicate,
    onDelete,
    onExport,
  }: {
    cohort: Cohort;
    onView: (cohort: Cohort) => void;
    onDuplicate: (cohort: Cohort) => void;
    onDelete: (cohortId: string) => void;
    onExport: (cohort: Cohort) => void;
  }) {
    return (
      <div data-testid={`cohort-card-${cohort.id}`}>
        <div>Cohort: {cohort.name}</div>
        <button onClick={() => onView(cohort)}>View</button>
        <button onClick={() => onDuplicate(cohort)}>Duplicate</button>
        <button onClick={() => onDelete(cohort.id)}>Delete</button>
        <button onClick={() => onExport(cohort)}>Export</button>
      </div>
    );
  };
});

jest.mock('../EmptyState', () => {
  return function MockEmptyState() {
    return <div data-testid="empty-state">No cohorts yet</div>;
  };
});

jest.mock('../ConfirmDeleteDialog', () => {
  return function MockConfirmDeleteDialog({
    isOpen,
    cohortName,
    onConfirm,
    onCancel,
    loading,
  }: {
    isOpen: boolean;
    cohortName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
  }) {
    if (!isOpen) {
      return null;
    }
    return (
      <div data-testid="delete-dialog">
        <div>Delete {cohortName}?</div>
        <button onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Confirm'}
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

// Test wrapper with Chakra Provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

// Mock cohort data
const mockCohorts: Cohort[] = [
  {
    id: '1',
    name: 'Test Cohort 1',
    description: 'Description 1',
    filters: {
      visit: {},
      person_demographics: {},
      provider_demographics: {},
      clinical: {},
    },
    visitCount: 100,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Test Cohort 2',
    description: 'Description 2',
    filters: {
      visit: {},
      person_demographics: {},
      provider_demographics: {},
      clinical: {},
    },
    visitCount: 50,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

describe('CohortTab', () => {
  const mockGetCohorts = cohortStorage.getCohorts as jest.Mock;
  const mockDeleteCohort = cohortStorage.deleteCohort as jest.Mock;
  const mockDuplicateCohort = cohortStorage.duplicateCohort as jest.Mock;
  const mockExportCohortToJSON = cohortStorage.exportCohortToJSON as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCohorts.mockResolvedValue(mockCohorts);
  });

  describe('Initial Loading', () => {
    it('should show loading state on mount', () => {
      mockGetCohorts.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCohorts), 100))
      );

      render(<CohortTab />, { wrapper: TestWrapper });

      expect(screen.getByText('Loading cohorts...')).toBeInTheDocument();
    });

    it('should call getCohorts on mount', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      expect(mockGetCohorts).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.queryByText('Loading cohorts...')).not.toBeInTheDocument();
      });
    });

    it('should display cohorts after successful load', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('cohort-card-2')).toBeInTheDocument();
      });

      expect(screen.getByText('Cohort: Test Cohort 1')).toBeInTheDocument();
      expect(screen.getByText('Cohort: Test Cohort 2')).toBeInTheDocument();
    });

    it('should display empty state when no cohorts', async () => {
      mockGetCohorts.mockResolvedValue([]);

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });

      expect(screen.getByText('No cohorts yet')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      mockGetCohorts.mockResolvedValue([]);

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.queryByText('Loading cohorts...')).not.toBeInTheDocument();
      });

      // Should not crash and should show empty state
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  describe('Header Section', () => {
    it('should display cohort count in header', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (2)')).toBeInTheDocument();
      });
    });

    it('should show "Saved Cohorts (0)" when empty', async () => {
      mockGetCohorts.mockResolvedValue([]);

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (0)')).toBeInTheDocument();
      });
    });

    it('should show correct count with multiple cohorts', async () => {
      const manyCohorts = Array.from({ length: 5 }, (_, i) => ({
        ...mockCohorts[0],
        id: `${i + 1}`,
        name: `Cohort ${i + 1}`,
      }));
      mockGetCohorts.mockResolvedValue(manyCohorts);

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (5)')).toBeInTheDocument();
      });
    });

    it('should render refresh button', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should render disabled create button', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create new cohort/i });
        expect(createButton).toBeInTheDocument();
        expect(createButton).toBeDisabled();
      });
    });

    it('should display description text', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(
          screen.getByText('Manage your research cohorts and export data')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should reload cohorts when refresh button clicked', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Clear the initial call
      mockGetCohorts.mockClear();

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      expect(mockGetCohorts).toHaveBeenCalledTimes(1);
    });

    it('should show updated cohort list after refresh', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Mock updated cohorts list
      const updatedCohorts = [
        ...mockCohorts,
        {
          id: '3',
          name: 'New Cohort',
          description: 'New description',
          filters: {
            visit: {},
            person_demographics: {},
            provider_demographics: {},
            clinical: {},
          },
          visitCount: 75,
          createdAt: '2024-01-17T10:00:00Z',
          updatedAt: '2024-01-17T10:00:00Z',
        },
      ];
      mockGetCohorts.mockResolvedValue(updatedCohorts);

      // Click refresh
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Cohort: New Cohort')).toBeInTheDocument();
        expect(screen.getByText('Saved Cohorts (3)')).toBeInTheDocument();
      });
    });

    it('should update count after refresh', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (2)')).toBeInTheDocument();
      });

      // Mock empty cohorts after refresh
      mockGetCohorts.mockResolvedValue([]);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (0)')).toBeInTheDocument();
      });
    });

    it('should handle refresh errors gracefully', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Mock error on refresh - getCohorts returns empty array on error
      mockGetCohorts.mockResolvedValue([]);

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        // Should show empty state without crashing
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Cohort Operations', () => {
    it('should render CohortCard for each cohort', async () => {
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('cohort-card-2')).toBeInTheDocument();
      });
    });

    it('should call handleViewCohort when view is clicked', async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
      });

      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      const cohortCard = screen.getByTestId('cohort-card-1');
      const viewButton = within(cohortCard).getByText('View');

      await user.click(viewButton);

      // Verify router.push was called with the correct cohort URL
      expect(mockPush).toHaveBeenCalledWith('/cohorts/1');
    });

    it('should call handleDuplicateCohort and update list', async () => {
      const user = userEvent.setup();
      const duplicatedCohort: Cohort = {
        id: '3',
        name: 'Copy of Test Cohort 1',
        description: 'Description 1',
        filters: {
          visit: {},
          person_demographics: {},
          provider_demographics: {},
          clinical: {},
        },
        visitCount: 100,
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z',
      };

      mockDuplicateCohort.mockResolvedValue(duplicatedCohort);

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      const cohortCard = screen.getByTestId('cohort-card-1');
      const duplicateButton = within(cohortCard).getByText('Duplicate');

      await user.click(duplicateButton);

      await waitFor(() => {
        expect(mockDuplicateCohort).toHaveBeenCalledWith('1');
      });

      await waitFor(() => {
        expect(screen.getByText('Cohort: Copy of Test Cohort 1')).toBeInTheDocument();
      });
    });

    it('should call handleExportCohort when export is clicked', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      const cohortCard = screen.getByTestId('cohort-card-1');
      const exportButton = within(cohortCard).getByText('Export');

      await user.click(exportButton);

      await waitFor(() => {
        expect(mockExportCohortToJSON).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            name: 'Test Cohort 1',
          })
        );
      });
    });
  });

  describe('Delete Flow', () => {
    it('should show confirmation dialog when delete clicked', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      const cohortCard = screen.getByTestId('cohort-card-1');
      const deleteButton = within(cohortCard).getByText('Delete');

      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Test Cohort 1?')).toBeInTheDocument();
      });
    });

    it('should delete cohort and update list on confirm', async () => {
      const user = userEvent.setup();
      mockDeleteCohort.mockResolvedValue(undefined);

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Click delete
      const deleteButton = within(screen.getByTestId('cohort-card-1')).getByText('Delete');
      await user.click(deleteButton);

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteCohort).toHaveBeenCalledWith('1');
      });

      // Cohort should be removed from list
      await waitFor(() => {
        expect(screen.queryByTestId('cohort-card-1')).not.toBeInTheDocument();
      });

      // Count should update
      expect(screen.getByText('Saved Cohorts (1)')).toBeInTheDocument();
    });

    it('should close dialog on cancel', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Click delete
      const deleteButton = within(screen.getByTestId('cohort-card-1')).getByText('Delete');
      await user.click(deleteButton);

      // Wait for dialog
      await waitFor(() => {
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
      });

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByTestId('delete-dialog')).not.toBeInTheDocument();
      });

      // Cohort should still be in list
      expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
    });

    it('should handle delete errors', async () => {
      const user = userEvent.setup();
      mockDeleteCohort.mockRejectedValue(new Error('Delete failed'));

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Click delete
      const deleteButton = within(screen.getByTestId('cohort-card-1')).getByText('Delete');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
      });

      // Confirm delete
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteCohort).toHaveBeenCalledWith('1');
      });

      // Should show error alert
      await waitFor(() => {
        expect(screen.getByText('Failed to delete cohort')).toBeInTheDocument();
      });

      // Cohort should still be in list
      expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error alert when duplicate fails', async () => {
      const user = userEvent.setup();
      mockDuplicateCohort.mockRejectedValue(new Error('Duplicate failed'));

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      const duplicateButton = within(screen.getByTestId('cohort-card-1')).getByText('Duplicate');
      await user.click(duplicateButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to duplicate cohort')).toBeInTheDocument();
      });
    });

    it('should display error alert when export fails', async () => {
      const user = userEvent.setup();
      mockExportCohortToJSON.mockImplementation(() => {
        throw new Error('Export failed');
      });

      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      const exportButton = within(screen.getByTestId('cohort-card-1')).getByText('Export');
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to export cohort')).toBeInTheDocument();
      });
    });
  });

  describe('Remounting Behavior', () => {
    it('should call getCohorts again when remounted with new key', async () => {
      const { unmount } = render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockGetCohorts).toHaveBeenCalledTimes(1);
      });

      unmount();

      // Remount with different key (simulating tab switch)
      render(<CohortTab key="new-key" />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(mockGetCohorts).toHaveBeenCalledTimes(2);
      });
    });

    it('should reset state on remount', async () => {
      const { unmount } = render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (2)')).toBeInTheDocument();
      });

      unmount();

      // Remount with different data
      mockGetCohorts.mockResolvedValue([mockCohorts[0]]);
      render(<CohortTab key="new-key" />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByText('Saved Cohorts (1)')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Navigation Tests
  // ============================================================================

  describe('Navigation', () => {
    let mockPush: jest.Mock;

    beforeEach(() => {
      mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
      });
    });

    it('should navigate to cohort view page when View button is clicked', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      // Wait for cohorts to load
      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
      });

      // Click View button on first cohort
      const viewButton = screen.getAllByText('View')[0];
      await user.click(viewButton);

      // Verify router.push was called with correct URL
      expect(mockPush).toHaveBeenCalledWith('/cohorts/1');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('should call router.push with correct cohort ID', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-2')).toBeInTheDocument();
      });

      // Click View button on second cohort
      const viewButtons = screen.getAllByText('View');
      await user.click(viewButtons[1]);

      // Verify router.push was called with second cohort's ID
      expect(mockPush).toHaveBeenCalledWith('/cohorts/2');
      expect(mockPush).toHaveBeenCalledTimes(1);
    });

    it('should navigate to correct page for each cohort independently', async () => {
      const user = userEvent.setup();
      render(<CohortTab />, { wrapper: TestWrapper });

      await waitFor(() => {
        expect(screen.getByTestId('cohort-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('cohort-card-2')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByText('View');

      // Click first cohort's View button
      await user.click(viewButtons[0]);
      expect(mockPush).toHaveBeenCalledWith('/cohorts/1');

      // Clear mock to verify second call
      mockPush.mockClear();

      // Click second cohort's View button
      await user.click(viewButtons[1]);
      expect(mockPush).toHaveBeenCalledWith('/cohorts/2');
    });
  });
});
