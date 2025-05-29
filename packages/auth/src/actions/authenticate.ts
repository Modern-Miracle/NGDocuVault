import { DEFAULT_CONFIG } from '../config';
import { AuthError, AuthResponse } from './index';

export interface User {
  address: string;
  did?: string;
  roles: string[];
}

export interface AuthenticationResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/**
 * Authenticate a user with their wallet address and signature
 *
 * @param address - The Ethereum wallet address
 * @param signature - The signature of the challenge
 * @param apiBaseUrl - Optional API base URL override
 * @returns The authenticated user information
 * @throws AuthError if authentication fails
 */
export async function authenticate(
  address: string,
  signature: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<AuthenticationResponse> {
  if (!address || !signature) {
    const error = new AuthError('Address and signature are required');
    error.code = 'INVALID_PARAMS';
    error.statusCode = 400;
    throw error;
  }

  try {
    const url = `${apiBaseUrl}${DEFAULT_CONFIG.endpoints.authenticate}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ address, signature }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new AuthError(
        errorData.message || `Authentication failed: ${response.statusText}`
      );
      error.code = errorData.code || 'AUTH_FAILED';
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new AuthError(data.error || 'Authentication failed');
    }

    const { accessToken, refreshToken, expiresIn, user } = data.data;

    // Validate required fields
    if (!accessToken || !user || !user.address) {
      throw new AuthError('Invalid authentication response from server');
    }

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        address: user.address,
        did: user.did,
        roles: user.roles || [],
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);

    if (error instanceof AuthError) {
      throw error;
    }

    const authError = new AuthError(
      error instanceof Error ? error.message : 'Authentication failed'
    );
    authError.code = 'AUTH_FAILED';
    authError.statusCode = 401;
    authError.details = error;
    throw authError;
  }
}