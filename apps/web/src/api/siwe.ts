// API client for SIWE authentication
import { SiweMessage } from 'siwe';
import { DEBUG } from '@/lib/config';

// API base URL hardcoded for development to avoid hostname resolution issues
const API_BASE_URL = 'http://localhost:5000/api/v1';

/**
 * Fetch a nonce for SIWE authentication
 */
export async function fetchNonce(address?: string, chainId?: number): Promise<string> {
  try {
    if (DEBUG.logApiCalls) {
      console.log('Fetching nonce from:', `${API_BASE_URL}/auth/siwe/nonce`);
    }

    // Use provided address or empty string as fallback
    const walletAddress = address || '';
    const chain = chainId || 31337; // Use Hardhat default chain ID if not provided

    const response = await fetch(`${API_BASE_URL}/auth/siwe/nonce?address=${walletAddress}&chainId=${chain}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch nonce: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Log the entire response to debug
    console.log('Nonce API response:', data);

    // Make sure we're extracting the correct property based on the API response structure
    if (!data.nonce) {
      console.error('Nonce not found in API response:', data);
      // Try to find the nonce in different properties of the response
      if (data.data && data.data.nonce) {
        return data.data.nonce;
      } else if (data.challenge && data.challenge.nonce) {
        return data.challenge.nonce;
      } else {
        throw new Error('Nonce not found in API response');
      }
    }

    return data.nonce;
  } catch (error) {
    console.error('Error fetching nonce:', error);
    throw error;
  }
}

/**
 * Verify SIWE message signature
 */
export async function verifySiweSignature(message: SiweMessage, signature: string): Promise<{ address: string }> {
  try {
    if (DEBUG.logApiCalls) {
      console.log('Verifying signature at:', `${API_BASE_URL}/auth/siwe/verify`);
    }

    const response = await fetch(`${API_BASE_URL}/auth/siwe/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message: message.prepareMessage(),
        signature,
      }),
    });

    console.log('response', response);

    if (!response.ok) {
      throw new Error(`Failed to verify signature: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying signature:', error);
    throw error;
  }
}

/**
 * Get current user session
 */
export async function getSession(): Promise<{ address: string } | null> {
  try {
    if (DEBUG.logApiCalls) {
      console.log('Getting session from:', `${API_BASE_URL}/auth/siwe/session`);
    }

    const response = await fetch(`${API_BASE_URL}/auth/siwe/session`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Get user profile with DID information
 */
export async function getProfile(): Promise<{ address: string; did?: string } | null> {
  try {
    if (DEBUG.logApiCalls) {
      console.log('Getting profile from:', `${API_BASE_URL}/auth/siwe/did-info`);
    }

    const response = await fetch(`${API_BASE_URL}/auth/siwe/did-info`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    console.log('data', data);

    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Log out current user
 */
export async function logout(): Promise<boolean> {
  try {
    if (DEBUG.logApiCalls) {
      console.log('Logging out at:', `${API_BASE_URL}/auth/siwe/logout`);
    }

    // First try the regular logout endpoint (it will try to get refresh token from cookies/session)
    const response = await fetch(`${API_BASE_URL}/auth/siwe/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({}), // Send empty body to satisfy the endpoint
    });

    // If logout failed, try the clear-session endpoint as a fallback
    if (!response.ok) {
      if (DEBUG.logApiCalls) {
        console.log('Regular logout failed, trying clear-session endpoint');
      }

      const clearResponse = await fetch(`${API_BASE_URL}/auth/siwe/clear-session`, {
        method: 'POST',
        credentials: 'include',
      });

      return clearResponse.ok;
    }

    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
}

/**
 * Type definition for API request methods
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Type for the response from Merkle API
 */
interface MerkleResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Proxy function to handle CORS issues with external APIs
 * This function should be called instead of direct fetch to eth.merkle.io
 * It routes requests through your backend API which should handle CORS properly
 */
export async function proxyMerkleRequest<T = unknown>(
  endpoint: string = '/',
  method: HttpMethod = 'POST',
  body?: Record<string, unknown>
): Promise<MerkleResponse<T>> {
  try {
    if (DEBUG.logApiCalls) {
      console.log('Proxying request to Merkle.io via backend:', `${API_BASE_URL}/proxy/merkle${endpoint}`);
    }

    const response = await fetch(`${API_BASE_URL}/proxy/merkle${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Merkle proxy request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in proxied Merkle request:', error);
    throw error;
  }
}
