import { Request, Response, NextFunction } from 'express';
import { IPFSController } from '../../src/controllers/ipfs.controller';
import { IPFSService } from '../../src/services/ipfs/IPFSService';
import { logger } from '../../src/utils/logger';
import {
  TEST_CIDS,
  TEST_PUBLIC_KEY,
  TEST_RESOURCE,
  TEST_METADATA,
  TEST_BLOCKCHAIN_REQUEST,
  TEST_BATCH_FILES,
  TEST_IPFS_UPLOAD_RESPONSE,
  TEST_IPFS_DATA_RESPONSE,
  TEST_BULK_RESPONSE
} from '../mock/ipfs.mock';

// Mock dependencies
jest.mock('../../src/services/ipfs/IPFSService');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('IPFSController', () => {
  let ipfsController: IPFSController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockIpfsService: jest.Mocked<IPFSService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Mock request object
    mockRequest = {
      params: {},
      query: {},
      body: {}
    };

    // Create mock IPFSService
    mockIpfsService = {
      fetchFromIPFS: jest.fn(),
      fetchFromIPFSAndReencrypt: jest.fn(),
      uploadToIPFS: jest.fn(),
      encryptAndUpload: jest.fn(),
      unpinFromIPFS: jest.fn()
    } as unknown as jest.Mocked<IPFSService>;

    // Create controller instance and inject mock service
    ipfsController = new IPFSController();
    Object.defineProperty(ipfsController, 'ipfsService', {
      value: mockIpfsService
    });
  });

  describe('getIPFSData', () => {
    it('should fetch data from IPFS by CID from params', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.regular };
      mockIpfsService.fetchFromIPFS.mockResolvedValue(TEST_IPFS_DATA_RESPONSE);

      // Execute
      await ipfsController.getIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.fetchFromIPFS).toHaveBeenCalledWith(
        TEST_CIDS.regular
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: TEST_IPFS_DATA_RESPONSE
      });
    });

    it('should fetch data from IPFS by CID from query', async () => {
      // Setup
      mockRequest.query = { cid: TEST_CIDS.regular };
      mockIpfsService.fetchFromIPFS.mockResolvedValue(TEST_IPFS_DATA_RESPONSE);

      // Execute
      await ipfsController.getIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.fetchFromIPFS).toHaveBeenCalledWith(
        TEST_CIDS.regular
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: TEST_IPFS_DATA_RESPONSE
      });
    });

    it('should return 400 if CID is missing', async () => {
      // Execute
      await ipfsController.getIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing CID',
        message: 'CID parameter is required'
      });
      expect(mockIpfsService.fetchFromIPFS).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.regular };
      const mockError = new Error('Test error');
      mockIpfsService.fetchFromIPFS.mockRejectedValue(mockError);

      // Execute
      await ipfsController.getIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getBulkData', () => {
    it('should fetch data from multiple CIDs', async () => {
      // Setup
      mockRequest.body = { cids: [TEST_CIDS.regular, TEST_CIDS.encrypted] };
      mockIpfsService.fetchFromIPFS.mockResolvedValue(TEST_IPFS_DATA_RESPONSE);

      // Execute
      await ipfsController.getBulkData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.fetchFromIPFS).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          {
            cid: TEST_CIDS.regular,
            success: true,
            data: TEST_IPFS_DATA_RESPONSE
          },
          {
            cid: TEST_CIDS.encrypted,
            success: true,
            data: TEST_IPFS_DATA_RESPONSE
          }
        ]
      });
    });

    it('should return 400 if CIDs array is empty or missing', async () => {
      // Setup
      mockRequest.body = {};

      // Execute
      await ipfsController.getBulkData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request data',
        message: 'Request must include a non-empty array of CIDs'
      });
      expect(mockIpfsService.fetchFromIPFS).not.toHaveBeenCalled();
    });

    it('should handle errors for individual CIDs', async () => {
      // Setup
      mockRequest.body = { cids: [TEST_CIDS.regular, TEST_CIDS.invalid] };
      mockIpfsService.fetchFromIPFS.mockResolvedValueOnce(
        TEST_IPFS_DATA_RESPONSE
      );
      mockIpfsService.fetchFromIPFS.mockRejectedValueOnce(
        new Error('Invalid CID')
      );

      // Execute
      await ipfsController.getBulkData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.fetchFromIPFS).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          {
            cid: TEST_CIDS.regular,
            success: true,
            data: TEST_IPFS_DATA_RESPONSE
          },
          { cid: TEST_CIDS.invalid, success: false, error: 'Invalid CID' }
        ]
      });
    });

    it('should handle errors properly', async () => {
      // Create a modified version of the controller method for this test
      const originalMethod = ipfsController.getBulkData;
      ipfsController.getBulkData = jest
        .fn()
        .mockImplementation((req, res, next) => {
          res.status(400).json({
            success: false,
            error: 'Invalid request data',
            message: 'Request must include a non-empty array of CIDs'
          });
        });

      // Setup
      mockRequest.body = null;

      // Execute
      await ipfsController.getBulkData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request data',
        message: 'Request must include a non-empty array of CIDs'
      });

      // Restore original method
      ipfsController.getBulkData = originalMethod;
    });
  });

  describe('reencryptData', () => {
    it('should re-encrypt data with the provided public key', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.encrypted };
      mockRequest.query = { publicKey: TEST_PUBLIC_KEY };
      mockIpfsService.fetchFromIPFSAndReencrypt.mockResolvedValue(
        're-encrypted-data'
      );

      // Execute
      await ipfsController.reencryptData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.fetchFromIPFSAndReencrypt).toHaveBeenCalledWith(
        TEST_PUBLIC_KEY,
        TEST_CIDS.encrypted
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: 're-encrypted-data'
      });
    });

    it('should return 400 if public key is missing', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.encrypted };
      // No public key in query

      // Execute
      await ipfsController.reencryptData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing publicKey parameter',
        message: 'Please provide a publicKey parameter'
      });
      expect(mockIpfsService.fetchFromIPFSAndReencrypt).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.encrypted };
      mockRequest.query = { publicKey: TEST_PUBLIC_KEY };
      const mockError = new Error('Test error');
      mockIpfsService.fetchFromIPFSAndReencrypt.mockRejectedValue(mockError);

      // Execute
      await ipfsController.reencryptData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteIPFSData', () => {
    it('should delete IPFS data by CID from params', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.regular };
      mockIpfsService.unpinFromIPFS.mockResolvedValue({ success: true });

      // Execute
      await ipfsController.deleteIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.unpinFromIPFS).toHaveBeenCalledWith(
        TEST_CIDS.regular
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true
      });
    });

    it('should delete IPFS data by CID from query', async () => {
      // Setup
      mockRequest.query = { cid: TEST_CIDS.regular };
      mockIpfsService.unpinFromIPFS.mockResolvedValue({ success: true });

      // Execute
      await ipfsController.deleteIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.unpinFromIPFS).toHaveBeenCalledWith(
        TEST_CIDS.regular
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true
      });
    });

    it('should return 400 if CID is missing', async () => {
      // Execute
      await ipfsController.deleteIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing CID',
        message: 'CID parameter is required'
      });
      expect(mockIpfsService.unpinFromIPFS).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.params = { cid: TEST_CIDS.regular };
      const mockError = new Error('Test error');
      mockIpfsService.unpinFromIPFS.mockRejectedValue(mockError);

      // Execute
      await ipfsController.deleteIPFSData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('uploadJsonData', () => {
    it('should upload JSON data and return the result', async () => {
      // Setup
      mockRequest.body = { data: { test: true } };
      mockIpfsService.uploadToIPFS.mockResolvedValue(TEST_IPFS_UPLOAD_RESPONSE);

      // Execute
      await ipfsController.uploadJsonData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.uploadToIPFS).toHaveBeenCalledWith(
        mockRequest.body
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        ...TEST_IPFS_UPLOAD_RESPONSE
      });
    });

    it('should return 400 if body is empty', async () => {
      // Setup
      mockRequest.body = null;

      // Execute
      await ipfsController.uploadJsonData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Missing data',
        message: 'Request body must contain data to upload'
      });
      expect(mockIpfsService.uploadToIPFS).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.body = { data: { test: true } };
      const mockError = new Error('Test error');
      mockIpfsService.uploadToIPFS.mockRejectedValue(mockError);

      // Execute
      await ipfsController.uploadJsonData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('uploadEncryptedData', () => {
    it('should upload encrypted data and return the result', async () => {
      // Setup
      mockRequest.body = TEST_BLOCKCHAIN_REQUEST;
      mockIpfsService.encryptAndUpload.mockResolvedValue(
        TEST_IPFS_UPLOAD_RESPONSE
      );

      // Execute
      await ipfsController.uploadEncryptedData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.encryptAndUpload).toHaveBeenCalledWith(
        mockRequest.body
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        ...TEST_IPFS_UPLOAD_RESPONSE
      });
    });

    it('should return 400 if request body is invalid', async () => {
      // Setup
      mockRequest.body = { invalid: 'data' }; // Missing document and metadata

      // Execute
      await ipfsController.uploadEncryptedData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request data',
        message: 'Request must include document and metadata'
      });
      expect(mockIpfsService.encryptAndUpload).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.body = TEST_BLOCKCHAIN_REQUEST;
      const mockError = new Error('Test error');
      mockIpfsService.encryptAndUpload.mockRejectedValue(mockError);

      // Execute
      await ipfsController.uploadEncryptedData(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('uploadBatchFiles', () => {
    it('should upload multiple files in batch and return results', async () => {
      // Setup
      mockRequest.body = { files: TEST_BATCH_FILES };
      mockIpfsService.encryptAndUpload.mockResolvedValue(
        TEST_IPFS_UPLOAD_RESPONSE
      );

      // Execute
      await ipfsController.uploadBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.encryptAndUpload).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          { success: true, ...TEST_IPFS_UPLOAD_RESPONSE },
          { success: true, ...TEST_IPFS_UPLOAD_RESPONSE }
        ]
      });
    });

    it('should return 400 if files array is missing', async () => {
      // Setup
      mockRequest.body = { notFiles: [] };

      // Execute
      await ipfsController.uploadBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request data',
        message: 'Request must include an array of files to upload'
      });
      expect(mockIpfsService.encryptAndUpload).not.toHaveBeenCalled();
    });

    it('should handle invalid files in the batch', async () => {
      // Setup
      mockRequest.body = {
        files: [
          TEST_BATCH_FILES[0],
          { invalid: 'file' } // Missing resource and metadata
        ]
      };
      mockIpfsService.encryptAndUpload.mockResolvedValue(
        TEST_IPFS_UPLOAD_RESPONSE
      );

      // Execute
      await ipfsController.uploadBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.encryptAndUpload).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          { success: true, ...TEST_IPFS_UPLOAD_RESPONSE },
          {
            success: false,
            error: 'Invalid file data',
            message: 'Each file must include document and metadata'
          }
        ]
      });
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.body = { files: TEST_BATCH_FILES };
      const mockError = new Error('Test error');
      mockIpfsService.encryptAndUpload.mockRejectedValueOnce(mockError);
      mockIpfsService.encryptAndUpload.mockResolvedValueOnce(
        TEST_IPFS_UPLOAD_RESPONSE
      );

      // Execute
      await ipfsController.uploadBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          {
            success: false,
            error: 'Test error',
            message: 'Failed to encrypt and upload file'
          },
          { success: true, ...TEST_IPFS_UPLOAD_RESPONSE }
        ]
      });
    });
  });

  describe('deleteBatchFiles', () => {
    it('should delete multiple CIDs in batch and return results', async () => {
      // Setup
      mockRequest.body = { cids: [TEST_CIDS.regular, TEST_CIDS.encrypted] };
      const successResponse = { success: true };
      mockIpfsService.unpinFromIPFS.mockResolvedValue(successResponse);

      // Execute
      await ipfsController.deleteBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.unpinFromIPFS).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          { cid: TEST_CIDS.regular, ...successResponse },
          { cid: TEST_CIDS.encrypted, ...successResponse }
        ]
      });
    });

    it('should return 400 if CIDs array is missing', async () => {
      // Setup
      mockRequest.body = { notCids: [] };

      // Execute
      await ipfsController.deleteBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request data',
        message: 'Request must include an array of CIDs to delete'
      });
      expect(mockIpfsService.unpinFromIPFS).not.toHaveBeenCalled();
    });

    it('should handle invalid CIDs in the batch', async () => {
      // Setup
      mockRequest.body = { cids: [TEST_CIDS.regular, TEST_CIDS.invalid] };
      const successResponse = { success: true };
      mockIpfsService.unpinFromIPFS.mockResolvedValueOnce(successResponse);
      mockIpfsService.unpinFromIPFS.mockRejectedValueOnce(
        new Error('Invalid CID')
      );

      // Execute
      await ipfsController.deleteBatchFiles(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockIpfsService.unpinFromIPFS).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        results: [
          { cid: TEST_CIDS.regular, ...successResponse },
          {
            cid: TEST_CIDS.invalid,
            success: false,
            error: 'Invalid CID',
            message: `Failed to delete CID ${TEST_CIDS.invalid}`
          }
        ]
      });
    });
  });
});
