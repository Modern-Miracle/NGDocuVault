import { API_ENDPOINTS } from '@/components/user-flow/config';
import { AuthResponse, User } from '@/components/user-flow/types';
import { setAuthToken, setRefreshToken } from '@/components/user-flow/utils';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Authenticate a user with their wallet address and signature
 *
 * @param address - The Ethereum wallet address
 * @param signature - The signature of the challenge
 * @returns The authenticated user information
 * @throws ApiError if authentication fails
 */
export async function authenticate(address: string, signature: string): Promise<User> {
  if (!address || !signature) {
    throw new ApiError('Address and signature are required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<AuthResponse>(API_ENDPOINTS.AUTH.AUTHENTICATE, {
      method: 'POST',
      body: JSON.stringify({ address, signature }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Authentication failed', 401);
    }

    const { accessToken, refreshToken, expiresIn, user } = response.data;

    // Store tokens in localStorage
    setAuthToken(accessToken, expiresIn);
    setRefreshToken(refreshToken);

    // Ensure user object has the required fields
    if (!user || !user.address) {
      throw new ApiError('Invalid user data received from server', 500);
    }

    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Authentication failed', 401);
  }
}
