import { ethers } from 'ethers';
import { DidDocument } from './did-document';
import { DidRegistryService } from '../services/contract/DidRegistryService';
import { config } from '../config/blockchain.config';
import { provider } from '../helpers/provider';

export class BlockchainManager {
  private didRegistryService: DidRegistryService;
  private didDocument: DidDocument;

  constructor() {
    this.didRegistryService = new DidRegistryService();
    this.didDocument = new DidDocument();
  }

  public async registerDid(
    address: string,
    publicKey: string
  ): Promise<ethers.TransactionResponse> {
    try {
      const document = this.didDocument.getDidDocument(address);

      // Use the DidRegistryService to register the DID
      const receipt = await this.didRegistryService.registerDid(
        document.id,
        JSON.stringify(document),
        publicKey
      );

      // Return the transaction response (maintaining API compatibility)
      return receipt.transactionResponse;
    } catch (error: any) {
      throw new Error(`Failed to register DID: ${error.message}`);
    }
  }

  public async resolveDid(did: string): Promise<{
    document: string;
    publicKey: string;
    subject: string;
    controller: string;
    active: boolean;
    lastUpdated: bigint;
  }> {
    try {
      // Get the document using DidRegistryService
      //lets write it with Promise.all
      const [document, isActive, controller, publicKey] = await Promise.all([
        this.didRegistryService.getDocument(did),
        this.didRegistryService.isDidActive(did),
        this.didRegistryService.getDidController(did),
        this.didRegistryService.getPublicKeyForDid(did)
      ]);

      // Since DidRegistryService doesn't have a direct resolveDid method that returns all fields,
      // we'll construct a compatible response
      return {
        document,
        publicKey,
        subject: controller,
        controller,
        active: isActive,
        lastUpdated: BigInt(0)
      };
    } catch (error: any) {
      if (error.message.includes('could not decode result data')) {
        throw new Error(`DID ${did} not found or not registered`);
      }
      throw error;
    }
  }

  public async updateDidDocument(
    did: string,
    document: any,
    signer: ethers.Wallet
  ): Promise<ethers.TransactionResponse> {
    try {
      try {
        await this.didRegistryService.getDocument(did);
      } catch {
        throw new Error('DID does not exist');
      }

      // Verify ownership
      const isOwner = await this.isOwner(did, signer.address);
      if (!isOwner) {
        throw new Error('Not authorized to update this DID');
      }

      const documentStr = JSON.stringify(document);
      const receipt = await this.didRegistryService.updateDidDocument(
        did,
        documentStr
      );

      return receipt.transactionResponse;
    } catch (error: any) {
      throw new Error(`Failed to update DID document: ${error.message}`);
    }
  }

  public async deactivateDid(did: string): Promise<ethers.TransactionResponse> {
    try {
      const receipt = await this.didRegistryService.deactivateDid(did);
      return receipt.transactionResponse;
    } catch (error: any) {
      throw new Error(`Failed to deactivate DID: ${error.message}`);
    }
  }

  public async updatePublicKey(
    did: string,
    newPublicKey: string
  ): Promise<ethers.TransactionResponse> {
    try {
      // Check if DID exists
      try {
        await this.didRegistryService.getDocument(did);
      } catch {
        throw new Error('DID does not exist');
      }

      // Verify ownership
      const isOwner = await this.isOwner(did, did.split(':')[2]);
      if (!isOwner) {
        throw new Error('Not authorized to update this DID');
      }

      const receipt = await this.didRegistryService.updateDidPublicKey(
        did,
        newPublicKey
      );

      return receipt.transactionResponse;
    } catch (error: any) {
      throw new Error(`Failed to update DID public key: ${error.message}`);
    }
  }

  public async isOwner(did: string, address: string): Promise<boolean> {
    try {
      const controller = await this.didRegistryService.getDidController(did);
      return controller.toLowerCase() === address.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  public async addressToDid(address: string): Promise<string> {
    try {
      const did = await this.didRegistryService.addressToDID(address);
      if (!did) {
        throw new Error(`No DID found for address ${address}`);
      }
      return did;
    } catch (error: any) {
      throw new Error(`Failed to resolve address to DID: ${error.message}`);
    }
  }

  public async isDidActive(did: string): Promise<boolean> {
    try {
      return await this.didRegistryService.isDidActive(did);
    } catch (error: unknown) {
      throw new Error(
        `Failed to check if DID is active: ${error ? (error as Error).message : 'Unknown error'}`
      );
    }
  }
}
