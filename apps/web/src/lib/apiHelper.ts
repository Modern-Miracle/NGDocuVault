import { ApiError } from '@/lib/error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Fetch wrapper with error handling
 */
export async function fetchWithErrorHandling<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    // Ensure headers are properly formatted
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle empty responses
    const text = await response.text();

    let data: ApiResponse<T>;

    try {
      data = text ? JSON.parse(text) : { success: false, message: 'Empty response' };
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new ApiError(`Failed to parse response: ${text.substring(0, 100)}`, response.status);
    }

    if (!response.ok) {
      throw new ApiError(data.message || 'An error occurred', response.status);
    }

    // If the response doesn't have the expected format, wrap it in our standard format
    if (data.success === undefined) {
      return {
        success: true,
        data: data as unknown as T,
        message: 'Success',
      };
    }

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('Fetch error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}
