'use server';

/**
 * Server actions for wallet authentication
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
    // Get URL
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    console.log('url', url);

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Forward cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

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

    // Set cookies from response
    const setCookieHeader = response.headers.get('set-cookie');

    if (setCookieHeader) {
      // Handle received cookies in the server context
      // Note: In Next.js, cookies are automatically handled for server components/actions
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
 * Generate a nonce for SIWE authentication
 */
export async function generateSiweNonce(
  address: string,
  chainId: string = '31337'
): Promise<{ message: string; expiresAt: number }> {
  const result = await serverFetch<{ message: string; expiresAt: number }>(
    `/auth/siwe/nonce?address=${address}&chainId=${chainId}`,
    { method: 'GET' }
  );

  if (!result.ok || !result.data) {
    throw new Error(result.error || 'Failed to generate nonce');
  }

  return result.data;
}

/**
 * Verify a SIWE signature
 */
export async function verifySiweSignature(
  message: string,
  signature: string
): Promise<{
  success: boolean;
  error?: string;
  auth?: any;
  session?: any;
  address?: string;
}> {
  const result = await serverFetch<{
    auth: any;
    session: any;
    address: string;
    siwe: any;
  }>('/auth/siwe/verify', {
    method: 'POST',
    body: JSON.stringify({ message, signature }),
  });

  if (!result.ok || !result.data) {
    return {
      success: false,
      error: result.error || 'Signature verification failed',
    };
  }

  return {
    success: true,
    ...result.data,
  };
}

/**
 * Get current SIWE session status
 */
export async function getSiweSession(): Promise<{
  authenticated: boolean;
  user?: {
    address: string;
    did: string;
    role: string;
  };
}> {
  const result = await serverFetch<{
    authenticated: boolean;
    user?: {
      address: string;
      did: string;
      role: string;
    };
  }>('/auth/siwe/session', { method: 'GET' });

  if (!result.ok || !result.data) {
    return { authenticated: false };
  }

  return result.data;
}

/**
 * Logout from SIWE session
 */
export async function siweLogout(): Promise<boolean> {
  const result = await serverFetch<{ success: boolean }>('/auth/siwe/logout', { method: 'POST' });

  return result.ok && result.data?.success === true;
}

/**
 * Refresh authentication token
 * This fixes issues with legacy tokens and auth service
 */
export async function refreshAuthToken(): Promise<{
  success: boolean;
  error?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}> {
  try {
    const result = await serverFetch<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      success: boolean;
    }>('/auth/siwe/refresh', {
      method: 'POST',
    });

    if (!result.ok || !result.data) {
      return {
        success: false,
        error: result.error || 'Token refresh failed',
      };
    }

    // Calculate expiration time
    const expiresAt = Date.now() + (result.data.expiresIn || 900) * 1000;

    return {
      success: true,
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
      expiresAt,
    };
  } catch (error) {
    console.error('Error refreshing authentication token:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error refreshing token',
    };
  }
}
