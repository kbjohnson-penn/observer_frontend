/**
 * Export Service
 *
 * Handles server-side data exports with automatic audit logging.
 * All exports go through the backend API, ensuring HIPAA-compliant
 * audit logging for every export operation.
 *
 * Data is fetched server-side with tier-based access control,
 * ensuring users can only export data they have permission to access.
 */

import { AxiosError } from 'axios';
import { apiClient } from '@/lib/apiClient';

/**
 * Custom error class for export failures with user-friendly messages
 */
export class ExportError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

/**
 * Extract error message from axios error response
 * Handles both JSON and blob error responses
 */
async function extractErrorMessage(error: AxiosError): Promise<string> {
  if (error.response) {
    const { status, data } = error.response;

    // Handle rate limiting
    if (status === 429) {
      return 'Too many export requests. Please wait a moment and try again.';
    }

    // Handle authentication/authorization errors
    if (status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    if (status === 403) {
      return 'You do not have permission to export this data.';
    }

    // Try to extract error message from response data
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        const json = JSON.parse(text);
        return json.error || json.detail || 'Export failed';
      } catch {
        return 'Export failed. Please try again.';
      }
    }

    // Handle JSON response
    if (typeof data === 'object' && data !== null) {
      const errorData = data as { error?: string; detail?: string };
      return errorData.error || errorData.detail || 'Export failed';
    }
  }

  // Network error
  if (error.code === 'ECONNABORTED') {
    return 'Export timed out. The data may be too large.';
  }

  return 'Export failed. Please check your connection and try again.';
}

/**
 * Export a single table as CSV or ZIP (with docs)
 *
 * @param cohortId - ID of the cohort to export data for
 * @param tableId - Identifier for the table being exported
 * @param includeDocs - Whether to include documentation (creates ZIP)
 * @returns Blob containing the exported file
 * @throws ExportError with user-friendly message on failure
 */
export async function exportSingleTable(
  cohortId: number,
  tableId: string,
  includeDocs: boolean
): Promise<Blob> {
  try {
    const response = await apiClient.post(
      '/research/private/export/single_table/',
      {
        cohort_id: cohortId,
        table_id: tableId,
        include_docs: includeDocs,
      },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    const message = await extractErrorMessage(error as AxiosError);
    throw new ExportError(message, (error as AxiosError).response?.status);
  }
}

/**
 * Export all tables as a ZIP file
 *
 * @param cohortId - ID of the cohort to export data for
 * @param includeDocs - Whether to include documentation
 * @returns Blob containing the ZIP file
 * @throws ExportError with user-friendly message on failure
 */
export async function exportAllTables(cohortId: number, includeDocs: boolean): Promise<Blob> {
  try {
    const response = await apiClient.post(
      '/research/private/export/all_tables/',
      {
        cohort_id: cohortId,
        include_docs: includeDocs,
      },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    const message = await extractErrorMessage(error as AxiosError);
    throw new ExportError(message, (error as AxiosError).response?.status);
  }
}

/**
 * Trigger browser download of a Blob
 *
 * @param blob - The file content as a Blob
 * @param filename - Name for the downloaded file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
