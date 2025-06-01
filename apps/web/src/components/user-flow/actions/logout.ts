

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { clearAuthData } from '@/components/user-flow/utils';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Log out a user
 * This will clear the authentication data and notify the server
 */
export async function logout(): Promise<void> {
  try {
    // Clear localStorage first to ensure the user is logged out even if the API call fails
    clearAuthData();

    // Notify the server about the logout
    try {
      await fetchWithErrorHandling(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      // Log but don't throw - we still want to clear localStorage even if the API call fails
      console.error('Error notifying server about logout:', error);
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw new ApiError(error instanceof Error ? error.message : 'Failed to log out', 500);
  }
}
