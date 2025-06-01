

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { DidDocument } from '@/components/user-flow/types';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Retrieve a DID document by DID
 *
 * @param did - The DID to retrieve the document for
 * @returns The DID document
 * @throws ApiError if the document retrieval fails
 */
export async function getDidDocument(did: string): Promise<DidDocument> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<DidDocument>(
      `${API_ENDPOINTS.DID.GET_DOCUMENT}?did=${encodeURIComponent(did)}`,
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to retrieve DID document', 404);
    }

    return response.data;
  } catch (error) {
    console.error('Error retrieving DID document:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to retrieve DID document', 500);
  }
}
