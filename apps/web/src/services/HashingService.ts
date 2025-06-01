'use client';

/**
 * Supported hash algorithms.
 */
export enum HashAlgorithm {
  SHA256 = 'SHA-256',
  SHA512 = 'SHA-512',
  SHA3_256 = 'SHA3-256',
  SHA3_512 = 'SHA3-512',
  MD5 = 'MD5', // Not recommended for security-sensitive applications
}

/**
 * Supported output encoding formats.
 */
export enum HashEncoding {
  HEX = 'hex',
  BASE64 = 'base64',
  BINARY = 'binary',
}

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Service for cryptographic hashing operations.
 * Provides functionality for hashing data using various algorithms and output formats.
 */
export class HashingService {
  private readonly defaultAlgorithm: HashAlgorithm;
  private readonly defaultEncoding: HashEncoding;

  /**
   * Creates a new instance of the HashingService.
   *
   * @param defaultAlgorithm - The default hashing algorithm to use (default: SHA256)
   * @param defaultEncoding - The default output encoding to use (default: HEX)
   */
  constructor(
    defaultAlgorithm: HashAlgorithm = HashAlgorithm.SHA256,
    defaultEncoding: HashEncoding = HashEncoding.HEX
  ) {
    this.defaultAlgorithm = defaultAlgorithm;
    this.defaultEncoding = defaultEncoding;
  }

  /**
   * Internal method to hash data using Web Crypto API
   */
  private async hashWithWebCrypto(data: string, algorithm: HashAlgorithm, encoding: HashEncoding): Promise<string> {
    // Convert string to buffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Hash the data
    const hashBuffer = await window.crypto.subtle.digest(algorithm, dataBuffer);

    // Convert to requested encoding
    if (encoding === HashEncoding.HEX) {
      return arrayBufferToHex(hashBuffer);
    } else if (encoding === HashEncoding.BASE64) {
      return arrayBufferToBase64(hashBuffer);
    } else {
      // Binary format - return as Uint8Array converted to string
      return Array.from(new Uint8Array(hashBuffer)).join(',');
    }
  }

  /**
   * Hashes data using the SHA-256 algorithm and returns the result in hexadecimal format.
   *
   * @param data - The data to be hashed, provided as a string
   * @returns A promise that resolves with the hashed data in hexadecimal format
   * @throws Will throw an error if hashing fails
   */
  public async hashData(data: string): Promise<string> {
    try {
      return this.hashWithWebCrypto(data, HashAlgorithm.SHA256, HashEncoding.HEX);
    } catch (error: unknown) {
      throw new Error(`Failed to hash data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Hashes data using the SHA-256 algorithm and returns the result in hexadecimal format.
   *
   * @param data - The data to be hashed, provided as a string
   * @returns A promise that resolves with the hashed data in hexadecimal format
   * @throws Will throw an error if hashing fails
   */
  public async hashHex(data: string): Promise<string> {
    try {
      return this.hashWithWebCrypto(data, HashAlgorithm.SHA256, HashEncoding.HEX);
    } catch (error: unknown) {
      throw new Error(`Failed to hash data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Hashes data using the SHA-256 algorithm and returns the result in base64 format.
   *
   * @param data - The data to be hashed, provided as a string
   * @returns A promise that resolves with the hashed data in base64 format
   * @throws Will throw an error if hashing fails
   */
  public async hashBase64(data: string): Promise<string> {
    try {
      return this.hashWithWebCrypto(data, HashAlgorithm.SHA256, HashEncoding.BASE64);
    } catch (error: unknown) {
      throw new Error(`Failed to hash data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Hashes data using the specified algorithm and returns the result in the specified format.
   *
   * @param data - The data to be hashed, provided as a string
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the hashed data in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashWithAlgorithm(
    data: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      return this.hashWithWebCrypto(data, algorithm, encoding);
    } catch (error: unknown) {
      throw new Error(
        `Failed to hash data with algorithm ${algorithm}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Creates a hash of an object by first converting it to a JSON string.
   *
   * @param obj - The object to hash
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the hashed object in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashObject(
    obj: Record<string, unknown>,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      const jsonString = JSON.stringify(obj);
      return this.hashWithWebCrypto(jsonString, algorithm, encoding);
    } catch (error: unknown) {
      throw new Error(`Failed to hash object: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verifies if a given data matches a given hash.
   *
   * @param data - The data to verify
   * @param hash - The hash to compare against
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The encoding of the hash (default: the service's default encoding)
   * @returns A promise that resolves with true if the data matches the hash, false otherwise
   */
  public async verifyHash(
    data: string,
    hash: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<boolean> {
    try {
      const computedHash = await this.hashWithWebCrypto(data, algorithm, encoding);
      return computedHash === hash;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return false;
    }
  }

  /**
   * Creates an HMAC (Hash-based Message Authentication Code) for the given data using a secret key.
   * Using Web Crypto SubtleCrypto.sign with HMAC algorithm.
   *
   * @param data - The data to create an HMAC for
   * @param secretKey - The secret key to use for the HMAC
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the HMAC in the specified format
   * @throws Will throw an error if HMAC creation fails
   */
  public async createHmac(
    data: string,
    secretKey: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      // Convert data and key to appropriate formats
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const keyBuffer = encoder.encode(secretKey);

      // Import the key
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'HMAC', hash: { name: algorithm } },
        false,
        ['sign']
      );

      // Create the signature
      const signatureBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);

      // Convert to requested encoding
      if (encoding === HashEncoding.HEX) {
        return arrayBufferToHex(signatureBuffer);
      } else if (encoding === HashEncoding.BASE64) {
        return arrayBufferToBase64(signatureBuffer);
      } else {
        // Binary format
        return Array.from(new Uint8Array(signatureBuffer)).join(',');
      }
    } catch (error: unknown) {
      throw new Error(`Failed to create HMAC: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verifies an HMAC against the original data and secret key.
   *
   * @param data - The original data
   * @param hmac - The HMAC to verify
   * @param secretKey - The secret key used to create the HMAC
   * @param algorithm - The hashing algorithm used (default: the service's default algorithm)
   * @param encoding - The encoding of the HMAC (default: the service's default encoding)
   * @returns A promise that resolves with true if the HMAC is valid, false otherwise
   */
  public async verifyHmac(
    data: string,
    hmac: string,
    secretKey: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<boolean> {
    try {
      const computedHmac = await this.createHmac(data, secretKey, algorithm, encoding);
      return computedHmac === hmac;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return false;
    }
  }

  /**
   * Creates a hash of a buffer (array of bytes).
   *
   * @param buffer - The buffer to hash
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the hashed file in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashBuffer(
    buffer: Uint8Array,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      // Hash the buffer
      const hashBuffer = await window.crypto.subtle.digest(algorithm, buffer);

      // Convert to requested encoding
      if (encoding === HashEncoding.HEX) {
        return arrayBufferToHex(hashBuffer);
      } else if (encoding === HashEncoding.BASE64) {
        return arrayBufferToBase64(hashBuffer);
      } else {
        // Binary format
        return Array.from(new Uint8Array(hashBuffer)).join(',');
      }
    } catch (error: unknown) {
      throw new Error(`Failed to hash buffer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a hash of a string with a salt prepended to it.
   *
   * @param data - The data to hash
   * @param salt - The salt to prepend to the data
   * @param algorithm - The hashing algorithm to use (default: the service's default algorithm)
   * @param encoding - The output encoding format (default: the service's default encoding)
   * @returns A promise that resolves with the salted hash in the specified format
   * @throws Will throw an error if hashing fails
   */
  public async hashWithSalt(
    data: string,
    salt: string,
    algorithm: HashAlgorithm = this.defaultAlgorithm,
    encoding: HashEncoding = this.defaultEncoding
  ): Promise<string> {
    try {
      const saltedData = salt + data;
      return this.hashWithWebCrypto(saltedData, algorithm, encoding);
    } catch (error: unknown) {
      throw new Error(`Failed to hash with salt: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
