'use server';

/**
 * Server actions for user-related operations
 * These functions run on the server side with direct access to backend services
 */

import { cookies } from 'next/headers';

// Server-side API base URL from environment variable
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Make a server-side API request
 */
async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number; ok: boolean }> {
  try {
    // Get URL - trim leading slash to avoid double slashes
    const trimmedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${API_BASE_URL}${API_BASE_URL.endsWith('/') ? '' : '/'}${trimmedEndpoint}`;

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Forward cookies for authentication
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const cookieString = allCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');

    if (cookieString) {
      headers['Cookie' as keyof typeof headers] = cookieString;
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse response based on content type
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType && contentType.includes('text/')) {
      data = (await response.text()) as unknown as T;
    }

    return {
      data,
      error: null,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    console.error('Server fetch error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
      ok: false,
    };
  }
}

/**
 * Fetch user profile data
 */
export async function fetchUserProfile<T>(): Promise<T | null> {
  const result = await serverFetch<T>('/user/profile', { method: 'GET' });
  return result.data;
}

/**
 * Fetch user preferences
 */
export async function fetchUserPreferences<T>(): Promise<T | null> {
  const result = await serverFetch<T>('/user/preferences', { method: 'GET' });
  return result.data;
}

/**
 * Update user preferences
 */
export async function updateUserPreferences<T>(preferences: Record<string, any>): Promise<T | null> {
  const result = await serverFetch<T>('/user/preferences', {
    method: 'POST',
    body: JSON.stringify(preferences),
  });
  return result.data;
}

/**
 * Check feature flags
 */
export async function getFeatureFlags<T>(): Promise<T | null> {
  const result = await serverFetch<T>('/feature-flags', { method: 'GET' });
  return result.data;
}

/**
 * Submit feedback
 */
export async function submitFeedback<T>(feedback: {
  type: string;
  message: string;
  screenshot?: string;
}): Promise<T | null> {
  const result = await serverFetch<T>('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedback),
  });
  return result.data;
}

/**
 * Get wallet activity
 */
export async function getWalletActivity<T>(address: string, page: number = 1, limit: number = 10): Promise<T | null> {
  const result = await serverFetch<T>(`/wallet/${address}/activity?page=${page}&limit=${limit}`, { method: 'GET' });
  return result.data;
}
