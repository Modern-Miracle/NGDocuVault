"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var ipfs_controller_1 = require("../controllers/ipfs.controller");
var validation_middleware_1 = require("../middleware/validation.middleware");
var ipfs_schema_1 = require("../schemas/ipfs.schema");
var router = (0, express_1.Router)();
var ipfsController = new ipfs_controller_1.IPFSController();
// Get data from IPFS by CID
router.get('/data/:cid', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.cidSchema, 'params'), ipfsController.getIPFSData);
// Get data from IPFS by query parameters
router.get('/data', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.cidSchema, 'query'), ipfsController.getIPFSData);
// Get data from multiple CIDs in a single request
router.post('/data/bulk', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.bulkDataSchema), ipfsController.getBulkData);
// Re-encrypt data from IPFS with a specific public key
router.get('/reencrypt/:cid', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.reencryptSchema, 'params'), ipfsController.reencryptData);
// Upload JSON data to IPFS
router.post('/upload/json', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.uploadJsonSchema), ipfsController.uploadJsonData);
// Upload encrypted data to IPFS
router.post('/upload/encrypted', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.encryptedUploadSchema), ipfsController.uploadEncryptedData);
// Batch operations - upload multiple files
router.post('/batch/upload', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.batchUploadSchema), ipfsController.uploadBatchFiles);
// Batch operations - delete multiple files
router.delete('/batch', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.batchDeleteSchema), ipfsController.deleteBatchFiles);
// Delete/unpin data from IPFS
router.delete('/data', (0, validation_middleware_1.validateRequest)(ipfs_schema_1.cidSchema, 'query'), ipfsController.deleteIPFSData);
exports.default = router;
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
