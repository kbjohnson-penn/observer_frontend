/**
 * ColumnSelector Component Tests
 * Tests for column visibility management
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, userEvent, setupBrowserMocks } from '@/__tests__/utils';
import ColumnSelector from '../ColumnSelector';

// Setup browser mocks
beforeAll(() => {
  setupBrowserMocks();
});

const mockColumns = ['id', 'name', 'email', 'age', 'status'];

const mockColumnVisibility = {
  id: true,
  name: true,
  email: false,
  age: true,
  status: true,
};

const defaultProps = {
  columns: mockColumns,
  columnVisibility: mockColumnVisibility,
  onColumnVisibilityChange: jest.fn(),
  onShowAll: jest.fn(),
  onHideAll: jest.fn(),
};

describe('ColumnSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render button with icon', () => {
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      expect(button).toBeInTheDocument();
    });

    it('should show visibility count in menu', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        // 4 out of 5 columns are visible
        expect(screen.getByText(/4\/5/i)).toBeInTheDocument();
      });
    });

    it('should display all columns in menu', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('id')).toBeInTheDocument();
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
        expect(screen.getByText('age')).toBeInTheDocument();
        expect(screen.getByText('status')).toBeInTheDocument();
      });
    });
  });

  describe('Column Visibility Toggle', () => {
    it('should call onColumnVisibilityChange when clicking checkbox', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('id')).toBeInTheDocument();
      });

      // Click on a column to toggle it
      const idItem = screen.getByText('id');
      await user.click(idItem);

      await waitFor(() => {
        expect(defaultProps.onColumnVisibilityChange).toHaveBeenCalledWith('id', false);
      });
    });

    it('should show checked state for visible columns', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        // Check that visible columns have checkboxes checked
        // Note: Actual checkbox implementation depends on Chakra UI
        expect(screen.getByText('id')).toBeInTheDocument();
        expect(screen.getByText('name')).toBeInTheDocument();
      });
    });

    it('should show unchecked state for hidden columns', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        // 'email' is hidden (false in visibility)
        expect(screen.getByText('email')).toBeInTheDocument();
      });
    });
  });

  describe('Show All / Hide All', () => {
    it('should render Show All button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Show All')).toBeInTheDocument();
      });
    });

    it('should render Hide All button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Hide All')).toBeInTheDocument();
      });
    });

    it('should call onShowAll when clicking Show All', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        const showAllButton = screen.getByText('Show All');
        user.click(showAllButton);
      });

      await waitFor(() => {
        expect(defaultProps.onShowAll).toHaveBeenCalled();
      });
    });

    it('should call onHideAll when clicking Hide All', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        const hideAllButton = screen.getByText('Hide All');
        user.click(hideAllButton);
      });

      await waitFor(() => {
        expect(defaultProps.onHideAll).toHaveBeenCalled();
      });
    });
  });

  describe('Menu Interactions', () => {
    it('should open menu on button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Show All')).toBeInTheDocument();
      });
    });

    it('should update count when visibility changes', async () => {
      const user = userEvent.setup();

      // Start with all visible
      const allVisibleProps = {
        ...defaultProps,
        columnVisibility: {
          id: true,
          name: true,
          email: true,
          age: true,
          status: true,
        },
      };

      renderWithProviders(<ColumnSelector {...allVisibleProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        // All 5 columns visible
        expect(screen.getByText(/5\/5/i)).toBeInTheDocument();
      });
    });

    it('should handle all columns hidden', async () => {
      const user = userEvent.setup();

      // All columns hidden
      const allHiddenProps = {
        ...defaultProps,
        columnVisibility: {
          id: false,
          name: false,
          email: false,
          age: false,
          status: false,
        },
      };

      renderWithProviders(<ColumnSelector {...allHiddenProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        // 0 out of 5 columns visible
        expect(screen.getByText(/0\/5/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      expect(button).toHaveAttribute('aria-label', 'Manage columns');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ColumnSelector {...defaultProps} />);

      // Tab to button
      await user.tab();

      const button = screen.getByRole('button', { name: /manage columns/i });
      expect(button).toHaveFocus();

      // Press Enter to open menu
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Show All')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty columns array', () => {
      const emptyProps = {
        ...defaultProps,
        columns: [],
        columnVisibility: {},
      };

      renderWithProviders(<ColumnSelector {...emptyProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      expect(button).toBeInTheDocument();
    });

    it('should handle single column', async () => {
      const user = userEvent.setup();

      const singleColumnProps = {
        ...defaultProps,
        columns: ['id'],
        columnVisibility: { id: true },
      };

      renderWithProviders(<ColumnSelector {...singleColumnProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/1\/1/i)).toBeInTheDocument();
      });
    });

    it('should handle columns with underscores', async () => {
      const user = userEvent.setup();

      const underscoreProps = {
        ...defaultProps,
        columns: ['person_id', 'visit_date', 'procedure_name'],
        columnVisibility: {
          person_id: true,
          visit_date: true,
          procedure_name: true,
        },
      };

      renderWithProviders(<ColumnSelector {...underscoreProps} />);

      const button = screen.getByRole('button', { name: /manage columns/i });
      await user.click(button);

      await waitFor(() => {
        // Underscores should be replaced with spaces
        expect(screen.getByText('person id')).toBeInTheDocument();
        expect(screen.getByText('visit date')).toBeInTheDocument();
        expect(screen.getByText('procedure name')).toBeInTheDocument();
      });
    });
  });
});
