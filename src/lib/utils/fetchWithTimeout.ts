/**
 * Fetch with timeout enforcement
 *
 * Wraps the native fetch API to add timeout support using AbortController.
 * Prevents indefinite hangs on slow or unreachable networks.
 *
 * @param url - URL to fetch
 * @param options - Fetch options (RequestInit)
 * @param timeout - Timeout in milliseconds (default: 10000ms / 10 seconds)
 * @returns Response promise
 * @throws Error if request times out or network fails
 *
 * @example
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/data',
 *   { method: 'GET' },
 *   5000 // 5 second timeout
 * );
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // Provide user-friendly error message for timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }

    // Re-throw other errors as-is
    throw error;
  }
};
