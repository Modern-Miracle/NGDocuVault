

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { CreateDidResponse } from '@/components/user-flow/types';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Create a DID (Decentralized Identifier) for a wallet address
 *
 * @param address - The Ethereum wallet address to create a DID for
 * @returns The created DID and DID document
 * @throws ApiError if the DID creation fails
 */
export async function createDid(address: string): Promise<CreateDidResponse> {
  if (!address) {
    throw new ApiError('Address is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<CreateDidResponse>(API_ENDPOINTS.DID.CREATE, {
      method: 'POST',
      body: JSON.stringify({ address }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to create DID', 500);
    }

    return response.data;
  } catch (error) {
    console.error('Error creating DID:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to create DID', 500);
  }
}
