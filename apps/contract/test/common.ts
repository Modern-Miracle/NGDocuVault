import { ethers } from 'hardhat';
import { DocuVault } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { AddressLike } from 'ethers';
import { time } from '@nomicfoundation/hardhat-network-helpers';

/**
 * Global function to validate timestamps in event assertions
 * Uses a very wide window (1 hour) to prevent timing issues between tests
 */
export function isValidTimestamp(timestamp: number | bigint): boolean {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const ts = BigInt(timestamp);
  // 1 hour window to accommodate test suite execution time
  return ts >= currentTime - BigInt(3600) && ts <= currentTime + BigInt(3600);
}

// Constants for testing
export enum Consent {
  PENDING,
  GRANTED,
  REJECTED,
}

export enum DocumentType {
  GENERIC,
  BIRTH_CERTIFICATE,
  DEATH_CERTIFICATE,
  MARRIAGE_CERTIFICATE,
  ID_CARD,
  PASSPORT,
  OTHER,
}

export type ShareRequest = {
  consent: Consent;
  validUntil: number;
};

export type ConsentStatus = {
  consent: Consent;
  validUntil: number;
};

export type Document = {
  issuer: AddressLike;
  holder: AddressLike;
  issuanceDate: number;
  expirationDate: number;
  isVerified: boolean;
  documentType: DocumentType;
};

// Test data constants
export const testDataId = 'test-data-123';
export const testCid = 'ipfs://QmTest123456';
export const contentHash = ethers.keccak256(ethers.toUtf8Bytes('test content hash'));
export const dataSize = 1024;
export const accessDuration = 7 * 24 * 60 * 60; // 7 days in seconds
export const serviceFee = 10; // 10%
export const unitPrice = ethers.parseEther('0.01'); // 0.01 tokens per data unit

// Common test context shared across test files
export interface TestContext {
  // Signers
  owner: HardhatEthersSigner;
  admin: HardhatEthersSigner;
  issuer: HardhatEthersSigner;
  holder: HardhatEthersSigner;
  pfa: HardhatEthersSigner;
  unauthorized: HardhatEthersSigner;

  // Contracts
  docuVault: DocuVault;

  // Helper functions
  registerIssuer: (issuerAddress: AddressLike) => Promise<void>;
  registerDocument: (
    contentHash: string,
    cid: string,
    holder: AddressLike,
    expiration?: number,
    type?: DocumentType
  ) => Promise<string>;
  updateDocument: (
    oldDocumentId: string,
    newContentHash: string,
    newCid: string,
    newExpiration: number,
    documentType: DocumentType
  ) => Promise<string>;
  requestVerification: (documentId: string) => Promise<void>;
  verifyDocument: (documentId: string) => Promise<void>;
  batchVerifyDocuments: (documentIds: string[]) => Promise<void>;
  requestShare: (documentId: string, requester: AddressLike) => Promise<void>;
  giveConsent: (documentId: string, requester: AddressLike, consent: Consent, validUntil?: number) => Promise<void>;
  revokeConsent: (documentId: string, requester: AddressLike) => Promise<void>;
  shareDocument: (documentId: string, requester: AddressLike) => Promise<Document>;
  getDocumentInfo: (documentId: string) => Promise<{
    isVerified: boolean;
    isExpired: boolean;
    issuer: string;
    holder: string;
    issuanceDate: number;
    expirationDate: number;
    documentType: DocumentType;
  }>;
  isDocumentExpired: (documentId: string) => Promise<boolean>;
  generateDocumentId: (contentHash: string, holder: AddressLike, cid: string) => Promise<string>;
  verifyCid: (contentHash: string, holder: AddressLike, cid: string, documentId: string) => Promise<boolean>;
}

/**
 * Sets up the test environment by deploying contracts and setting up initial state
 * Each test gets its own fresh contract instance to avoid test interference
 */
export async function setupTest(): Promise<TestContext> {
  // Get signers
  const [owner, admin, issuer, holder, pfa, unauthorized] = await ethers.getSigners();

  // Deploy DocuVault - new instance for each test
  const DocuVaultFactory = await ethers.getContractFactory('DocuVault');
  const docuVault = await DocuVaultFactory.deploy();

  // Register admin role
  await docuVault.connect(owner).addAdmin(admin.address);

  // Register the issuer
  await docuVault.connect(admin).registerIssuer(issuer.address);

  // Define helper functions
  const registerIssuer = async (issuerAddress: AddressLike): Promise<void> => {
    await docuVault.connect(admin).registerIssuer(issuerAddress);
  };

  const registerDocument = async (
    contentHashStr: string,
    cid: string,
    holderAddress: AddressLike,
    expiration?: number,
    type: DocumentType = DocumentType.GENERIC
  ): Promise<string> => {
    // If no expiration provided, set it to 1 year from now
    const expirationTime = expiration || (await time.latest()) + 365 * 24 * 60 * 60;
    const contentHashBytes = ethers.keccak256(ethers.toUtf8Bytes(contentHashStr));

    const tx = await docuVault.connect(issuer).registerDocument(
      contentHashBytes,
      cid,
      holderAddress,
      0, // issuanceDate (0 means current timestamp)
      expirationTime,
      type
    );

    // Get document ID from transaction receipt events
    const receipt = await tx.wait();
    if (!receipt || !receipt.logs) {
      throw new Error('Transaction receipt or logs not available');
    }

    const event = receipt.logs.find((log) => docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered');

    if (!event) {
      throw new Error('DocumentRegistered event not found in transaction logs');
    }

    const parsedEvent = docuVault.interface.parseLog(event as any);
    if (!parsedEvent || !parsedEvent.args) {
      throw new Error('Failed to parse DocumentRegistered event');
    }

    return parsedEvent.args.documentId;
  };

  const updateDocument = async (
    oldDocumentId: string,
    newContentHashStr: string,
    newCid: string,
    newExpiration: number,
    documentType: DocumentType
  ): Promise<string> => {
    const newContentHash = ethers.keccak256(ethers.toUtf8Bytes(newContentHashStr));

    const tx = await docuVault
      .connect(issuer)
      .updateDocument(oldDocumentId, newContentHash, newCid, newExpiration, documentType);

    const receipt = await tx.wait();
    if (!receipt || !receipt.logs) {
      throw new Error('Transaction receipt or logs not available');
    }

    const event = receipt.logs.find((log) => docuVault.interface.parseLog(log as any)?.name === 'DocumentUpdated');

    if (!event) {
      throw new Error('DocumentUpdated event not found in transaction logs');
    }

    const parsedEvent = docuVault.interface.parseLog(event as any);
    return parsedEvent?.args?.newDocumentId;
  };

  const requestVerification = async (documentId: string): Promise<void> => {
    await docuVault.connect(holder).requestVerification(documentId);
  };

  const verifyDocument = async (documentId: string): Promise<void> => {
    await docuVault.connect(issuer).verifyDocument(documentId);
  };

  const batchVerifyDocuments = async (documentIds: string[]): Promise<void> => {
    await docuVault.connect(issuer).verifyDocuments(documentIds);
  };

  const requestShare = async (documentId: string, requester: AddressLike): Promise<void> => {
    await docuVault.connect(holder).requestShare(documentId, requester);
  };

  const giveConsent = async (
    documentId: string,
    requester: AddressLike,
    consent: Consent,
    validUntil?: number
  ): Promise<void> => {
    // Default validity: 30 days
    const validityPeriod = validUntil || (await time.latest()) + 30 * 24 * 60 * 60;
    await docuVault.connect(holder).giveConsent(documentId, requester, consent, validityPeriod);
  };

  const revokeConsent = async (documentId: string, requester: AddressLike): Promise<void> => {
    await docuVault.connect(holder).revokeConsent(documentId, requester);
  };

  const shareDocument = async (documentId: string, requester: AddressLike): Promise<Document> => {
    // Call the contract method
    await docuVault.connect(holder).shareDocument(documentId, requester);

    // Get the document info after sharing
    const docInfo = await getDocumentInfo(documentId);

    return {
      issuer: docInfo.issuer,
      holder: docInfo.holder,
      issuanceDate: docInfo.issuanceDate,
      expirationDate: docInfo.expirationDate,
      isVerified: docInfo.isVerified,
      documentType: docInfo.documentType,
    };
  };

  const getDocumentInfo = async (documentId: string) => {
    const info = await docuVault.getDocumentInfo(documentId);
    return {
      isVerified: info[0],
      isExpired: info[1],
      issuer: info[2],
      holder: info[3],
      issuanceDate: Number(info[4]),
      expirationDate: Number(info[5]),
      documentType: Number(info[6]) as DocumentType,
    };
  };

  const isDocumentExpired = async (documentId: string): Promise<boolean> => {
    return docuVault.isDocumentExpired(documentId);
  };

  const generateDocumentId = async (
    contentHashStr: string,
    holderAddress: AddressLike,
    cid: string
  ): Promise<string> => {
    const contentHashBytes = ethers.keccak256(ethers.toUtf8Bytes(contentHashStr));
    return docuVault.generateDocumentId(contentHashBytes, holderAddress, cid);
  };

  const verifyCid = async (
    contentHashStr: string,
    holderAddress: AddressLike,
    cid: string,
    documentId: string
  ): Promise<boolean> => {
    const contentHashBytes = ethers.keccak256(ethers.toUtf8Bytes(contentHashStr));
    return docuVault.verifyCid(contentHashBytes, holderAddress, cid, documentId);
  };

  return {
    owner,
    admin,
    issuer,
    holder,
    pfa,
    unauthorized,
    docuVault,
    registerIssuer,
    registerDocument,
    updateDocument,
    requestVerification,
    verifyDocument,
    batchVerifyDocuments,
    requestShare,
    giveConsent,
    revokeConsent,
    shareDocument,
    getDocumentInfo,
    isDocumentExpired,
    generateDocumentId,
    verifyCid,
  };
}

/**
 * Helper to create and verify a document in one step
 * @returns The document ID of the created and verified document
 */
export async function createVerifiedDocument(
  ctx: TestContext,
  contentHashStr: string = 'verified document content',
  cid: string = 'ipfs://QmVerifiedDoc',
  holderAddress?: AddressLike, // Optional holder address
  expiration?: number,
  type: DocumentType = DocumentType.BIRTH_CERTIFICATE
): Promise<string> {
  const holder = holderAddress || ctx.holder.address;

  // Register document
  const documentId = await ctx.registerDocument(contentHashStr, cid, holder, expiration, type);

  // If issuer is not the registrant, verify the document
  const docInfo = await ctx.getDocumentInfo(documentId);
  if (!docInfo.isVerified) {
    await ctx.verifyDocument(documentId);
  }

  return documentId;
}

/**
 * Helper to set up document sharing with consent
 * @returns The document ID that is ready to be shared
 */
export async function setupDocumentSharing(
  ctx: TestContext,
  requester: AddressLike, // typically the PFA address
  validUntil?: number
): Promise<string> {
  // Create a verified document
  const documentId = await createVerifiedDocument(ctx);

  // Request share
  await ctx.requestShare(documentId, requester);

  // Grant consent
  await ctx.giveConsent(documentId, requester, Consent.GRANTED, validUntil);

  return documentId;
}

/**
 * Helper to advance time in the blockchain
 * @param seconds Number of seconds to advance
 */
export async function advanceTime(seconds: number): Promise<void> {
  await time.increase(seconds);
}

/**
 * Helper to create an expired document
 * @returns The document ID of the expired document
 */
export async function createExpiredDocument(ctx: TestContext): Promise<string> {
  // Create document that expires in 2 days
  const expiration = (await time.latest()) + 2 * 24 * 60 * 60;
  const documentId = await createVerifiedDocument(
    ctx,
    'soon to expire document',
    'ipfs://QmExpiring',
    ctx.holder.address,
    expiration
  );

  // Advance time by 3 days to make it expire
  await advanceTime(3 * 24 * 60 * 60);

  return documentId;
}

/**
 * Helper to create documents for batch operations
 * @returns Array of document IDs
 */
export async function createMultipleDocuments(ctx: TestContext, count: number = 5): Promise<string[]> {
  const documentIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const documentId = await ctx.registerDocument(
      `batch document content ${i}`,
      `ipfs://QmBatch${i}`,
      ctx.holder.address
    );
    documentIds.push(documentId);
  }

  return documentIds;
}
