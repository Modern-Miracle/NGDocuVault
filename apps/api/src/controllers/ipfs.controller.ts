import { Request, Response, NextFunction } from 'express';
import { IPFSService } from '../services/ipfs/IPFSService';
import { logger } from '../utils/logger';

/**
 * Controller class for handling IPFS-related operations
 * Provides a layer between the routes and the IPFSService
 */
export class IPFSController {
  private ipfsService: IPFSService;

  constructor() {
    this.ipfsService = new IPFSService();
  }

  /**
   * Get data from IPFS by CID
   */
  public getIPFSData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cid = req.params.cid || (req.query.cid as string);

      if (!cid) {
        res.status(400).json({
          success: false,
          error: 'Missing CID',
          message: 'CID parameter is required'
        });
        return;
      }

      const data = await this.ipfsService.fetchFromIPFS(cid);
      res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Error retrieving IPFS data:', error);
      next(error);
    }
  };

  /**
   * Get data from multiple CIDs in a single request
   */
  public getBulkData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cids } = req.body;

      if (!cids || !Array.isArray(cids) || cids.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: 'Request must include a non-empty array of CIDs'
        });
        return;
      }

      const results = await Promise.all(
        cids.map(async (cid) => {
          try {
            const data = await this.ipfsService.fetchFromIPFS(cid);
            return { cid, success: true, data };
          } catch (error) {
            return {
              cid,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      res.status(200).json({ success: true, results });
    } catch (error) {
      logger.error('Error retrieving bulk IPFS data:', error);
      next(error);
    }
  };

  /**
   * Re-encrypt data from IPFS with a specific public key
   */
  public reencryptData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cid } = req.params;
      const publicKey = req.query.publicKey as string;

      if (!publicKey) {
        res.status(400).json({
          success: false,
          error: 'Missing publicKey parameter',
          message: 'Please provide a publicKey parameter'
        });
        return;
      }

      const data = await this.ipfsService.fetchFromIPFSAndReencrypt(
        publicKey,
        cid
      );
      res.status(200).json({ success: true, data });
    } catch (error) {
      logger.error('Error re-encrypting IPFS data:', error);
      next(error);
    }
  };

  /**
   * Delete/unpin data from IPFS
   */
  public deleteIPFSData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cid = req.params.cid || (req.query.cid as string);

      if (!cid) {
        res.status(400).json({
          success: false,
          error: 'Missing CID',
          message: 'CID parameter is required'
        });
        return;
      }

      const result = await this.ipfsService.unpinFromIPFS(cid);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('Error deleting IPFS data:', error);
      next(error);
    }
  };

  /**
   * Upload JSON data to IPFS
   */
  public uploadJsonData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = req.body;

      if (!data) {
        res.status(400).json({
          success: false,
          error: 'Missing data',
          message: 'Request body must contain data to upload'
        });
        return;
      }

      const result = await this.ipfsService.uploadToIPFS(data);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error('Error uploading JSON to IPFS:', error);
      next(error);
    }
  };

  /**
   * Upload encrypted data to IPFS
   */
  public uploadEncryptedData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const data = req.body;

      if (!data || !data.metadata || !data.document) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: 'Request must include document and metadata'
        });
        return;
      }

      // Generate content hash for the document
      const crypto = await import('crypto');
      const contentHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data.document))
        .digest('hex');

      // Prepare the blockchain update request with required fields
      const blockchainData = {
        document: data.document,
        metadata: {
          name: data.metadata.name || 'Untitled Document',
          documentType: data.metadata.type || data.metadata.documentType || 'general',
          owner: data.metadata.owner,
          timestamp: data.metadata.timestamp || Date.now(),
          contentHash: `0x${contentHash}`,
          signature: data.metadata.signature || '0x', // Placeholder for now
        },
        resource: data.document // Legacy support
      };

      const result = await this.ipfsService.encryptAndUpload(blockchainData);
      res.status(200).json({ 
        success: true,
        data: {
          cid: result.cid || result.IpfsHash,
          size: result.size || result.PinSize,
          contentHash: blockchainData.metadata.contentHash
        }
      });
    } catch (error) {
      logger.error('Error uploading encrypted data to IPFS:', error);
      next(error);
    }
  };

  /**
   * Upload multiple files to IPFS in a batch
   */
  public uploadBatchFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { files } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: 'Request must include an array of files to upload'
        });
        return;
      }

      // Process each file in parallel
      const results = await Promise.all(
        files.map(async (fileData) => {
          try {
            if (!fileData.metadata || !fileData.document) {
              return {
                success: false,
                error: 'Invalid file data',
                message: 'Each file must include document and metadata'
              };
            }

            const result = await this.ipfsService.encryptAndUpload(fileData);
            return { success: true, ...result };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              message: 'Failed to encrypt and upload file'
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        results
      });
    } catch (error) {
      logger.error('Error uploading batch files to IPFS:', error);
      next(error);
    }
  };

  /**
   * Delete multiple files from IPFS in a batch
   */
  public deleteBatchFiles = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cids } = req.body;

      if (!cids || !Array.isArray(cids) || cids.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          message: 'Request must include an array of CIDs to delete'
        });
        return;
      }

      // Process each CID in parallel
      const results = await Promise.all(
        cids.map(async (cid) => {
          try {
            const result = await this.ipfsService.unpinFromIPFS(cid);
            return { cid, success: true, ...result };
          } catch (error) {
            return {
              cid,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              message: `Failed to delete CID ${cid}`
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        results
      });
    } catch (error) {
      logger.error('Error deleting batch files from IPFS:', error);
      next(error);
    }
  };
}
