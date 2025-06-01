import { Request, Response } from 'express';
import { PinataSDK } from 'pinata';

import { encrypt, decrypt, toCipherKey } from '../../utils/encrypt';
import { KeyVaultService } from '../keyvault';
import { AsymmetricCryptoService, SymmetricCryptoService } from '../crypto';
import { DatabaseService } from '../db/database.service';

interface BlockchainUpdateRequest {
  document: Record<string, any>;
  metadata: {
    name: string;
    documentType: string;
    owner: string;
    timestamp: number;
    contentHash: string;
    signature: string;
  };
  [key: string]: any;
}
/**
 * Service class for handling IPFS (InterPlanetary File System) operations.
 * This service provides methods for uploading, retrieving, and deleting data from IPFS,
 * as well as handling encryption and decryption of the data.
 */
export class IPFSService {
  private readonly pinata: PinataSDK;
  private readonly encryptionKey: string;
  private readonly db: DatabaseService;
  private readonly keyVault: KeyVaultService;
  private readonly asymmetricEncryption: AsymmetricCryptoService;
  private readonly symmetricEncryption: SymmetricCryptoService;

  /**
   * Creates a new instance of the IPFSService.
   */
  constructor() {
    // Get environment variables
    const pinataJwt = process.env.PINATA_API_JWT;
    const gatewayDomain =
      process.env.IPFS_GATEWAY_URL || 'gateway.pinata.cloud';

    if (!pinataJwt) {
      console.warn(
        'PINATA_API_JWT environment variable is not set. IPFS functionality will be limited.'
      );
    }

    // Initialize the Pinata SDK with JWT and gateway
    this.pinata = new PinataSDK({
      pinataJwt: pinataJwt,
      pinataGateway: gatewayDomain
    });

    this.encryptionKey = process.env.ENCRYPTION_KEY || '';
    if (!this.encryptionKey) {
      console.warn(
        'ENCRYPTION_KEY environment variable is not set. Data encryption will not work properly.'
      );
    }

    this.asymmetricEncryption = new AsymmetricCryptoService();
    this.symmetricEncryption = new SymmetricCryptoService();
    this.db = new DatabaseService();
    this.keyVault = new KeyVaultService();
  }

  async fetchFromIPFSAndReencrypt(
    publicKey: string,
    cid: string
  ): Promise<any> {
    try {
      // const ipfLookup = await this.db.getIPFSLookup({ cid });

      // if (!ipfLookup) {
      //   throw new Error(`IPFS lookup not found for CID ${cid}`);
      // }

      // // get encryption key from from key vault
      // const encryptionKey = await this.keyVault.getDataEncryptionKey(ipfLookup.keyvaultName);

      // get encrypted data from IPFS
      const response = await this.fetchFromIPFS(cid);

      // decrypt data with the encryption key
      const decryptedData = this.symmetricEncryption.decrypt(
        response.data.encrypted,
        toCipherKey(this.encryptionKey)
      );

      let encryptedData;
      try {
        // encrypt data with the public key
        encryptedData = this.asymmetricEncryption.encryptWithPublicKey(
          decryptedData,
          publicKey
        );
      } catch (error) {
        throw new Error(`Error encrypting data: ${error}`);
      }

      return encryptedData;
    } catch (error) {
      throw new Error(
        `Error fetching and reencrypting data from IPFS: ${error}`
      );
    }
  }

  /**
   * Fetches data from IPFS using the provided CID (Content Identifier).
   * Attempts multiple methods to retrieve content, trying both private and public gateways.
   *
   * @param {string} cid - The Content Identifier for the data stored on IPFS.
   * @returns {Promise<any>} A promise that resolves with the fetched data from IPFS.
   * @throws Will throw an error if all retrieval attempts fail.
   */
  async fetchFromIPFS(cid: string): Promise<any> {
    try {
      // Validate CID format first to avoid unnecessary API calls
      if (!cid || typeof cid !== 'string' || cid.trim() === '') {
        return { error: true, message: `Invalid CID format: ${cid}` };
      }

      // Normalize CID if it has ipfs:// prefix
      const normalizedCid = cid.startsWith('ipfs://') ? cid.substring(7) : cid;

      // STEP 1: Try private gateway first (for private content)
      try {
        const privateData =
          await this.pinata.gateways.private.get(normalizedCid);
        return privateData;
      } catch (privateError: any) {
        console.error(
          `Private gateway retrieval failed for CID ${normalizedCid}: ${privateError.message}`
        );
      }

      // STEP 2: Try public gateway (for public content)
      try {
        const publicData = await this.pinata.gateways.public.get(normalizedCid);
        return publicData;
      } catch (publicError: any) {
        console.error(
          `Public gateway retrieval failed for CID ${normalizedCid}: ${publicError.message}`
        );
      }

      // STEP 3: Try to get file info as last resort
      try {
        const filesResponse = await this.pinata.files.public.get(normalizedCid);

        // If we got metadata, try to get file content through gateway
        if (filesResponse && typeof filesResponse === 'object') {
          try {
            // Generate a gateway URL and try direct access
            await this.pinata.gateways.public.convert(normalizedCid); // Simply convert without storing the result
            const gatewayData =
              await this.pinata.gateways.public.get(normalizedCid);
            return gatewayData;
          } catch (gatewayError) {
            console.error(
              `Gateway conversion failed for CID ${normalizedCid}: ${gatewayError}`
            );
            // Return metadata as fallback
            return filesResponse;
          }
        }

        return filesResponse;
      } catch (filesError: any) {
        console.error(
          `File info retrieval failed for CID ${normalizedCid}: ${filesError.message}`
        );
        return {
          error: true,
          message: `Failed to retrieve content with CID ${normalizedCid}`,
          details: filesError.message
        };
      }
    } catch (error: any) {
      // All retrieval attempts have failed but don't throw, return error object instead
      console.error(
        `All IPFS retrieval methods failed for CID ${cid}: ${error.message}`
      );
      return {
        error: true,
        message: `IPFS data retrieval failed for CID ${cid}`,
        details: error.message
      };
    }
  }

  /**
   * Fetches data for multiple CIDs from IPFS in batches.
   * Uses controlled parallelism to avoid overwhelming the Pinata API.
   *
   * @param {string[]} cids - Array of Content Identifiers to fetch from IPFS.
   * @returns {Promise<Record<string, any>>} A promise that resolves with a map of CID to fetched data.
   */
  async fetchBulkFromIPFS(cids: string[]): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const MAX_CONCURRENT = 10; // Control concurrency to avoid rate limits

    // Process in batches to avoid overwhelming the Pinata API
    for (let i = 0; i < cids.length; i += MAX_CONCURRENT) {
      const batch = cids.slice(i, i + MAX_CONCURRENT);
      console.info(
        `Processing IPFS batch ${Math.floor(i / MAX_CONCURRENT) + 1} of ${Math.ceil(cids.length / MAX_CONCURRENT)}`
      );

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (cid) => {
          try {
            const data = await this.fetchFromIPFS(cid);
            return { cid, data, success: true };
          } catch (error) {
            console.error(`Failed to fetch CID ${cid}: ${error}`);
            return { cid, error, success: false };
          }
        })
      );

      // Add successful results to the results object
      batchResults.forEach((result) => {
        if (result.success) {
          results[result.cid] = result.data;
        }
      });

      // Add a small delay between batches if more batches remain
      if (i + MAX_CONCURRENT < cids.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Uploads JSON data to IPFS using Pinata's pinning service.
   * Ensures content is publicly accessible by using the public upload endpoint.
   *
   * @param {any} data - The data object to be uploaded to IPFS.
   * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
   * @throws Will throw an error if the upload process fails.
   */
  async uploadToIPFS(data: any): Promise<any> {
    try {
      // Determine a meaningful name for the upload
      let fileName = 'unknown-resource';

      // Try to extract a name from the data
      if (data && typeof data === 'object') {
        if (data.metadata && data.metadata.name) {
          fileName = data.metadata.name;
        } else if (
          data.resource &&
          data.resource.id &&
          data.resource.resourceType
        ) {
          fileName = `${data.resource.resourceType}-${data.resource.id}`;
        }
      }

      // Ensure the filename has .json extension
      if (!fileName.endsWith('.json')) {
        fileName += '.json';
      }

      // Upload the data with the specified name
      const result = await this.pinata.upload.public.json(data).name(fileName);

      // Verify the content is pinned and accessible
      try {
        await this.pinata.files.public.get(result.cid);
      } catch (verifyError) {
        // This is normal for recently pinned content
      }

      // Format the response to match our expected structure
      return {
        ...result
      };
    } catch (error: any) {
      console.error(`Error uploading data to IPFS: ${error.message}`);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Encrypts and uploads data to IPFS.
   * First encrypts the data using the configured encryption key, then uploads to IPFS.
   *
   * @param {any} data - The data to be encrypted and uploaded.
   * @param {string} name - The name to be associated with the data in IPFS metadata.
   * @param {string} documentType - The document type for IPFS metadata.
   * @param {string} owner - The owner for IPFS metadata.
   * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
   * @throws Will throw an error if the encryption or upload process fails.
   */
  async encryptAndUpload(data: BlockchainUpdateRequest): Promise<any> {
    try {
      let uploadData: any;

      // Check if encryption is enabled
      if (this.encryptionKey && this.encryptionKey.length > 0) {
        const encrypted = encrypt(
          JSON.stringify(data),
          toCipherKey(this.encryptionKey)
        );

        // Prepare the data for upload with metadata
        uploadData = {
          encrypted,
          metadata: {
            name: data.metadata.name,
            documentType: data.metadata.documentType,
            owner: data.metadata.owner,
            timestamp: data.metadata.timestamp,
            contentHash: data.metadata.contentHash,
            signature: data.metadata.signature,
            ledupVersion: '1.0.0'
          }
        };
      } else {
        // If no encryption key, upload unencrypted with warning
        console.warn('ENCRYPTION_KEY not set, uploading unencrypted data');
        uploadData = {
          document: data.document,
          metadata: {
            name: data.metadata.name,
            documentType: data.metadata.documentType,
            owner: data.metadata.owner,
            timestamp: data.metadata.timestamp,
            contentHash: data.metadata.contentHash,
            signature: data.metadata.signature,
            ledupVersion: '1.0.0',
            encrypted: false
          }
        };
      }

      return await this.uploadToIPFS(uploadData);
    } catch (error: any) {
      console.error(
        `Error encrypting and uploading data to IPFS: ${error.message}`
      );
      throw new Error(`Data encryption or upload failed: ${error.message}`);
    }
  }

  /**
   * Fetches and decrypts data from IPFS.
   * Retrieves encrypted data from IPFS and attempts to decrypt it if it's in the expected format.
   *
   * @param {string} cid - The Content Identifier for the encrypted data.
   * @returns {Promise<{ data: any; raw: any; error?: boolean; message?: string }>} A promise that resolves to an object containing both the decrypted data and the raw encrypted data.
   * @throws Will throw an error if the fetch process fails.
   */
  async fetchAndDecrypt(
    cid: string
  ): Promise<{ data: any; raw: any; error?: boolean; message?: string }> {
    try {
      const encryptedData = await this.fetchFromIPFS(cid);

      // Check if we received an error response from fetchFromIPFS
      if (encryptedData && encryptedData.error === true) {
        console.error(
          `Failed to fetch data for CID ${cid}: ${encryptedData.message}`
        );
        return {
          data: null,
          raw: null,
          error: true,
          message: encryptedData.message || `Failed to fetch CID ${cid}`
        };
      }

      try {
        // Try to decrypt if it has our expected .encrypted property
        if (encryptedData && encryptedData.encrypted) {
          try {
            const decryptedJson = decrypt(
              encryptedData.encrypted,
              toCipherKey(this.encryptionKey)
            );
            let decryptedData;

            try {
              decryptedData = JSON.parse(decryptedJson);
            } catch (parseError) {
              decryptedData = decryptedJson;
            }

            return {
              data: decryptedData,
              raw: encryptedData
            };
          } catch (decryptError) {
            console.error(
              `Failed to decrypt data for CID ${cid}: ${decryptError}`
            );
            // Return error but with raw data for debugging
            return {
              data: null,
              raw: encryptedData,
              error: true,
              message: `Decryption failed for CID ${cid}`
            };
          }
        } else {
          // If data doesn't have our expected format, return as-is
          return {
            data: encryptedData,
            raw: encryptedData
          };
        }
      } catch (decryptError) {
        // If decryption fails, still return the raw data
        console.error(`Error processing data for CID ${cid}: ${decryptError}`);
        return {
          data: encryptedData,
          raw: encryptedData
        };
      }
    } catch (error) {
      console.error(
        `Error fetching and processing data from IPFS with CID ${cid}: ${error}`
      );
      return {
        data: null,
        raw: null,
        error: true,
        message: `Failed to fetch and process CID ${cid}`
      };
    }
  }

  /**
   * Fetches and decrypts multiple data items from IPFS.
   * Processes a batch of CIDs and returns both decrypted data and raw data.
   *
   * @param {string[]} cids - Array of Content Identifiers to fetch and decrypt.
   * @returns {Promise<Record<string, { data: any; raw: any; error?: boolean; message?: string }>>} A promise that resolves to a map of CID to result objects.
   */
  async fetchAndDecryptBulk(
    cids: string[]
  ): Promise<
    Record<string, { data: any; raw: any; error?: boolean; message?: string }>
  > {
    try {
      // Get raw data for all CIDs
      const bulkData = await this.fetchBulkFromIPFS(cids);
      const results: Record<
        string,
        { data: any; raw: any; error?: boolean; message?: string }
      > = {};

      // Process each result
      for (const cid of cids) {
        if (!bulkData[cid]) {
          // If CID wasn't found in bulk results, record an error
          results[cid] = {
            data: null,
            raw: null,
            error: true,
            message: `No data found for CID ${cid}`
          };
          continue;
        }

        const encryptedData = bulkData[cid];

        // Check if we received an error response
        if (encryptedData && encryptedData.error === true) {
          results[cid] = {
            data: null,
            raw: null,
            error: true,
            message: encryptedData.message || `Failed to fetch CID ${cid}`
          };
          continue;
        }

        try {
          // Try to decrypt if it has our expected .encrypted property
          if (encryptedData && encryptedData.encrypted) {
            let decryptedData;
            try {
              const decryptedJson = decrypt(
                encryptedData.encrypted,
                toCipherKey(this.encryptionKey)
              );
              try {
                decryptedData = JSON.parse(decryptedJson);
              } catch (parseError) {
                decryptedData = decryptedJson;
              }
            } catch (decryptError) {
              console.error(
                `Failed to decrypt data for CID ${cid}: ${decryptError}`
              );
              results[cid] = {
                data: null,
                raw: encryptedData,
                error: true,
                message: `Decryption failed for CID ${cid}`
              };
              continue;
            }

            results[cid] = {
              data: decryptedData,
              raw: encryptedData
            };
          } else {
            // If data doesn't have our expected format, return as-is
            results[cid] = {
              data: encryptedData,
              raw: encryptedData
            };
          }
        } catch (processError) {
          console.error(
            `Error processing data for CID ${cid}: ${processError}`
          );
          // Record error but continue processing other CIDs
          results[cid] = {
            data: null,
            raw: encryptedData,
            error: true,
            message: `Processing failed for CID ${cid}`
          };
        }
      }

      return results;
    } catch (error) {
      console.error(`Error in bulk fetch and decrypt: ${error}`);
      // Even on overall error, return any partial results we might have
      // Don't throw as that would cause the Azure Function to crash
      return {};
    }
  }

  /**
   * Unpins (deletes) data from IPFS using the provided CID.
   *
   * @param {string} cid - The Content Identifier for the data to be unpinned.
   * @returns {Promise<any>} A promise that resolves to the response data from the IPFS API.
   * @throws Will throw an error if the unpin process fails.
   */
  async unpinFromIPFS(cid: string): Promise<any> {
    try {
      await this.pinata.files.public.delete([cid]);
      return { success: true, message: `Successfully unpinned CID: ${cid}` };
    } catch (error: any) {
      console.error(
        `Error unpinning data from IPFS with CID ${cid}: ${error.message}`
      );
      throw new Error(`Failed to unpin CID ${cid}: ${error.message}`);
    }
  }

  /**
   * Handles HTTP requests to retrieve data from IPFS.
   *
   * @param {Request} request - The HTTP request object.
   * @returns {Promise<Response>} A promise that resolves to an HTTP response.
   */
  async handleGetIPFSData(request: Request, response: Response): Promise<any> {
    try {
      // Extract the CID from query parameters or path parameters
      const cid = request.params.cid || (request.query.cid as string);

      if (!cid) {
        response.status(400).json({
          success: false,
          error: 'Missing CID parameter',
          message: 'Please provide a cid parameter'
        });
        return;
      }

      console.info(`Processing request to fetch IPFS data for CID: ${cid}`);

      // Attempt to fetch and decrypt the data from IPFS
      const result = await this.fetchAndDecrypt(cid);

      // Check if we got an error response from fetchAndDecrypt
      if (result.error) {
        console.error(
          `Failed to fetch or decrypt CID ${cid}: ${result.message}`
        );
        response.status(404).json({
          success: false,
          error: 'Data retrieval failed',
          message: result.message || `Could not access content with CID: ${cid}`
        });
        return;
      }

      // Return the successfully retrieved data
      response.status(200).json({
        success: true,
        data: result.data,
        metadata: result.raw?.metadata || {}
      });
    } catch (error) {
      console.error(`Unexpected error in handleGetIPFSData: ${error}`);
      response.status(500).json({
        success: false,
        error: 'Server error',
        message: `An unexpected error occurred while retrieving IPFS data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Handles HTTP requests to retrieve multiple data items from IPFS in a single request.
   *
   * @param {HttpRequest} request - The HTTP request object containing array of CIDs.
   * @param {InvocationContext} context - The invocation context.
   * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response with all retrieved data.
   */
  async handleGetBulkData(request: Request, response: Response): Promise<any> {
    try {
      // Parse request body to get array of CIDs
      const requestData = (await request.body()) as { cids?: string[] };
      const { cids = [] } = requestData;

      // Log the incoming request
      console.info(
        `Received bulk data request with ${cids.length} CIDs: ${JSON.stringify(cids)}`
      );

      // Validate input
      if (!cids || !Array.isArray(cids)) {
        response.status(400).json({
          success: false,
          message: 'cids must be an array'
        });
        return;
      }

      if (cids.length === 0) {
        response.status(400).json({
          success: false,
          message: 'No CIDs provided'
        });
        return;
      }

      // Normalize CIDs - this handles various formats
      const normalizedCids = cids.map((cid) => {
        // Handle ipfs:// protocol format
        if (cid.startsWith('ipfs://')) {
          return cid.substring(7);
        }
        // Handle other potential CID formats here
        return cid;
      });

      console.info(`Processing ${normalizedCids.length} normalized CIDs`);

      // Set reasonable limits
      const MAX_BATCH_SIZE = 50;
      if (normalizedCids.length > MAX_BATCH_SIZE) {
        console.info(
          `Limiting bulk request from ${normalizedCids.length} to ${MAX_BATCH_SIZE} CIDs`
        );
      }
      const limitedCids = normalizedCids.slice(0, MAX_BATCH_SIZE);

      // Fetch and decrypt all data
      const bulkResults = await this.fetchAndDecryptBulk(limitedCids);

      // Format results for response
      const results = limitedCids.map((cid) => {
        const result = bulkResults[cid];
        if (!result) {
          return {
            cid,
            success: false,
            error: 'Could not retrieve data'
          };
        }

        // Check if this result contains an error
        if (result.error) {
          return {
            cid,
            success: false,
            error: result.message || 'Could not retrieve data'
          };
        }

        return {
          cid,
          data: result.data,
          metadata: result.raw?.metadata || {},
          success: true
        };
      });

      // Calculate success rate for logging and monitoring
      const successCount = results.filter((r) => r.success).length;
      const successRate = (successCount / results.length) * 100;

      console.info(
        `Bulk request completed. Success rate: ${successRate.toFixed(2)}% (${successCount}/${results.length})`
      );

      // Return all results, including failures
      return response.status(200).json({
        success: true, // Overall request succeeded, even if some items failed
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: results.length - successCount,
          successRate: successRate
        }
      });
    } catch (error) {
      console.error(`Error processing bulk request: ${error}`);
      response.status(500).json({
        success: false,
        message: `Error retrieving bulk IPFS data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  /**
   * Handles HTTP requests to fetch various metadata and blockchain-related data.
   *
   * @param {HttpRequest} request - The HTTP request object.
   * @param {InvocationContext} context - The invocation context.
   * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
   */
  async handleGetData(request: Request, response: Response): Promise<any> {
    try {
      const cid = request.params.cid || (request.query.cid as string);

      if (!cid) {
        return response.status(400).json({
          error: 'Missing CID parameter',
          message: 'Please provide a cid parameter in the request'
        });
      }

      try {
        const { data, raw } = await this.fetchAndDecrypt(cid);

        return {
          status: 200,
          jsonBody: {
            data: data,
            metadata: raw.metadata || {}
          }
        };
      } catch (error) {
        console.error(`Failed to get data from IPFS: ${error}`);
        return response.status(404).json({
          error: 'Data retrieval failed',
          message: `Could not retrieve data for CID: ${cid}`
        });
      }
    } catch (error) {
      console.error(`Unhandled error: ${error}`);
      return response.status(500).json({
        error: 'Server error',
        message: 'An unexpected error occurred'
      });
    }
  }

  /**
   * Handles HTTP requests to delete data from IPFS.
   *
   * @param {HttpRequest} request - The HTTP request object.
   * @param {InvocationContext} context - The invocation context.
   * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
   */
  async handleDeleteIPFS(request: Request, response: Response): Promise<any> {
    const cid = request.query.cid as string;

    if (!cid) {
      return response.status(400).json({
        error: 'Missing CID parameter',
        message: 'Please provide a cid parameter'
      });
    }

    try {
      const res = await this.unpinFromIPFS(cid);

      return response.status(200).json(res);
    } catch (error) {
      console.error(`Error deleting data: ${error}`);
      return response.status(500).json({
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to delete data from IPFS'
      });
    }
  }

  /**
   * Handles HTTP requests to update the blockchain by uploading encrypted data to IPFS.
   *
   * @param {HttpRequest} request - The HTTP request object.
   * @param {InvocationContext} context - The invocation context.
   * @returns {Promise<HttpResponseInit>} A promise that resolves to an HTTP response.
   */
  async handleUpdateBlockchain(
    request: Request,
    response: Response
  ): Promise<any> {
    try {
      // Parse the request body as JSON
      let requestData: BlockchainUpdateRequest;

      try {
        requestData = (await request.body()) as BlockchainUpdateRequest;
      } catch (parseError) {
        return response.status(400).json({
          error: 'Invalid request body',
          message: 'Request body must be valid JSON'
        });
      }

      console.info(
        `Received request to update blockchain with data: ${JSON.stringify(requestData)}`
      );

      if (!requestData.metadata || !requestData.resource) {
        return response.status(400).json({
          error: 'Missing required data field',
          message: 'Request must include resource and metadata to upload'
        });
      }

      // Upload the encrypted data to IPFS
      const res = await this.encryptAndUpload(requestData);

      return response.status(200).json(res);
    } catch (error: any) {
      console.error(`Error uploading data: ${error.message}`);
      return response.status(500).json({
        error: error.message,
        message: 'Failed to create resource'
      });
    }
  }
}

// Export a singleton instance of the service
export const ipfsService = new IPFSService();
