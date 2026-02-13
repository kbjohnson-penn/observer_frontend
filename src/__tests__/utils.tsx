/**
 * Test Utilities
 * Common setup and helpers for testing components
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';

/**
 * Test wrapper component that provides all necessary context providers
 */
export const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

/**
 * Custom render function that includes all providers
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

/**
 * Mock window.matchMedia for responsive tests
 */
export const setupMatchMedia = () => {
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
};

/**
 * Mock ResizeObserver for components that use it
 */
export const setupResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

/**
 * Mock IntersectionObserver for components that use it
 */
export const setupIntersectionObserver = () => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

/**
 * Setup all common browser mocks
 */
export const setupBrowserMocks = () => {
  setupMatchMedia();
  setupResizeObserver();
  setupIntersectionObserver();
};

/**
 * Wait for a specific amount of time
 */
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
