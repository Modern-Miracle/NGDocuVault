import { DEFAULT_CONFIG } from '../config';
import { AuthError } from './index';

/**
 * Verify if a token is still valid
 *
 * @param token - The access token to verify
 * @param apiBaseUrl - Optional API base URL override
 * @returns True if the token is valid, false otherwise
 */
export async function verifyToken(
  token: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const url = `${apiBaseUrl}${DEFAULT_CONFIG.endpoints.session}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    return response.ok;
  } catch (error) {
    console.warn('Token verification failed:', error);
    return false;
  }
}

/**
 * Get session information using a token
 *
 * @param token - The access token to use
 * @param apiBaseUrl - Optional API base URL override
 * @returns Session data if valid, null otherwise
 */
export async function getSession(
  token: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<any | null> {
  if (!token) {
    return null;
  }

  try {
    const url = `${apiBaseUrl}${DEFAULT_CONFIG.endpoints.session}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.warn('Session retrieval failed:', error);
    return null;
  }
}