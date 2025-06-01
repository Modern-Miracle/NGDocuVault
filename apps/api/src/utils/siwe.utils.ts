import { SiweMessage } from 'siwe';
import { ethers, getAddress } from 'ethers';

/**
 * Validate a SIWE message format according to EIP-4361
 * @param message The SIWE message to validate
 */
export const validateSiweMessageFormat = (message: string): boolean => {
  try {
    // Try to parse the message
    const siweMessage = new SiweMessage(message);

    // Check for required fields
    const requiredFields = [
      'domain',
      'address',
      'uri',
      'version',
      'chainId',
      'nonce',
      'issuedAt'
    ];

    for (const field of requiredFields) {
      if (!(siweMessage as any)[field]) {
        return false;
      }
    }

    // Validate address format using ethers v6
    if (!ethers.isAddress(siweMessage.address)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating SIWE message format:', error);
    return false;
  }
};

/**
 * Generate a new SIWE message
 * @param domain Domain requesting the signature
 * @param address User's Ethereum address
 * @param statement Statement for the user to sign
 * @param uri URI of the site
 * @param chainId Chain ID
 * @param nonce Unique nonce
 * @param expirationTime Optional expiration time
 */
export const generateSiweMessage = (
  domain: string,
  address: string,
  statement: string,
  uri: string,
  chainId: number,
  nonce: string,
  expirationTime?: Date
): string => {
  // Ensure address is in EIP-55 checksum format
  const checksumAddress = getAddress(address);

  // Create SIWE message
  const siweMessage = new SiweMessage({
    domain,
    address: checksumAddress,
    statement,
    uri,
    version: '1',
    chainId,
    nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: expirationTime ? expirationTime.toISOString() : undefined
  });

  // Return prepared message
  return siweMessage.prepareMessage();
};

/**
 * Extract address from a SIWE message
 * @param message SIWE message
 * @param returnChecksumAddress Whether to return the address in EIP-55 format
 */
export const extractAddressFromSiweMessage = (
  message: string,
  returnChecksumAddress: boolean = false
): string | null => {
  try {
    const siweMessage = new SiweMessage(message);
    return returnChecksumAddress
      ? getAddress(siweMessage.address)
      : siweMessage.address.toLowerCase();
  } catch (error) {
    console.error('Error extracting address from SIWE message:', error);
    return null;
  }
};
