import { API_ENDPOINTS } from '@/components/user-flow/config';
import { getAuthToken } from '@/components/user-flow/utils';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Update the public key associated with a DID
 *
 * @param did - The DID to update the public key for
 * @param publicKey - The new public key
 * @returns A boolean indicating whether the update was successful
 * @throws ApiError if the update fails
 */
export async function updatePublicKey(did: string, publicKey: string): Promise<boolean> {
  if (!did || !publicKey) {
    throw new ApiError('DID and public key are required', 400);
  }

  const token = getAuthToken();

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const response = await fetchWithErrorHandling<{ updated: boolean }>(API_ENDPOINTS.DID.UPDATE_PUBLIC_KEY, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ did, publicKey }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to update public key', 500);
    }

    return response.data.updated;
  } catch (error) {
    console.error('Error updating public key:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to update public key', 500);
  }
}
