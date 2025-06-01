import { API_ENDPOINTS } from '@/components/user-flow/config';
import { ChallengeResponse } from '@/components/user-flow/types';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Generate an authentication challenge for a wallet address
 *
 * @param address - The Ethereum wallet address to generate a challenge for
 * @returns A challenge response containing the challenge string and expiration time
 * @throws ApiError if the request fails
 */
export async function generateChallenge(address: string): Promise<ChallengeResponse> {
  if (!address) {
    throw new ApiError('Address is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<ChallengeResponse>(API_ENDPOINTS.AUTH.CHALLENGE, {
      method: 'POST',
      body: JSON.stringify({ address }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to generate challenge', 500);
    }

    return response.data;
  } catch (error) {
    console.error('Error generating challenge:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to generate challenge', 500);
  }
}
