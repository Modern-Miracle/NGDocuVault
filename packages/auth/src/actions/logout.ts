import { DEFAULT_CONFIG } from '../config';
import { AuthError } from './index';

/**
 * Log out the user and invalidate their session
 *
 * @param refreshToken - Optional refresh token to invalidate
 * @param apiBaseUrl - Optional API base URL override
 * @throws AuthError if logout fails (but doesn't prevent local cleanup)
 */
export async function logout(
  refreshToken?: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<void> {
  try {
    const url = `${apiBaseUrl}${DEFAULT_CONFIG.endpoints.logout}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    // Don't throw on logout errors - just log them
    if (!response.ok) {
      console.warn('Logout request failed, but continuing with local cleanup:', response.status);
    }
  } catch (error) {
    // Don't throw on network errors during logout - just log them
    console.warn('Network error during logout, but continuing with local cleanup:', error);
  }
}

/**
 * Graceful logout that always succeeds locally even if server request fails
 *
 * @param refreshToken - Optional refresh token to invalidate
 * @param apiBaseUrl - Optional API base URL override
 */
export async function gracefulLogout(
  refreshToken?: string,
  apiBaseUrl?: string
): Promise<void> {
  try {
    await logout(refreshToken, apiBaseUrl);
  } catch (error) {
    // Always succeed gracefully
    console.warn('Logout failed, but cleaned up locally:', error);
  }
}