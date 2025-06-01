import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { validateRequest } from '../../src/middleware/validation.middleware';
import { IPFSController } from '../../src/controllers/ipfs.controller';
import { IPFSService } from '../../src/services/ipfs/IPFSService';
import {
  cidSchema,
  bulkDataSchema,
  encryptedUploadSchema,
  uploadJsonSchema,
  reencryptSchema,
  batchUploadSchema,
  batchDeleteSchema
} from '../../src/schemas/ipfs.schema';
import {
  TEST_CIDS,
  TEST_PUBLIC_KEY,
  TEST_BLOCKCHAIN_REQUEST,
  TEST_BATCH_FILES,
  TEST_IPFS_UPLOAD_RESPONSE,
  TEST_IPFS_DATA_RESPONSE,
  TEST_BULK_RESPONSE
} from '../mock/ipfs.mock';

// Mocks
jest.mock('../../src/services/ipfs/IPFSService');
jest.mock('../../src/controllers/ipfs.controller');
jest.mock('../../src/utils/logger');

describe('IPFS Routes Integration Tests', () => {
  let app: express.Application;
  let server: any;
  let mockIPFSController: jest.Mocked<IPFSController>;

  beforeAll(() => {
    // Create mock controller
    mockIPFSController = {
      getIPFSData: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          data: TEST_IPFS_DATA_RESPONSE.data,
          metadata: TEST_IPFS_DATA_RESPONSE.metadata
        });
      }),
      getBulkData: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          results: Object.entries(TEST_BULK_RESPONSE).map(([cid, data]) => ({
            cid,
            data: data.data,
            metadata:
              data.raw && 'metadata' in data.raw ? data.raw.metadata : {},
            success: true
          }))
        });
      }),
      reencryptData: jest.fn().mockImplementation((req, res, next) => {
        const { cid } = req.params;
        const { publicKey } = req.query;

        if (!publicKey) {
          return res.status(400).json({
            success: false,
            error: 'Missing publicKey parameter',
            message: 'Please provide a publicKey parameter'
          });
        }

        res.status(200).json({
          success: true,
          data: 're-encrypted-data'
        });
      }),
      deleteIPFSData: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          message: 'Successfully unpinned'
        });
      }),
      uploadJsonData: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          ...TEST_IPFS_UPLOAD_RESPONSE
        });
      }),
      uploadEncryptedData: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          ...TEST_IPFS_UPLOAD_RESPONSE
        });
      }),
      uploadBatchFiles: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          results: TEST_BATCH_FILES.map(() => ({
            success: true,
            ...TEST_IPFS_UPLOAD_RESPONSE
          }))
        });
      }),
      deleteBatchFiles: jest.fn().mockImplementation((req, res, next) => {
        res.status(200).json({
          success: true,
          results: (req.body.cids || []).map((cid: string) => ({
            cid,
            success: true
          }))
        });
      })
    } as unknown as jest.Mocked<IPFSController>;

    // Replace IPFSController constructor with mock
    (IPFSController as jest.Mock) = jest
      .fn()
      .mockImplementation(() => mockIPFSController);

    // Create test app with routes
    app = express();
    app.use(express.json());

    // Setup IPFS routes manually - reflecting our updated routes structure
    const router = express.Router();

    // Get data from IPFS by CID
    router.get(
      '/data/:cid',
      validateRequest(cidSchema, 'params'),
      mockIPFSController.getIPFSData
    );

    router.get(
      '/data',
      validateRequest(cidSchema, 'query'),
      mockIPFSController.getIPFSData
    );

    // Get data from multiple CIDs in a single request
    router.post(
      '/data/bulk',
      validateRequest(bulkDataSchema),
      mockIPFSController.getBulkData
    );

    // Re-encrypt data from IPFS with a specific public key
    router.get('/reencrypt/:cid', mockIPFSController.reencryptData);

    // Delete/unpin data from IPFS
    router.delete(
      '/data',
      validateRequest(cidSchema, 'query'),
      mockIPFSController.deleteIPFSData
    );

    // Upload JSON data to IPFS
    router.post(
      '/upload/json',
      validateRequest(uploadJsonSchema),
      mockIPFSController.uploadJsonData
    );

    // Upload encrypted data to IPFS
    router.post(
      '/upload/encrypted',
      validateRequest(encryptedUploadSchema),
      mockIPFSController.uploadEncryptedData
    );

    // Batch operations - upload multiple files
    router.post(
      '/batch/upload',
      validateRequest(batchUploadSchema),
      mockIPFSController.uploadBatchFiles
    );

    // Batch operations - delete multiple files
    router.delete(
      '/batch',
      validateRequest(batchDeleteSchema),
      mockIPFSController.deleteBatchFiles
    );

    // Mount router on app
    app.use('/api/v1/ipfs', router);

    // Error handling middleware
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error in integration test:', err);
      res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
      });
    });

    // Start server on a random port
    server = app.listen(0);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/ipfs/data/:cid', () => {
    it('should fetch data by CID in path parameter', async () => {
      const response = await request(app).get(
        `/api/v1/ipfs/data/${TEST_CIDS.regular}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: TEST_IPFS_DATA_RESPONSE.data,
        metadata: TEST_IPFS_DATA_RESPONSE.metadata
      });
      expect(mockIPFSController.getIPFSData).toHaveBeenCalled();
    });

    it('should return validation error for invalid CID', async () => {
      const response = await request(app).get('/api/v1/ipfs/data/');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('validationError', true);
      expect(response.body).toHaveProperty('errors');
      expect(mockIPFSController.getIPFSData).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/ipfs/data', () => {
    it('should fetch data by CID in query parameter', async () => {
      const response = await request(app).get(
        `/api/v1/ipfs/data?cid=${TEST_CIDS.regular}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: TEST_IPFS_DATA_RESPONSE.data,
        metadata: TEST_IPFS_DATA_RESPONSE.metadata
      });
      expect(mockIPFSController.getIPFSData).toHaveBeenCalled();
    });

    it('should return validation error for missing CID', async () => {
      const response = await request(app).get('/api/v1/ipfs/data');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('validationError', true);
      expect(response.body).toHaveProperty('errors');
      expect(mockIPFSController.getIPFSData).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/ipfs/data/bulk', () => {
    it('should fetch multiple CIDs in bulk', async () => {
      const response = await request(app)
        .post('/api/v1/ipfs/data/bulk')
        .send({ cids: [TEST_CIDS.regular, TEST_CIDS.encrypted] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(mockIPFSController.getBulkData).toHaveBeenCalled();
    });

    it('should return validation error for missing CIDs array', async () => {
      const response = await request(app)
        .post('/api/v1/ipfs/data/bulk')
        .send({ not_cids: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('validationError', true);
      expect(response.body).toHaveProperty('errors');
      expect(mockIPFSController.getBulkData).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/ipfs/reencrypt/:cid', () => {
    it('should re-encrypt data with provided public key', async () => {
      const response = await request(app)
        .get(`/api/v1/ipfs/reencrypt/${TEST_CIDS.encrypted}`)
        .query({ publicKey: TEST_PUBLIC_KEY });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: 're-encrypted-data'
      });
      expect(mockIPFSController.reencryptData).toHaveBeenCalled();
    });

    it('should return error if public key is missing', async () => {
      const response = await request(app).get(
        `/api/v1/ipfs/reencrypt/${TEST_CIDS.encrypted}`
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        error: 'Missing publicKey parameter',
        message: 'Please provide a publicKey parameter'
      });
      expect(mockIPFSController.reencryptData).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/ipfs/data', () => {
    it('should delete data by CID in query parameter', async () => {
      const response = await request(app).delete(
        `/api/v1/ipfs/data?cid=${TEST_CIDS.regular}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Successfully unpinned'
      });
      expect(mockIPFSController.deleteIPFSData).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/ipfs/upload/json', () => {
    it('should upload JSON data to IPFS', async () => {
      const response = await request(app)
        .post('/api/v1/ipfs/upload/json')
        .send({ data: { test: true } });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        ...TEST_IPFS_UPLOAD_RESPONSE
      });
      expect(mockIPFSController.uploadJsonData).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/ipfs/upload/encrypted', () => {
    it('should upload encrypted data to IPFS', async () => {
      const response = await request(app)
        .post('/api/v1/ipfs/upload/encrypted')
        .send(TEST_BLOCKCHAIN_REQUEST);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        ...TEST_IPFS_UPLOAD_RESPONSE
      });
      expect(mockIPFSController.uploadEncryptedData).toHaveBeenCalled();
    });

    it('should return validation error for invalid encrypted data', async () => {
      const response = await request(app)
        .post('/api/v1/ipfs/upload/encrypted')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('validationError', true);
      expect(response.body).toHaveProperty('errors');
      expect(mockIPFSController.uploadEncryptedData).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/ipfs/batch/upload', () => {
    it('should upload multiple files in batch', async () => {
      const response = await request(app)
        .post('/api/v1/ipfs/batch/upload')
        .send({ files: TEST_BATCH_FILES });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        results: TEST_BATCH_FILES.map(() => ({
          success: true,
          ...TEST_IPFS_UPLOAD_RESPONSE
        }))
      });
      expect(mockIPFSController.uploadBatchFiles).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/ipfs/batch', () => {
    it('should delete multiple CIDs in batch', async () => {
      const cids = [TEST_CIDS.regular, TEST_CIDS.encrypted];

      const response = await request(app)
        .delete('/api/v1/ipfs/batch')
        .send({ cids });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        results: cids.map((cid) => ({
          cid,
          success: true
        }))
      });
      expect(mockIPFSController.deleteBatchFiles).toHaveBeenCalled();
    });
  });
});
