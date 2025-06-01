import { API_ENDPOINTS } from '@/components/user-flow/config';
import { ApiError, fetchWithErrorHandling } from '@/components/user-flow/utils/api-helper';

/**
 * Check if a DID is active
 *
 * @param did - The DID to check
 * @returns A boolean indicating whether the DID is active
 * @throws ApiError if the check fails
 */
export async function checkDidActive(did: string): Promise<boolean> {
  if (!did) {
    throw new ApiError('DID is required', 400);
  }

  try {
    const response = await fetchWithErrorHandling<{ active: boolean }>(
      `${API_ENDPOINTS.AUTH.CHECK_DID_ACTIVE}?did=${encodeURIComponent(did)}`,
      {
        method: 'GET',
      }
    );

    if (!response.success || !response.data) {
      throw new ApiError(response.error || 'Failed to check DID status', 500);
    }

    return response.data.active;
  } catch (error) {
    console.error('Error checking DID status:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(error instanceof Error ? error.message : 'Failed to check DID status', 500);
  }
}
