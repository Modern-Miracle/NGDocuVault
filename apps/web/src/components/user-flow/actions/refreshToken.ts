

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { AuthResponse, User } from '@/components/user-flow/types';
import { getRefreshToken, setAuthToken, setRefreshToken } from '@/components/user-flow/utils';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Refresh the authentication token using the refresh token
 *
 * @returns The user data if the token refresh was successful
 * @throws ApiError if the token refresh fails
 */
export async function refreshToken(): Promise<User> {
  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new ApiError('No refresh token available', 401);
  }

  try {
    const response = await fetchWithErrorHandling<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to refresh token', 401);
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn, user } = response.data;

    // Update tokens in localStorage
    setAuthToken(accessToken, expiresIn);

    // Only update refresh token if a new one was provided
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }

    // Ensure user object has the required fields
    if (!user || !user.did || !user.address) {
      throw new ApiError('Invalid user data received from server', 500);
    }

    return user;
  } catch (error) {
    console.error('Token refresh error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to refresh token', 401);
  }
}
