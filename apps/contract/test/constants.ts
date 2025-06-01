import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { DocumentType } from './common';

// Time constants
export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
export const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
export const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

// Consent validity periods
export const DEFAULT_CONSENT_DURATION = SECONDS_PER_MONTH; // 30 days
export const SHORT_CONSENT_DURATION = SECONDS_PER_WEEK; // 7 days
export const EXTENDED_CONSENT_DURATION = SECONDS_PER_MONTH * 3; // 90 days

// Document expiration periods
export const PASSPORT_VALIDITY = SECONDS_PER_YEAR * 10; // 10 years
export const ID_CARD_VALIDITY = SECONDS_PER_YEAR * 5; // 5 years
export const BIRTH_CERT_VALIDITY = SECONDS_PER_YEAR * 100; // Practically permanent

// Test document data
export const TEST_DOCUMENTS = {
  PASSPORT: {
    contentHash: 'passport content data',
    cid: 'ipfs://QmPassportDoc',
    type: DocumentType.PASSPORT,
    validity: PASSPORT_VALIDITY,
  },
  ID_CARD: {
    contentHash: 'id card content data',
    cid: 'ipfs://QmIdCardDoc',
    type: DocumentType.ID_CARD,
    validity: ID_CARD_VALIDITY,
  },
  BIRTH_CERTIFICATE: {
    contentHash: 'birth certificate content data',
    cid: 'ipfs://QmBirthCertDoc',
    type: DocumentType.BIRTH_CERTIFICATE,
    validity: BIRTH_CERT_VALIDITY,
  },
  MARRIAGE_CERTIFICATE: {
    contentHash: 'marriage certificate content data',
    cid: 'ipfs://QmMarriageCertDoc',
    type: DocumentType.MARRIAGE_CERTIFICATE,
    validity: SECONDS_PER_YEAR * 50,
  },
  GENERIC: {
    contentHash: 'generic document content',
    cid: 'ipfs://QmGenericDoc',
    type: DocumentType.GENERIC,
    validity: SECONDS_PER_YEAR,
  },
};

// Error messages that match contract error strings
export const ERRORS = {
  NOT_ADMIN: 'DocuVault__NotAdmin',
  NOT_ISSUER: 'DocuVault__NotIssuer',
  NOT_ACTIVE: 'DocuVault__NotActive',
  NOT_HOLDER: 'DocuVault__NotHolder',
  INVALID_HASH: 'DocuVault__InvalidHash',
  ALREADY_REGISTERED: 'DocuVault__AlreadyRegistered',
  ZERO_ADDRESS: 'DocuVault__ZeroAddress',
  ISSUER_REGISTERED: 'DocuVault__IssuerRegistered',
  IS_ACTIVE: 'DocuVault__IsActive',
  ALREADY_ADMIN: 'DocuVault__AlreadyAdmin',
  NOT_REGISTERED: 'DocuVault__NotRegistered',
  ALREADY_VERIFIED: 'DocuVault__AlreadyVerified',
  NOT_VERIFIED: 'DocuVault__NotVerified',
  NOT_AUTHORIZED: 'DocuVault__NotAuthorized',
  ALREADY_GRANTED: 'DocuVault__AlreadyGranted',
  NOT_GRANTED: 'DocuVault__NotGranted',
  EXPIRED: 'DocuVault__Expired',
  INVALID_DATE: 'DocuVault__InvalidDate',
  INVALID_INPUT: 'DocuVault__InvalidInput',
  CID_MISMATCH: 'DocuVault__CidMismatch',
};

// Test helper functions
export async function getExpirationDate(offsetInSeconds: number): Promise<number> {
  return (await time.latest()) + offsetInSeconds;
}

// Hash computation helpers
export function computeContentHash(content: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(content));
}

// Event names for testing event emissions
export const EVENTS = {
  ISSUER_REGISTERED: 'IssuerRegistered',
  DOCUMENT_REGISTERED: 'DocumentRegistered',
  DOCUMENT_VERIFIED: 'DocumentVerified',
  DOCUMENT_BATCH_VERIFIED: 'DocumentBatchVerified',
  ISSUER_DEACTIVATED: 'IssuerDeactivated',
  ISSUER_ACTIVATED: 'IssuerActivated',
  DOCUMENT_SHARED: 'DocumentShared',
  VERIFICATION_REQUESTED: 'VerificationRequested',
  CONSENT_GRANTED: 'ConsentGranted',
  CONSENT_REVOKED: 'ConsentRevoked',
  SHARE_REQUESTED: 'ShareRequested',
  DOCUMENT_UPDATED: 'DocumentUpdated',
};

// Role constants (matching keccak256 hashes in the contract)
export const ROLES = {
  ISSUER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('ISSUER_ROLE')),
  VERIFIER_ROLE: ethers.keccak256(ethers.toUtf8Bytes('VERIFIER_ROLE')),
  ADMIN_ROLE: ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE')),
  DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
};

// Test data scenarios
export const TEST_SCENARIOS = {
  // Standard valid document scenario
  STANDARD: {
    contentHash: 'standard document content',
    cid: 'ipfs://QmStandardDoc',
    type: DocumentType.GENERIC,
    validity: SECONDS_PER_YEAR,
  },
  // Document that will be updated
  UPDATEABLE: {
    contentHash: 'document to be updated',
    cid: 'ipfs://QmUpdateableDoc',
    type: DocumentType.GENERIC,
    validity: SECONDS_PER_MONTH,
    updatedContentHash: 'updated document content',
    updatedCid: 'ipfs://QmUpdatedDoc',
    updatedValidity: SECONDS_PER_YEAR,
  },
  // Document that will expire soon
  EXPIRING_SOON: {
    contentHash: 'soon to expire document',
    cid: 'ipfs://QmExpiringSoonDoc',
    type: DocumentType.GENERIC,
    validity: SECONDS_PER_DAY * 2, // 2 days
  },
  // Document for sharing tests
  SHAREABLE: {
    contentHash: 'shareable document content',
    cid: 'ipfs://QmShareableDoc',
    type: DocumentType.ID_CARD,
    validity: SECONDS_PER_YEAR,
    consentDuration: SECONDS_PER_MONTH,
  },
  // Batch processing test set
  BATCH: Array.from({ length: 5 }, (_, i) => ({
    contentHash: `batch document content ${i}`,
    cid: `ipfs://QmBatch${i}`,
    type: DocumentType.GENERIC,
    validity: SECONDS_PER_YEAR,
  })),
};
