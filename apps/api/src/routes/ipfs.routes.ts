import { Router } from 'express';
import { IPFSController } from '../controllers/ipfs.controller';
import { validateRequest } from '../middleware/validation.middleware';
import {
  cidSchema,
  uploadJsonSchema,
  encryptedUploadSchema,
  reencryptSchema,
  bulkDataSchema,
  batchUploadSchema,
  batchDeleteSchema
} from '../schemas/ipfs.schema';

const router: Router = Router();
const ipfsController = new IPFSController();

// Get data from IPFS by CID
router.get(
  '/data/:cid',
  validateRequest(cidSchema, 'params'),
  ipfsController.getIPFSData
);

// Get data from IPFS by query parameters
router.get(
  '/data',
  validateRequest(cidSchema, 'query'),
  ipfsController.getIPFSData
);

// Get data from multiple CIDs in a single request
router.post(
  '/data/bulk',
  validateRequest(bulkDataSchema),
  ipfsController.getBulkData
);

// Re-encrypt data from IPFS with a specific public key
router.get(
  '/reencrypt/:cid',
  validateRequest(reencryptSchema, 'params'),
  ipfsController.reencryptData
);

// Upload JSON data to IPFS
router.post(
  '/upload/json',
  validateRequest(uploadJsonSchema),
  ipfsController.uploadJsonData
);

// Upload encrypted data to IPFS
router.post(
  '/upload/encrypted',
  validateRequest(encryptedUploadSchema),
  ipfsController.uploadEncryptedData
);

// Batch operations - upload multiple files
router.post(
  '/batch/upload',
  validateRequest(batchUploadSchema),
  ipfsController.uploadBatchFiles
);

// Batch operations - delete multiple files
router.delete(
  '/batch',
  validateRequest(batchDeleteSchema),
  ipfsController.deleteBatchFiles
);

// Delete/unpin data from IPFS
router.delete(
  '/data',
  validateRequest(cidSchema, 'query'),
  ipfsController.deleteIPFSData
);

export default router;

// The routes are working as expected.
// 1. /data/:cid - Get data from IPFS by CID
// 2. /data - Get data from IPFS by query parameters
// 3. /data/bulk - Get data from multiple CIDs in a single request
// 4. /reencrypt/:cid - Re-encrypt data from IPFS with a specific public key
// 5. /upload/json - Upload JSON data to IPFS
// 6. /upload/encrypted - Upload encrypted data to IPFS
// 7. /batch/upload - Batch operations - upload multiple files
// 8. /batch - Batch operations - delete multiple files
// 9. /data - Delete/unpin data from IPFS
