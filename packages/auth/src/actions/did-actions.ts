import { DEFAULT_CONFIG } from '../config';
import { AuthError } from './index';

export interface DidDocument {
  id: string;
  controller: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyJwk?: any;
    publicKeyBase58?: string;
  }>;
  authentication: string[];
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

export interface CreateDidRequest {
  did: string;
  document: string;
  publicKey: string;
}

/**
 * Check if a DID is active
 *
 * @param did - The DID to check
 * @param apiBaseUrl - Optional API base URL override
 * @returns True if DID is active, false otherwise
 */
export async function checkDidActive(
  did: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<boolean> {
  if (!did) {
    return false;
  }

  try {
    const url = `${apiBaseUrl}/did/${encodeURIComponent(did)}/active`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success && data.data?.active === true;
  } catch (error) {
    console.warn('DID active check failed:', error);
    return false;
  }
}

/**
 * Get DID document
 *
 * @param did - The DID to get document for
 * @param apiBaseUrl - Optional API base URL override
 * @returns DID document if found, null otherwise
 */
export async function getDidDocument(
  did: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<DidDocument | null> {
  if (!did) {
    return null;
  }

  try {
    const url = `${apiBaseUrl}/did/${encodeURIComponent(did)}/document`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.warn('DID document retrieval failed:', error);
    return null;
  }
}

/**
 * Get DID for an address
 *
 * @param address - The wallet address
 * @param apiBaseUrl - Optional API base URL override
 * @returns DID if found, null otherwise
 */
export async function getDidForAddress(
  address: string,
  apiBaseUrl: string = DEFAULT_CONFIG.apiBaseUrl
): Promise<string | null> {
  if (!address) {
    return null;
  }

  try {
    const url = `${apiBaseUrl}/did/address/${address}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data?.did : null;
  } catch (error) {
    console.warn('DID lookup failed:', error);
    return null;
  }
}