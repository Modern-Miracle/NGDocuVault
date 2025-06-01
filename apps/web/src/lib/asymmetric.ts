'use client';

import { ec as EC } from 'elliptic';

export const generateKeyPair = () => {
  const ec = new EC('secp256k1');
  const keyPair = ec.genKeyPair();

  return {
    privateKey: keyPair.getPrivate('hex'),
    publicKey: keyPair.getPublic('hex'),
  };
};

/**
 * Represents the output of an asymmetric encryption process.
 */
export type AsymmetricEncryptOutput = {
  /**
   * The ephemeral public key used in the ECDH key exchange.
   */
  ephemeralPublicKey: string;

  /**
   * The initialization vector (IV) used during encryption.
   */
  iv: string;

  /**
   * The authentication tag generated during encryption, used to verify the integrity of the encrypted data.
   */
  authTag: string;

  /**
   * The encrypted data as a string, typically represented in hex encoding.
   */
  encrypted: string;
};

/**
 * Converts a hex string to a Uint8Array
 */
const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(Math.floor(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

/**
 * Converts a Uint8Array to a hex string
 */
export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Converts a Uint8Array to a string using UTF-8 encoding
 */
const bytesToString = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes);
};

export const decryptWithPrivateKey = async (
  encryptedData: AsymmetricEncryptOutput,
  privateKey: string
): Promise<string> => {
  // Validate inputs
  if (!encryptedData || !privateKey) {
    throw new Error('Missing required parameters: encryptedData or privateKey');
  }

  const { ephemeralPublicKey, iv, authTag, encrypted } = encryptedData;

  // Validate all required fields exist
  if (!ephemeralPublicKey || !iv || !authTag || !encrypted) {
    throw new Error('Invalid encrypted data: missing required fields');
  }

  try {
    // Use elliptic for ECDH key derivation (browser compatible)
    const ec = new EC('secp256k1');
    const recipientKeyPair = ec.keyFromPrivate(privateKey, 'hex');
    const ephemeralKey = ec.keyFromPublic(ephemeralPublicKey, 'hex');
    const sharedSecret = recipientKeyPair.derive(ephemeralKey.getPublic()).toString(16);

    // Ensure shared secret has sufficient length
    if (sharedSecret.length < 64) {
      throw new Error('Derived shared secret is too short');
    }

    // Convert hex values to Uint8Arrays for Web Crypto API
    const keyBytes = hexToBytes(sharedSecret).slice(0, 32);
    const ivBytes = hexToBytes(iv);
    const authTagBytes = hexToBytes(authTag);
    const encryptedBytes = hexToBytes(encrypted);

    // Combine encrypted data with auth tag (GCM format for Web Crypto API)
    const encryptedWithAuthTag = new Uint8Array(encryptedBytes.length + authTagBytes.length);
    encryptedWithAuthTag.set(encryptedBytes);
    encryptedWithAuthTag.set(authTagBytes, encryptedBytes.length);

    // Use the Web Crypto API to decrypt
    const cryptoKey = await window.crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);

    const decryptedBytes = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: 128, // auth tag length in bits
      },
      cryptoKey,
      encryptedWithAuthTag
    );

    // Convert the decrypted bytes to string
    return bytesToString(new Uint8Array(decryptedBytes));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw new Error('Decryption failed due to unknown error');
  }
};
