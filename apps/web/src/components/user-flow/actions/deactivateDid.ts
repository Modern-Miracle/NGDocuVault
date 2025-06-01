import { API_ENDPOINTS } from '@/components/user-flow/config';
import { getAuthToken } from '@/components/user-flow/utils';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Deactivate a DID
 *
 * @param did - The DID to deactivate
 * @returns A boolean indicating whether the deactivation was successful
 * @throws ApiError if the deactivation fails
 */
export async function deactivateDid(did: string): Promise<boolean> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  const token = getAuthToken();

  if (!token) {
    throw new ApiError('Authentication required', 401);
  }

  try {
    const response = await fetchWithErrorHandling<{ deactivated: boolean }>(API_ENDPOINTS.DID.DEACTIVATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ did }),
    });

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to deactivate DID', 500);
    }

    return response.data.deactivated;
  } catch (error) {
    console.error('Error deactivating DID:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to deactivate DID', 500);
  }
}
