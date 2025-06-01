

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Get the DID for a wallet address
 *
 * @param address - The Ethereum wallet address
 * @returns The DID associated with the address, or null if none exists
 * @throws ApiError if the request fails
 */
export async function getDidForAddress(address: string): Promise<string | null> {
  if (!address) {
    throw new ApiError('Address is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<{ did: string | null }>(
      `${API_ENDPOINTS.AUTH.GET_DID_FOR_ADDRESS}?address=${encodeURIComponent(address)}`,
      {
        method: 'GET',
      }
    );

    if (!response.success) {
      // If the response indicates no DID was found, return null instead of throwing an error
      if (response.error?.includes('not found') || response.error?.includes('404')) {
        return null;
      }
      throw new ApiError(response.error || 'Failed to get DID for address', 500);
    }

    return response.data?.did || null;
  } catch (error) {
    console.error('Error getting DID for address:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to get DID for address', 500);
  }
}
