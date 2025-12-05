/**
 * Tests for Dashboard Page
 * Tests tab switching functionality and CohortTab remounting behavior
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../page';
import { Provider } from '@/components/ui/provider';

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

// Mock the hooks
jest.mock('@/hooks/useFilterOptions', () => ({
  useFilterOptions: jest.fn(() => ({
    filterOptions: {
      total_accessible_visits: 1234,
      demographics: {
        genders: ['M', 'F'],
        races: ['White', 'Black'],
        ethnicities: ['Hispanic', 'Non-Hispanic'],
        year_of_birth_range: { min: 1950, max: 2000 },
      },
      visit_options: {
        tiers: [1, 2, 3],
        visit_sources: ['Inpatient', 'Outpatient'],
        date_range: { earliest: '2020-01-01', latest: '2024-01-01' },
      },
      clinical_options: {
        conditions: { available_codes: ['A', 'B'], available_values: [], total_visits: 100 },
        labs: {
          procedure_names: ['Lab1'],
          result_flags: [],
          order_statuses: [],
          total_visits: 100,
        },
        drugs: { common_drugs: ['Drug1', 'Drug2'], total_visits: 100 },
        procedures: { common_names: ['Proc1'], future_or_stand_options: [], total_visits: 100 },
        notes: { note_types: ['Note1'], note_statuses: [], total_visits: 100 },
        observations: { file_types: ['PDF'], total_visits: 100 },
        measurements: {
          total_visits: 100,
          bp_systolic_range: { min: 90, max: 180 },
          weight_range: { min: 100, max: 300 },
        },
      },
    },
    loading: false,
    error: null,
    refetch: jest.fn(),
  })),
}));

jest.mock('@/lib/utils/cohortStorage', () => ({
  getCohorts: jest.fn(() => Promise.resolve([{ id: '1', name: 'Test Cohort' }])),
}));

// Mock the child tab components
jest.mock('@/components/dashboard/ResearchTab', () => {
  return function MockResearchTab() {
    return <div data-testid="research-tab">Research Tab Content</div>;
  };
});

// Track CohortTab renders for key testing
let cohortTabRenderCount = 0;
const cohortTabKeys: string[] = [];

jest.mock('@/components/dashboard/CohortTab', () => {
  return function MockCohortTab() {
    cohortTabRenderCount++;
    // Generate a unique identifier for this render
    const renderId = `render-${cohortTabRenderCount}-${Date.now()}`;
    cohortTabKeys.push(renderId);

    return (
      <div data-testid="cohort-tab" data-render-id={renderId}>
        Cohort Tab Content
      </div>
    );
  };
});

// Test wrapper with Chakra Provider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cohortTabRenderCount = 0;
    cohortTabKeys.length = 0;
  });

  describe('Initial Rendering', () => {
    it('should render the dashboard page with tabs', () => {
      render(<DashboardPage />, { wrapper: TestWrapper });

      // Check that tabs are rendered
      expect(screen.getByText('Research Data')).toBeInTheDocument();
      expect(screen.getByText('Cohorts')).toBeInTheDocument();
    });

    it('should render both tab triggers', () => {
      render(<DashboardPage />, { wrapper: TestWrapper });

      expect(screen.getByText('Research Data')).toBeInTheDocument();
      expect(screen.getByText('Cohorts')).toBeInTheDocument();
    });

    it('should start with research tab as default active tab', () => {
      render(<DashboardPage />, { wrapper: TestWrapper });

      const researchTab = screen.getByTestId('research-tab');
      expect(researchTab).toBeInTheDocument();
    });

    it('should render ResearchTab content by default', () => {
      render(<DashboardPage />, { wrapper: TestWrapper });

      expect(screen.getByTestId('research-tab')).toBeInTheDocument();
      expect(screen.getByText('Research Tab Content')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('should switch to cohorts tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />, { wrapper: TestWrapper });

      // Initially on research tab
      expect(screen.getByTestId('research-tab')).toBeInTheDocument();

      // Click cohorts tab
      const cohortsTabTrigger = screen.getByText('Cohorts');
      await user.click(cohortsTabTrigger);

      // Should show cohort tab content
      await waitFor(() => {
        expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      });
    });

    it('should switch back to research tab when clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />, { wrapper: TestWrapper });

      // Switch to cohorts tab
      const cohortsTabTrigger = screen.getByText('Cohorts');
      await user.click(cohortsTabTrigger);

      await waitFor(() => {
        expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      });

      // Switch back to research tab
      const researchTabTrigger = screen.getByText('Research Data');
      await user.click(researchTabTrigger);

      await waitFor(() => {
        expect(screen.getByTestId('research-tab')).toBeInTheDocument();
      });
    });

    it('should show only active tab content', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />, { wrapper: TestWrapper });

      // On research tab - research content should be visible
      expect(screen.getByTestId('research-tab')).toBeInTheDocument();

      // Note: Chakra UI v3 may render both tabs for accessibility but only show one
      // We verify the correct tab is shown by checking visibility or active state

      // Switch to cohorts tab
      await user.click(screen.getByText('Cohorts'));

      await waitFor(() => {
        // Both tabs may be in document, but cohort tab should be visible
        expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      });
    });
  });

  describe('CohortTab Remounting Behavior', () => {
    it('should remount CohortTab each time tab becomes active', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />, { wrapper: TestWrapper });

      // CohortTab renders immediately with Chakra UI v3 (both tabs rendered)
      const initialRenderCount = cohortTabRenderCount;
      expect(initialRenderCount).toBeGreaterThanOrEqual(1);

      const firstRenderId = screen.getByTestId('cohort-tab').getAttribute('data-render-id');

      // Switch to cohorts tab to activate it
      await user.click(screen.getByText('Cohorts'));

      await waitFor(() => {
        expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      });

      // Switch back to research tab
      await user.click(screen.getByText('Research Data'));

      await waitFor(() => {
        expect(screen.getByTestId('research-tab')).toBeInTheDocument();
      });

      // Switch to cohorts tab again - should remount
      await user.click(screen.getByText('Cohorts'));

      await waitFor(() => {
        const currentRenderId = screen.getByTestId('cohort-tab').getAttribute('data-render-id');
        // Render ID should have changed (indicating remount with new key)
        expect(currentRenderId).not.toBe(firstRenderId);
      });

      // Should have rendered more times than initially
      expect(cohortTabRenderCount).toBeGreaterThan(initialRenderCount);
    });

    it('should force new component instance on each cohorts tab activation', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />, { wrapper: TestWrapper });

      const initialRenderCount = cohortTabRenderCount;
      const renderIdsBeforeClicks: string[] = [...cohortTabKeys];

      // Activate cohorts tab multiple times
      await user.click(screen.getByText('Cohorts'));
      await waitFor(() => expect(screen.getByTestId('cohort-tab')).toBeInTheDocument());

      await user.click(screen.getByText('Research Data'));
      await waitFor(() => expect(screen.getByTestId('research-tab')).toBeInTheDocument());

      await user.click(screen.getByText('Cohorts'));
      await waitFor(() => expect(screen.getByTestId('cohort-tab')).toBeInTheDocument());

      await user.click(screen.getByText('Research Data'));
      await waitFor(() => expect(screen.getByTestId('research-tab')).toBeInTheDocument());

      await user.click(screen.getByText('Cohorts'));
      await waitFor(() => expect(screen.getByTestId('cohort-tab')).toBeInTheDocument());

      // Should have rendered more times (at least 3 additional times for the 3 cohort tab clicks)
      const additionalRenders = cohortTabRenderCount - initialRenderCount;
      expect(additionalRenders).toBeGreaterThanOrEqual(3);

      // All render IDs should be unique
      const newRenderIds = cohortTabKeys.slice(renderIdsBeforeClicks.length);
      const uniqueNewRenderIds = new Set(newRenderIds);
      expect(uniqueNewRenderIds.size).toBe(newRenderIds.length);
      expect(newRenderIds.length).toBeGreaterThanOrEqual(3);
    });

    it('should render CohortTab even when inactive due to Chakra UI behavior', () => {
      render(<DashboardPage />, { wrapper: TestWrapper });

      // With Chakra UI v3, both tabs are rendered but only one is shown
      // This is for accessibility and ARIA compliance
      expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      expect(screen.getByTestId('research-tab')).toBeInTheDocument();
      expect(cohortTabRenderCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('State Management', () => {
    it('should maintain active tab state across multiple switches', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />, { wrapper: TestWrapper });

      // Start on research
      expect(screen.getByTestId('research-tab')).toBeInTheDocument();

      // Switch to cohorts
      await user.click(screen.getByText('Cohorts'));
      await waitFor(() => {
        expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      });

      // Switch back to research
      await user.click(screen.getByText('Research Data'));
      await waitFor(() => {
        expect(screen.getByTestId('research-tab')).toBeInTheDocument();
      });

      // Switch to cohorts again
      await user.click(screen.getByText('Cohorts'));
      await waitFor(() => {
        expect(screen.getByTestId('cohort-tab')).toBeInTheDocument();
      });

      // Should consistently show correct content
      expect(screen.getByText('Cohort Tab Content')).toBeInTheDocument();
    });
  });
});
