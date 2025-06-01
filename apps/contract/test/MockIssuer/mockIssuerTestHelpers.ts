import { ethers } from 'hardhat';
import { MockIssuer } from '../../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

export interface MockIssuerTestContext {
  // Signers
  issuer: HardhatEthersSigner;
  holder1: HardhatEthersSigner;
  holder2: HardhatEthersSigner;
  unauthorized: HardhatEthersSigner;

  // Contract
  mockIssuer: MockIssuer;

  // Helper functions
  issueDocument: (documentHash: string) => Promise<void>;
  revokeDocument: (documentHash: string) => Promise<void>;
  getDocument: (documentHash: string) => Promise<[string, string, string, bigint]>;
  getDocumentHash: (document: string) => string;
}

/**
 * Setup function for MockIssuer tests
 */
export async function setupMockIssuerTest(): Promise<MockIssuerTestContext> {
  // Get signers
  const [issuer, holder1, holder2, unauthorized] = await ethers.getSigners();

  // Deploy MockIssuer
  const mockIssuerFactory = await ethers.getContractFactory('MockIssuer');
  const mockIssuer = await mockIssuerFactory.deploy(issuer.address);

  // Helper functions
  const issueDocument = async (documentHash: string) => {
    await mockIssuer.connect(issuer).issueDocument(documentHash);
  };

  const revokeDocument = async (documentHash: string) => {
    await mockIssuer.connect(issuer).revokeDocument(documentHash);
  };

  const getDocument = async (documentHash: string) => {
    const result = await mockIssuer.getDocument(documentHash);
    return [result[0], result[1].toString(), result[2].toString(), result[3]] as [string, string, string, bigint];
  };

  const getDocumentHash = (document: string) => {
    return ethers.keccak256(ethers.toUtf8Bytes(document));
  };

  return {
    issuer,
    holder1,
    holder2,
    unauthorized,
    mockIssuer,
    issueDocument,
    revokeDocument,
    getDocument,
    getDocumentHash,
  };
}
