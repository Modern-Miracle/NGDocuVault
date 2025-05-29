import { DEFAULT_CONFIG } from '../config';
import { AuthError, ChallengeResponse } from './index';

/**
 * Generate an authentication challenge for a wallet address
 *
 * @param address - The Ethereum wallet address to generate a challenge for
 * @param apiBaseUrl - Optional API base URL override
 * @returns A challenge response containing the challenge string and expiration time
 * @throws AuthError if the request fails
 */
export async function generateChallenge(
  address: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<ChallengeResponse> {
  if (!address) {
    throw new AuthError('Address is required');
  }

  try {
    const url = `${apiBaseUrl}${DEFAULT_CONFIG.endpoints.challenge}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ address }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new AuthError(
        errorData.message || `Request failed: ${response.statusText}`
      );
      error.code = errorData.code;
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new AuthError(data.error || 'Failed to generate challenge');
    }

    return data.data;
  } catch (error) {
    console.error('Error generating challenge:', error);

    if (error instanceof AuthError) {
      throw error;
    }

    const authError = new AuthError(
      error instanceof Error ? error.message : 'Failed to generate challenge'
    );
    authError.details = error;
    throw authError;
  }
}