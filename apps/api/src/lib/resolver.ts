import { DIDResolutionResult, DIDResolver } from 'did-resolver';
import { BlockchainManager } from './blockchain';

export class AlastriaDidResolver {
  private blockchainManager: BlockchainManager;

  constructor(blockchainManager?: BlockchainManager) {
    this.blockchainManager = blockchainManager || new BlockchainManager();
  }

  public getResolver(): Record<string, DIDResolver> {
    return {
      ala: async (did: string): Promise<DIDResolutionResult> => {
        try {
          const didData = await this.blockchainManager.resolveDid(did);
          
          return {
            didResolutionMetadata: { contentType: 'application/did+json' },
            didDocument: JSON.parse(didData.document),
            didDocumentMetadata: {
              created: new Date(Number(didData.lastUpdated) * 1000).toISOString(),
              updated: new Date(Number(didData.lastUpdated) * 1000).toISOString(),
              deactivated: !didData.active
            }
          };
        } catch (error: any) {
          return {
            didResolutionMetadata: {
              error: 'notFound',
              message: error.message
            },
            didDocument: null,
            didDocumentMetadata: {}
          };
        }
      }
    };
  }
} 
