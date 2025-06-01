

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { DidDocument } from '@/components/user-flow/types';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Resolve a DID to get its document
 *
 * @param did - The DID to resolve
 * @returns The resolved DID document
 * @throws ApiError if the resolution fails
 */
export async function resolveDid(did: string): Promise<DidDocument> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<DidDocument>(
      `${API_ENDPOINTS.DID.RESOLVE}?did=${encodeURIComponent(did)}`,
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to resolve DID', 404);
    }

    return response.data;
  } catch (error) {
    console.error('Error resolving DID:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to resolve DID', 500);
  }
}
