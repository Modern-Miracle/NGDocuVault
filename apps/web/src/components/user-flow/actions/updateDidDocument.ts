

import { API_ENDPOINTS } from '@/components/user-flow/config';
import { DidDocument } from '@/components/user-flow/types';
import { getAuthToken } from '@/components/user-flow/utils';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Update a DID document
 *
 * @param did - The DID to update
 * @param document - The updated DID document
 * @returns The updated DID document
 * @throws ApiError if the update fails
 */
export async function updateDidDocument(did: string, document: DidDocument): Promise<DidDocument> {
  if (!did || !document) {
    throw new ApiError('DID and document are required', 400);
  }

  const token = getAuthToken();

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const response = await fetchWithErrorHandling<DidDocument>(API_ENDPOINTS.DID.UPDATE_DOCUMENT, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ did, document }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to update DID document', 500);
    }

    return response.data;
  } catch (error) {
    console.error('Error updating DID document:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to update DID document', 500);
  }
}
