import * as esmBridge from '../../utils';
import { createHash } from 'crypto';
import { Web3StorageService } from './web3up.service';

// Configurable constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // ms
const CHUNK_SIZE = 1024 * 1024; // 1MB for chunking large files

/**
 * Interface for chunked file manifest
 */
interface ChunkedFileManifest {
  type: 'chunked-file';
  chunks: string[];
  totalChunks: number;
  createdAt: string;
}

/**
 * Service for interacting with IPFS using Helia and Web3.Storage
 * Provides reliable file storage with pinning, chunking, and error handling
 */
export class IPFSService {
  private helia: any = null;
  private stringsService: any = null;
  private jsonService: any = null;
  private unixfsService: any = null;
  private web3Storage: Web3StorageService | null = null;
  private isInitialized = false;
  private pinningEnabled = false;

  /**
   * Initialize the IPFS connection with optional Web3.Storage pinning
   * @param enablePinning Whether to enable content persistence via Web3.Storage
   */
  async initialize(enablePinning = true): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load modules using ESM bridge
      const heliaModule = await esmBridge.loadHelia();
      const stringsModule = await esmBridge.loadStrings();
      const jsonModule = await esmBridge.loadJson();
      const unixfsModule = await esmBridge.loadUnixfs();

      // Create a Helia node with proper configuration
      this.helia = await heliaModule.createHelia({
        timeout: 60000, // 60 second timeout
        retryAttempts: MAX_RETRIES,
        retryDelay: RETRY_DELAY
      });

      // Initialize the services
      this.stringsService = stringsModule.strings(this.helia);
      this.jsonService = jsonModule.json(this.helia);
      this.unixfsService = unixfsModule.unixfs(this.helia);

      // Initialize Web3.Storage client for pinning if enabled
      if (enablePinning) {
        try {
          this.web3Storage = new Web3StorageService();
          await this.web3Storage.initialize();

          this.pinningEnabled = true;
        } catch (error) {
          console.error('Error initializing Web3.Storage service:', error);
          this.pinningEnabled = false;
        }
      }

      this.isInitialized = true;
    } catch (error) {
      throw new Error(
        `IPFS initialization failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Ensure the IPFS service is initialized before any operation
   * @private
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Retry a function with exponential backoff
   * @param fn Function to retry
   * @param maxRetries Maximum number of retries
   * @param initialDelay Initial delay in ms
   * @private
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = MAX_RETRIES,
    initialDelay = RETRY_DELAY
  ): Promise<T> {
    let retries = 0;
    let delay = initialDelay;

    while (true) {
      try {
        return await fn();
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          throw error;
        }
        console.warn(
          `IPFS operation failed, retrying (${retries}/${maxRetries})...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  /**
   * Persist content using Web3.Storage for longer-term availability
   * @param cid Content identifier to persist
   * @param content The actual content to persist (needed for Web3Storage)
   * @private
   */
  private async persistContent(
    cid: string,
    content: Uint8Array | string | object
  ): Promise<void> {
    if (!this.pinningEnabled || !this.web3Storage) {
      console.warn(
        `Content persistence skipped for CID: ${cid} (persistence not enabled)`
      );
      return;
    }

    try {
      // Store the content in Web3.Storage for persistence
      let web3Cid: string;

      if (content instanceof Uint8Array) {
        web3Cid = await this.web3Storage.storeFile(content, `${cid}.bin`);
      } else if (typeof content === 'string') {
        web3Cid = await this.web3Storage.storeString(content, `${cid}.txt`);
      } else {
        web3Cid = await this.web3Storage.storeJSON(content, `${cid}.json`);
      }
    } catch (error) {
      console.error(`Error persisting content ${cid}:`, error);
      throw new Error(
        `Failed to persist content: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Store a string in IPFS with retries and persistence
   * @param content The string content to store
   * @returns The CID of the stored content
   */
  async storeString(content: string): Promise<string> {
    await this.ensureInitialized();

    try {
      const storeOperation = async () => {
        const cid = await this.stringsService.add(content);
        return cid.toString();
      };

      const cid = await this.withRetry(storeOperation);

      // Persist the content for long-term availability
      await this.persistContent(cid, content);

      return cid;
    } catch (error) {
      console.error('Error storing string in IPFS:', error);
      throw new Error(
        `Failed to store string: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Store a JSON object in IPFS with retries and persistence
   * @param content The JSON object to store
   * @returns The CID of the stored content
   */
  async storeJSON(content: object): Promise<string> {
    await this.ensureInitialized();

    try {
      const storeOperation = async () => {
        const cid = await this.jsonService.add(content);
        return cid.toString();
      };

      const cid = await this.withRetry(storeOperation);

      // Persist the content for long-term availability
      await this.persistContent(cid, content);

      return cid;
    } catch (error) {
      console.error('Error storing JSON in IPFS:', error);
      throw new Error(
        `Failed to store JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Store a file in IPFS with chunking, retries and persistence
   * @param content The file buffer to store
   * @param onProgress Optional progress callback
   * @returns The CID of the stored content
   */
  async storeFile(
    content: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    await this.ensureInitialized();

    try {
      // For large files, implement chunking
      if (content.length > CHUNK_SIZE) {
        return this.storeFileWithChunking(content, onProgress);
      }

      const storeOperation = async () => {
        const cid = await this.unixfsService.addBytes(content);
        if (onProgress) onProgress(100);
        return cid.toString();
      };

      const cid = await this.withRetry(storeOperation);

      // Persist the content for long-term availability
      await this.persistContent(cid, content);

      return cid;
    } catch (error) {
      console.error('Error storing file in IPFS:', error);
      throw new Error(
        `Failed to store file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Store a large file in chunks
   * @param content File content as Uint8Array
   * @param onProgress Optional progress callback
   * @private
   */
  private async storeFileWithChunking(
    content: Uint8Array,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const totalChunks = Math.ceil(content.length / CHUNK_SIZE);
    const chunkCids: string[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, content.length);
      const chunk = content.slice(start, end);

      const storeOperation = async () => {
        const cid = await this.unixfsService.addBytes(chunk);
        return cid.toString();
      };

      const chunkCid = await this.withRetry(storeOperation);
      chunkCids.push(chunkCid);

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }

    // Create a directory structure to combine all chunks
    const dirCid = await this.createDirectoryFromChunks(chunkCids);

    // For large files, we may want to persist each chunk individually
    // as well as the manifest, but for simplicity, we'll just persist the manifest
    if (this.pinningEnabled && this.web3Storage) {
      // Persist the manifest for longer-term availability
      const manifest: ChunkedFileManifest = {
        type: 'chunked-file',
        chunks: chunkCids,
        totalChunks: chunkCids.length,
        createdAt: new Date().toISOString()
      };
      await this.persistContent(dirCid, manifest);
    }

    return dirCid;
  }

  /**
   * Create a directory from chunk CIDs
   * @param chunkCids Array of chunk CIDs
   * @private
   */
  private async createDirectoryFromChunks(
    chunkCids: string[]
  ): Promise<string> {
    // This is a simplified implementation
    // In a production environment, you'd use proper DAG creation
    const manifest: ChunkedFileManifest = {
      type: 'chunked-file',
      chunks: chunkCids,
      totalChunks: chunkCids.length,
      createdAt: new Date().toISOString()
    };

    return this.storeJSON(manifest);
  }

  /**
   * Generate a content-based hash for cacheable content
   * @param content The content to hash
   * @private
   */
  private generateContentHash(content: string | object): string {
    const contentStr =
      typeof content === 'string' ? content : JSON.stringify(content);
    return createHash('sha256').update(contentStr).digest('hex');
  }

  /**
   * Retrieve a string from IPFS with caching and retries
   * @param cid The CID of the content to retrieve
   * @returns The retrieved string
   */
  async getString(cid: string): Promise<string> {
    await this.ensureInitialized();

    try {
      const retrieveOperation = async () => {
        return await this.stringsService.get(cid);
      };

      return await this.withRetry(retrieveOperation);
    } catch (error) {
      console.error('Error retrieving string from IPFS:', error);

      // Attempt to retrieve from Web3.Storage if available
      if (this.pinningEnabled && this.web3Storage) {
        try {
          const url = this.web3Storage.getRetrievalUrl(cid);

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `Failed to retrieve from Web3.Storage: ${response.statusText}`
            );
          }

          return await response.text();
        } catch (web3Error) {
          console.error(
            'Failed fallback retrieval from Web3.Storage:',
            web3Error
          );
        }
      }

      throw new Error(
        `Failed to retrieve string: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieve a JSON object from IPFS with caching and retries
   * @param cid The CID of the content to retrieve
   * @returns The retrieved JSON object
   */
  async getJSON(cid: string): Promise<object> {
    await this.ensureInitialized();

    try {
      const retrieveOperation = async () => {
        return await this.jsonService.get(cid);
      };

      return await this.withRetry(retrieveOperation);
    } catch (error) {
      console.error('Error retrieving JSON from IPFS:', error);

      // Attempt to retrieve from Web3.Storage if available
      if (this.pinningEnabled && this.web3Storage) {
        try {
          const url = this.web3Storage.getRetrievalUrl(cid);

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `Failed to retrieve from Web3.Storage: ${response.statusText}`
            );
          }

          return await response.json();
        } catch (web3Error) {
          console.error(
            'Failed fallback retrieval from Web3.Storage:',
            web3Error
          );
        }
      }

      throw new Error(
        `Failed to retrieve JSON: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieve a file from IPFS with efficient streaming and retries
   * @param cid The CID of the content to retrieve
   * @param onProgress Optional progress callback
   * @returns The retrieved file as a Uint8Array
   */
  async getFile(
    cid: string,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    await this.ensureInitialized();

    try {
      // First check if this is a chunked file
      try {
        const manifest = (await this.getJSON(cid)) as unknown;

        // Check if this is a chunked file manifest
        if (
          manifest &&
          typeof manifest === 'object' &&
          'type' in manifest &&
          manifest.type === 'chunked-file' &&
          'chunks' in manifest &&
          Array.isArray((manifest as ChunkedFileManifest).chunks)
        ) {
          return this.getChunkedFile(
            manifest as ChunkedFileManifest,
            onProgress
          );
        }
      } catch (error) {
        // Not a chunked file manifest, continue with normal retrieval
      }

      const retrieveOperation = async () => {
        const chunks: Uint8Array[] = [];
        let processedBytes = 0;
        let totalBytes = 0;

        // First attempt to get file size information
        try {
          const stat = await this.helia.blockstore.stat(cid);
          totalBytes = stat.size;
        } catch (e) {
          // Size info not available, will report progress without total size
        }

        for await (const chunk of this.unixfsService.cat(cid)) {
          chunks.push(chunk);
          processedBytes += chunk.length;

          if (onProgress && totalBytes > 0) {
            onProgress(Math.round((processedBytes / totalBytes) * 100));
          } else if (onProgress) {
            // If we don't know total size, just report indeterminate progress
            onProgress(-1);
          }
        }

        if (onProgress) onProgress(100);

        // Combine the chunks into a single Uint8Array
        const totalLength = chunks.reduce(
          (acc, chunk) => acc + chunk.length,
          0
        );
        const result = new Uint8Array(totalLength);
        let offset = 0;

        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }

        return result;
      };

      return await this.withRetry(retrieveOperation);
    } catch (error) {
      console.error('Error retrieving file from IPFS:', error);

      // Attempt to retrieve from Web3.Storage if available
      if (this.pinningEnabled && this.web3Storage) {
        try {
          const url = this.web3Storage.getRetrievalUrl(cid);

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(
              `Failed to retrieve from Web3.Storage: ${response.statusText}`
            );
          }

          if (onProgress) onProgress(50); // Report progress

          const buffer = await response.arrayBuffer();
          const data = new Uint8Array(buffer);

          if (onProgress) onProgress(100); // Complete progress

          return data;
        } catch (web3Error) {
          console.error(
            'Failed fallback retrieval from Web3.Storage:',
            web3Error
          );
        }
      }

      throw new Error(
        `Failed to retrieve file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Retrieve a chunked file by reassembling its chunks
   * @param manifest The chunked file manifest
   * @param onProgress Optional progress callback
   * @returns The reassembled file as Uint8Array
   * @private
   */
  private async getChunkedFile(
    manifest: ChunkedFileManifest,
    onProgress?: (progress: number) => void
  ): Promise<Uint8Array> {
    const { chunks } = manifest;
    const totalChunks = chunks.length;
    const allChunks: Uint8Array[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const chunk = await this.withRetry(async () => {
        return await this.getFile(chunks[i]);
      });

      allChunks.push(chunk);

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }

    // Combine all chunks
    const totalLength = allChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of allChunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Check if content with given CID exists and is accessible
   * @param cid Content identifier to check
   * @returns Boolean indicating if content exists
   */
  async contentExists(cid: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      // Try to access the CID - if it succeeds, the content exists
      await this.helia.blockstore.has(cid);
      return true;
    } catch (error) {
      // Check Web3.Storage if available
      if (this.pinningEnabled && this.web3Storage) {
        try {
          const url = this.web3Storage.getRetrievalUrl(cid);
          const response = await fetch(url, { method: 'HEAD' });
          return response.ok;
        } catch (web3Error) {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Close the IPFS connection
   */
  async close(): Promise<void> {
    if (this.helia) {
      try {
        await this.helia.stop();
        this.helia = null;
        this.stringsService = null;
        this.jsonService = null;
        this.unixfsService = null;
        this.web3Storage = null;
        this.isInitialized = false;
      } catch (error) {
        console.error('Error closing IPFS node:', error);
        throw new Error(
          `Failed to close IPFS node: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
}
