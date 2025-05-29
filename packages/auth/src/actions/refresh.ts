import { DEFAULT_CONFIG } from '../config';
import { AuthError } from './index';
import { User } from './authenticate';

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: User;
}

/**
 * Refresh the authentication token using the refresh token
 *
 * @param refreshToken - The refresh token to use
 * @param apiBaseUrl - Optional API base URL override
 * @returns The refresh response with new tokens and user data
 * @throws AuthError if the token refresh fails
 */
export async function refreshToken(
  refreshToken: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<RefreshResponse> {
  if (!refreshToken) {
    const error = new AuthError('No refresh token available');
    error.code = 'NO_REFRESH_TOKEN';
    error.statusCode = 401;
    throw error;
  }

  try {
    const url = `${apiBaseUrl}${DEFAULT_CONFIG.endpoints.refresh}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new AuthError(
        errorData.message || `Token refresh failed: ${response.statusText}`
      );
      error.code = errorData.code || 'REFRESH_FAILED';
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new AuthError(data.error || 'Failed to refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn, user } = data.data;

    // Validate required fields
    if (!accessToken || !user || !user.address) {
      throw new AuthError('Invalid refresh response from server');
    }

    return {
      accessToken,
      refreshToken: newRefreshToken || refreshToken, // Fallback to current token if no new one
      expiresIn,
      user: {
        address: user.address,
        did: user.did,
        roles: user.roles || [],
      },
    };
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof AuthError) {
      throw error;
    }

    const authError = new AuthError(
      error instanceof Error ? error.message : 'Failed to refresh token'
    );
    authError.code = 'REFRESH_FAILED';
    authError.statusCode = 401;
    authError.details = error;
    throw authError;
  }
}