// import { create } from '@web3-storage/w3up-client';
import * as esmBridge from '../../utils';

/**
 * Service for interacting with Web3.storage using w3up-client
 */
export class Web3StorageService {
  private client: any = null;

  /**
   * Initialize the Web3.storage client
   */
  async initialize(): Promise<void> {
    try {
      const w3upClient = await esmBridge.loadWeb3Storage();
      this.client = await w3upClient.create();
      console.log('Web3.storage client initialized successfully');
    } catch (error) {
      console.error('Error initializing Web3.storage client:', error);
      throw error;
    }
  }

  /**
   * Store a file in Web3.storage
   * @param content The file content to store
   * @param name Optional file name
   * @returns The CID of the stored content
   */
  async storeFile(content: Uint8Array, name?: string): Promise<string> {
    if (!this.client) {
      throw new Error('Web3.storage client not initialized');
    }

    try {
      // Create a blob from the content
      const blob = new Blob([content], { type: 'application/octet-stream' });
      const file = new File([blob], name || 'file', {
        type: 'application/octet-stream'
      });

      // Upload the file to Web3.storage
      const cid = await this.client.uploadFile(file);
      return cid.toString();
    } catch (error) {
      console.error('Error storing file in Web3.storage:', error);
      throw error;
    }
  }

  /**
   * Store a string in Web3.storage
   * @param content The string content to store
   * @param name Optional file name
   * @returns The CID of the stored content
   */
  async storeString(content: string, name?: string): Promise<string> {
    return this.storeFile(
      new TextEncoder().encode(content),
      name || 'string.txt'
    );
  }

  /**
   * Store a JSON object in Web3.storage
   * @param content The JSON object to store
   * @param name Optional file name
   * @returns The CID of the stored content
   */
  async storeJSON(content: object, name?: string): Promise<string> {
    return this.storeString(JSON.stringify(content), name || 'data.json');
  }

  /**
   * Retrieve a file from Web3.storage (Note: This would normally use different APIs)
   * @param cid The CID of the stored content
   * @returns The URL to retrieve the content from IPFS gateways
   */
  getRetrievalUrl(cid: string): string {
    return `https://w3s.link/ipfs/${cid}`;
  }
}
