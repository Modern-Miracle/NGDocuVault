/**
 * Client-side API helper utilities for React app
 */

import { getAuthHeaders } from './index';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Response wrapper type
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Fetch with error handling and authentication
 */
export async function fetchWithErrorHandling<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    // Merge auth headers with provided headers
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    let data: unknown;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (data as { message?: string; error?: string })?.message ||
        (data as { message?: string; error?: string })?.error ||
        data ||
        'Request failed';
      throw new ApiError(String(errorMessage), response.status);
    }

    // Handle different response formats
    if (typeof data === 'object' && data !== null) {
      // If the response already has success/data structure, return as is
      if ('success' in data) {
        return data as ApiResponse<T>;
      }
      // Otherwise wrap in standard format
      return {
        success: true,
        data: data as T,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error) {
    console.error('API request failed:', error);

    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Helper for GET requests
 */
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  return fetchWithErrorHandling<T>(url, {
    method: 'GET',
  });
}

/**
 * Helper for POST requests
 */
export async function apiPost<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return fetchWithErrorHandling<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PUT requests
 */
export async function apiPut<T>(url: string, body?: unknown): Promise<ApiResponse<T>> {
  return fetchWithErrorHandling<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return fetchWithErrorHandling<T>(url, {
    method: 'DELETE',
  });
}
