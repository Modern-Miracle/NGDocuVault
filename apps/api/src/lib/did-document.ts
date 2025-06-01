import { ethers } from 'ethers';
import { DidDocument as DidDocumentType } from '../types/did';
import { config } from '../config/blockchain.config';

export class DidDocument {
  /**
   * Generates the boilerplate DID document
   * @returns The DID document
   */
  public getDidDocument(address: string): DidDocumentType {
    const did = `did:docu:${this.getNetwork()}:${address}`;
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2018/v1'
      ],
      id: did,
      verificationMethod: [
        {
          id: `${did}#keys-1`,
          type: 'Ed25519VerificationKey2018',
          controller: did,
          publicKeyHex: '0x'
        }
      ],
      authentication: [`${did}#keys-1`]
    };
  }

  getNetwork(): string {
    switch (config.networkId) {
      case 1:
        return 'mainnet';
      case 11155111:
        return 'sepolia';
      case 31337:
        return 'hardhat';
      default:
        return 'local';
    }
  }
}
