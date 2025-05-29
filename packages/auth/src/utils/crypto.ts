/**
 * Cryptographic utilities for key generation and DID creation
 */

/**
 * Generate a cryptographic key pair for DID verification
 * @returns Object containing public and private keys
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  // In a real implementation, this would use proper cryptographic libraries
  // For now, we'll generate pseudo-random keys for demonstration
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const publicKey = Array.from({ length: 44 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  const privateKey = Array.from({ length: 64 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  
  return {
    publicKey,
    privateKey,
  };
}

/**
 * Create a DID document structure
 * @param address - Ethereum address
 * @param publicKey - Public key for verification
 * @param metadata - Additional metadata to include
 * @returns JSON string of the DID document
 */
export function createDidDocument(
  address: string,
  publicKey: string,
  metadata: Record<string, any> = {}
): string {
  const didDocument = {
    '@context': ['https://www.w3.org/ns/did/v1'],
    id: `did:docuvault:${address}`,
    controller: address,
    verificationMethod: [
      {
        id: `did:docuvault:${address}#key-1`,
        type: 'Ed25519VerificationKey2020',
        controller: `did:docuvault:${address}`,
        publicKeyBase58: publicKey,
      },
    ],
    authentication: [`did:docuvault:${address}#key-1`],
    service: [
      {
        id: `did:docuvault:${address}#docuvault-service`,
        type: 'DocuVaultService',
        serviceEndpoint: 'https://docuvault.app',
      },
    ],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    ...metadata,
  };

  return JSON.stringify(didDocument, null, 2);
}

/**
 * Validate if a string is a valid DID
 * @param did - The DID string to validate
 * @returns True if valid DID format
 */
export function isValidDid(did: string): boolean {
  const didRegex = /^did:docuvault:0x[a-fA-F0-9]{40}$/;
  return didRegex.test(did);
}

/**
 * Extract address from a DID
 * @param did - The DID string
 * @returns Ethereum address if valid, null otherwise
 */
export function extractAddressFromDid(did: string): string | null {
  if (!isValidDid(did)) {
    return null;
  }
  
  return did.replace('did:docuvault:', '');
}

/**
 * Generate a DID from an Ethereum address
 * @param address - Ethereum address
 * @returns DID string
 */
export function generateDidFromAddress(address: string): string {
  return `did:docuvault:${address}`;
}