/**
 * useDebounce Hook Tests
 * Tests for debouncing functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));

      expect(result.current).toBe('initial');
    });

    it('should return the same value when value does not change', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'test', delay: 300 },
      });

      expect(result.current).toBe('test');

      rerender({ value: 'test', delay: 300 });
      jest.advanceTimersByTime(300);

      expect(result.current).toBe('test');
    });

    it('should work with different data types', () => {
      // String
      const { result: stringResult } = renderHook(() => useDebounce('hello', 300));
      expect(stringResult.current).toBe('hello');

      // Number
      const { result: numberResult } = renderHook(() => useDebounce(42, 300));
      expect(numberResult.current).toBe(42);

      // Boolean
      const { result: boolResult } = renderHook(() => useDebounce(true, 300));
      expect(boolResult.current).toBe(true);

      // Object
      const { result: objectResult } = renderHook(() => useDebounce({ name: 'test' }, 300));
      expect(objectResult.current).toEqual({ name: 'test' });

      // Array
      const { result: arrayResult } = renderHook(() => useDebounce([1, 2, 3], 300));
      expect(arrayResult.current).toEqual([1, 2, 3]);
    });
  });

  describe('Debouncing Behavior', () => {
    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 300 },
      });

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'updated', delay: 300 });

      // Value should not update immediately
      expect(result.current).toBe('initial');

      // Fast forward time by 299ms (just before delay)
      act(() => {
        jest.advanceTimersByTime(299);
      });
      expect(result.current).toBe('initial');

      // Fast forward remaining 1ms to complete delay
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('should reset timer on rapid changes', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'v1', delay: 300 },
      });

      expect(result.current).toBe('v1');

      // Rapid changes
      rerender({ value: 'v2', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe('v1');

      rerender({ value: 'v3', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe('v1');

      rerender({ value: 'v4', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      expect(result.current).toBe('v1');

      // After final delay, should have the last value
      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('v4');
    });

    it('should handle multiple sequential changes correctly', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'first', delay: 300 },
      });

      expect(result.current).toBe('first');

      // First change
      rerender({ value: 'second', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('second');

      // Second change
      rerender({ value: 'third', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('third');

      // Third change
      rerender({ value: 'fourth', delay: 300 });
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('fourth');
    });
  });

  describe('Custom Delay', () => {
    it('should use default delay of 300ms when not specified', () => {
      const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
        initialProps: { value: 'initial' },
      });

      rerender({ value: 'updated' });

      act(() => {
        jest.advanceTimersByTime(299);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('should respect custom delay value', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 500 },
      });

      rerender({ value: 'updated', delay: 500 });

      act(() => {
        jest.advanceTimersByTime(499);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('should handle delay of 0ms', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 0 },
      });

      rerender({ value: 'updated', delay: 0 });

      act(() => {
        jest.advanceTimersByTime(0);
      });
      expect(result.current).toBe('updated');
    });

    it('should handle very long delays', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 5000 },
      });

      rerender({ value: 'updated', delay: 5000 });

      act(() => {
        jest.advanceTimersByTime(4999);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current).toBe('updated');
    });

    it('should handle changing delay value', () => {
      const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 300 },
      });

      rerender({ value: 'updated', delay: 500 });

      // Should use new delay (500ms)
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('initial');

      act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(result.current).toBe('updated');
    });
  });

  describe('Cleanup and Unmount', () => {
    it('should cleanup timeout on unmount', () => {
      const { rerender, unmount } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 300 },
      });

      rerender({ value: 'updated', delay: 300 });

      // Unmount before delay completes
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // No assertion needed - test passes if no errors thrown
    });

    it('should cancel pending update on rapid unmount', () => {
      const { rerender, unmount } = renderHook(({ value, delay }) => useDebounce(value, delay), {
        initialProps: { value: 'initial', delay: 300 },
      });

      // Queue multiple changes
      rerender({ value: 'v2', delay: 300 });
      rerender({ value: 'v3', delay: 300 });
      rerender({ value: 'v4', delay: 300 });

      // Unmount immediately
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No assertion needed - test passes if no errors thrown
    });
  });

  describe('Real-World Use Cases', () => {
    it('should work for search input scenario', () => {
      const { result, rerender } = renderHook(({ searchTerm }) => useDebounce(searchTerm, 300), {
        initialProps: { searchTerm: '' },
      });

      expect(result.current).toBe('');

      // User types quickly: "test"
      rerender({ searchTerm: 't' });
      act(() => {
        jest.advanceTimersByTime(50);
      });
      rerender({ searchTerm: 'te' });
      act(() => {
        jest.advanceTimersByTime(50);
      });
      rerender({ searchTerm: 'tes' });
      act(() => {
        jest.advanceTimersByTime(50);
      });
      rerender({ searchTerm: 'test' });

      // Still showing initial value during typing
      expect(result.current).toBe('');

      // After user stops typing (300ms delay)
      act(() => {
        jest.advanceTimersByTime(300);
      });
      expect(result.current).toBe('test');
    });

    it('should work for form validation scenario', () => {
      const { result, rerender } = renderHook(({ email }) => useDebounce(email, 500), {
        initialProps: { email: '' },
      });

      // User types email quickly
      rerender({ email: 'user@' });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      rerender({ email: 'user@example' });
      act(() => {
        jest.advanceTimersByTime(100);
      });
      rerender({ email: 'user@example.com' });

      // Email is not validated yet
      expect(result.current).toBe('');

      // After 500ms, validation can run
      act(() => {
        jest.advanceTimersByTime(500);
      });
      expect(result.current).toBe('user@example.com');
    });

    it('should work for window resize scenario', () => {
      const { result, rerender } = renderHook(({ width }) => useDebounce(width, 150), {
        initialProps: { width: 1920 },
      });

      // Simulate rapid resize events
      rerender({ width: 1900 });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      rerender({ width: 1850 });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      rerender({ width: 1800 });
      act(() => {
        jest.advanceTimersByTime(10);
      });
      rerender({ width: 1750 });

      // Should not update during resize
      expect(result.current).toBe(1920);

      // After resize stops (150ms)
      act(() => {
        jest.advanceTimersByTime(150);
      });
      expect(result.current).toBe(1750);
    });
  });
});
