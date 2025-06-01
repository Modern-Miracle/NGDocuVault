import { Request, Response } from 'express';
import { IPFSService } from '../../src/services/ipfs/IPFSService';
import { PinataSDK } from 'pinata';
import { AsymmetricCryptoService } from '../../src/services/crypto';
import { SymmetricCryptoService } from '../../src/services/crypto';
import { DatabaseService } from '../../src/services/db/database.service';
import { KeyVaultService } from '../../src/services/keyvault';
import * as encryptUtils from '../../src/utils/encrypt';
import {
  TEST_CIDS,
  TEST_PUBLIC_KEY,
  TEST_RESOURCE,
  TEST_METADATA,
  TEST_BLOCKCHAIN_REQUEST,
  TEST_ENCRYPTED_DATA,
  TEST_IPFS_UPLOAD_RESPONSE
} from '../mock/ipfs.mock';

// Mock dependencies
jest.mock('pinata');
jest.mock('../../src/services/crypto');
jest.mock('../../src/services/db/database.service');
jest.mock('../../src/services/keyvault');
jest.mock('../../src/utils/encrypt');

describe('IPFSService', () => {
  let ipfsService: IPFSService;
  let mockPinata: any;
  let mockAsymmetricEncryption: jest.Mocked<AsymmetricCryptoService>;
  let mockSymmetricEncryption: jest.Mocked<SymmetricCryptoService>;
  let mockDb: jest.Mocked<DatabaseService>;
  let mockKeyVault: jest.Mocked<KeyVaultService>;

  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock env vars
    process.env.PINATA_API_JWT = 'mock-jwt-token';
    process.env.IPFS_GATEWAY_URL = 'test.gateway.com';
    process.env.ENCRYPTION_KEY = 'test-encryption-key';

    // Mock PinataSDK
    mockPinata = {
      gateways: {
        private: {
          get: jest.fn()
        },
        public: {
          get: jest.fn(),
          convert: jest.fn()
        }
      },
      files: {
        public: {
          get: jest.fn(),
          delete: jest.fn()
        }
      },
      upload: {
        public: {
          json: jest.fn().mockReturnThis(),
          name: jest.fn().mockImplementation(() => {
            return { ...TEST_IPFS_UPLOAD_RESPONSE };
          })
        }
      }
    };

    // Mock crypto services
    mockAsymmetricEncryption = {
      encryptWithPublicKey: jest
        .fn()
        .mockReturnValue('asymmetric-encrypted-data')
    } as unknown as jest.Mocked<AsymmetricCryptoService>;

    mockSymmetricEncryption = {
      encrypt: jest.fn().mockReturnValue('symmetric-encrypted-data'),
      decrypt: jest.fn().mockReturnValue('decrypted-data')
    } as unknown as jest.Mocked<SymmetricCryptoService>;

    // Mock DB and KeyVault services
    mockDb = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockKeyVault = new KeyVaultService() as jest.Mocked<KeyVaultService>;

    // Mock encrypt utils
    jest.spyOn(encryptUtils, 'encrypt').mockReturnValue({
      iv: 'mock-iv',
      tag: 'mock-tag',
      encrypted: 'encrypted-data'
    });
    jest.spyOn(encryptUtils, 'decrypt').mockReturnValue('{"decrypted":"data"}');
    jest.spyOn(encryptUtils, 'toCipherKey').mockReturnValue('cipher-key');

    // Mock PinataSDK constructor
    (PinataSDK as jest.Mock).mockImplementation(() => mockPinata);

    // Create service instance with mocked dependencies
    ipfsService = new IPFSService();

    // Inject mocked dependencies
    Object.defineProperty(ipfsService, 'pinata', { value: mockPinata });
    Object.defineProperty(ipfsService, 'encryptionKey', {
      value: 'test-encryption-key'
    });
    Object.defineProperty(ipfsService, 'asymmetricEncryption', {
      value: mockAsymmetricEncryption
    });
    Object.defineProperty(ipfsService, 'symmetricEncryption', {
      value: mockSymmetricEncryption
    });
    Object.defineProperty(ipfsService, 'db', { value: mockDb });
    Object.defineProperty(ipfsService, 'keyVault', { value: mockKeyVault });
  });

  afterEach(() => {
    // Restore env
    process.env = originalEnv;
  });

  describe('fetchFromIPFS', () => {
    it('should fetch data from IPFS by CID', async () => {
      // Setup
      const mockData = { test: 'value' };
      mockPinata.gateways.private.get.mockResolvedValue(mockData);

      // Execute
      const result = await ipfsService.fetchFromIPFS(TEST_CIDS.regular);

      // Assert
      expect(mockPinata.gateways.private.get).toHaveBeenCalledWith(
        TEST_CIDS.regular
      );
      expect(result).toEqual(mockData);
    });

    it('should handle errors when fetching data', async () => {
      // Setup - mock all pinata methods to fail
      mockPinata.gateways.private.get.mockRejectedValue(
        new Error('Private gateway failed')
      );
      mockPinata.gateways.public.get.mockRejectedValue(
        new Error('Public gateway failed')
      );
      mockPinata.files.public.get.mockRejectedValue(
        new Error('File info failed')
      );

      // Execute
      const result = await ipfsService.fetchFromIPFS(TEST_CIDS.invalid);

      // Assert - should return error object instead of throwing
      expect(result).toHaveProperty('error', true);
      expect(result).toHaveProperty('message');
    });
  });

  describe('fetchFromIPFSAndReencrypt', () => {
    it('should fetch, decrypt, and re-encrypt data with a public key', async () => {
      // Setup
      mockPinata.gateways.private.get.mockResolvedValue({
        data: {
          encrypted: 'encrypted-data'
        }
      });

      // Execute
      const result = await ipfsService.fetchFromIPFSAndReencrypt(
        TEST_PUBLIC_KEY,
        TEST_CIDS.encrypted
      );

      // Assert
      expect(mockPinata.gateways.private.get).toHaveBeenCalledWith(
        TEST_CIDS.encrypted
      );
      expect(mockSymmetricEncryption.decrypt).toHaveBeenCalled();
      expect(mockAsymmetricEncryption.encryptWithPublicKey).toHaveBeenCalled();
      expect(result).toBe('asymmetric-encrypted-data');
    });

    it('should handle errors during fetch', async () => {
      // Setup
      mockPinata.gateways.private.get.mockRejectedValue(
        new Error('Private gateway failed')
      );
      mockPinata.gateways.public.get.mockRejectedValue(
        new Error('Public gateway failed')
      );
      mockPinata.files.public.get.mockRejectedValue(
        new Error('File info failed')
      );

      // Execute and assert
      await expect(
        ipfsService.fetchFromIPFSAndReencrypt(
          TEST_PUBLIC_KEY,
          TEST_CIDS.encrypted
        )
      ).rejects.toThrow(/Error fetching and reencrypting data/);
    });
  });

  describe('uploadToIPFS', () => {
    it('should upload JSON data to IPFS', async () => {
      // Setup
      const data = { test: true, value: 42 };

      // Execute
      const result = await ipfsService.uploadToIPFS(data);

      // Assert
      expect(mockPinata.upload.public.json).toHaveBeenCalledWith(data);
      expect(mockPinata.upload.public.name).toHaveBeenCalled();
      // Use toMatchObject instead of toEqual to avoid timestamp comparison issues
      expect(result).toMatchObject({
        cid: TEST_IPFS_UPLOAD_RESPONSE.cid,
        size: TEST_IPFS_UPLOAD_RESPONSE.size
      });
    });

    it('should handle upload errors', async () => {
      // Setup
      mockPinata.upload.public.json.mockImplementation(() => {
        throw new Error('Upload failed');
      });

      // Execute and assert
      await expect(ipfsService.uploadToIPFS({ test: true })).rejects.toThrow(
        /Upload failed/
      );
    });
  });

  describe('encryptAndUpload', () => {
    it('should encrypt and upload data to IPFS', async () => {
      // Setup
      mockPinata.upload.public.json.mockReturnThis();
      mockPinata.upload.public.name.mockResolvedValue(
        TEST_IPFS_UPLOAD_RESPONSE
      );

      // Execute
      const result = await ipfsService.encryptAndUpload(
        TEST_BLOCKCHAIN_REQUEST
      );

      // Assert
      expect(encryptUtils.encrypt).toHaveBeenCalledWith(
        expect.any(String),
        'cipher-key'
      );
      expect(mockPinata.upload.public.json).toHaveBeenCalled();
      expect(mockPinata.upload.public.name).toHaveBeenCalled();
      // Use toMatchObject instead of toEqual to avoid timestamp comparison issues
      expect(result).toMatchObject({
        cid: TEST_IPFS_UPLOAD_RESPONSE.cid,
        size: TEST_IPFS_UPLOAD_RESPONSE.size
      });
    });

    it('should handle encryption errors', async () => {
      // Setup
      jest.spyOn(encryptUtils, 'encrypt').mockImplementation(() => {
        throw new Error('Encryption failed');
      });

      // Execute and assert
      await expect(
        ipfsService.encryptAndUpload(TEST_BLOCKCHAIN_REQUEST)
      ).rejects.toThrow(/Encryption failed/);
    });
  });

  describe('fetchAndDecrypt', () => {
    it('should fetch and decrypt data from IPFS', async () => {
      // Setup
      mockPinata.gateways.private.get.mockResolvedValue(TEST_ENCRYPTED_DATA);

      // Execute
      const result = await ipfsService.fetchAndDecrypt(TEST_CIDS.encrypted);

      // Assert
      expect(mockPinata.gateways.private.get).toHaveBeenCalledWith(
        TEST_CIDS.encrypted
      );
      expect(encryptUtils.decrypt).toHaveBeenCalledWith(
        TEST_ENCRYPTED_DATA.encrypted,
        'cipher-key'
      );
      expect(result).toEqual({
        data: { decrypted: 'data' },
        raw: TEST_ENCRYPTED_DATA
      });
    });

    it('should handle errors in fetching data', async () => {
      // Setup
      mockPinata.gateways.private.get.mockResolvedValue({
        error: true,
        message: 'Failed to fetch data'
      });

      // Execute
      const result = await ipfsService.fetchAndDecrypt(TEST_CIDS.invalid);

      // Assert
      expect(result).toEqual({
        data: null,
        raw: null,
        error: true,
        message: 'Failed to fetch data'
      });
    });

    it('should handle decryption errors', async () => {
      // Setup
      mockPinata.gateways.private.get.mockResolvedValue(TEST_ENCRYPTED_DATA);
      jest.spyOn(encryptUtils, 'decrypt').mockImplementation(() => {
        throw new Error('Decryption failed');
      });

      // Execute
      const result = await ipfsService.fetchAndDecrypt(TEST_CIDS.encrypted);

      // Assert
      expect(result).toEqual({
        data: null,
        raw: TEST_ENCRYPTED_DATA,
        error: true,
        message: 'Decryption failed for CID ' + TEST_CIDS.encrypted
      });
    });

    it('should return data as-is if not in expected format', async () => {
      // Setup
      const nonEncryptedData = { data: 'plain text' };
      mockPinata.gateways.private.get.mockResolvedValue(nonEncryptedData);

      // Execute
      const result = await ipfsService.fetchAndDecrypt(TEST_CIDS.regular);

      // Assert
      expect(result).toEqual({
        data: nonEncryptedData,
        raw: nonEncryptedData
      });
    });
  });

  describe('unpinFromIPFS', () => {
    it('should unpin data from IPFS', async () => {
      // Setup
      mockPinata.files.public.delete.mockResolvedValue({ success: true });

      // Execute
      const result = await ipfsService.unpinFromIPFS(TEST_CIDS.encrypted);

      // Assert
      expect(mockPinata.files.public.delete).toHaveBeenCalledWith([
        TEST_CIDS.encrypted
      ]);
      expect(result).toEqual({
        success: true,
        message: `Successfully unpinned CID: ${TEST_CIDS.encrypted}`
      });
    });

    it('should handle errors during unpinning', async () => {
      // Setup
      mockPinata.files.public.delete.mockRejectedValue(
        new Error('Failed to unpin')
      );

      // Execute and assert
      await expect(
        ipfsService.unpinFromIPFS(TEST_CIDS.encrypted)
      ).rejects.toThrow(
        `Failed to unpin CID ${TEST_CIDS.encrypted}: Failed to unpin`
      );
    });
  });
});
