/**
 * DocuVault Smart Contract Type Definitions
 */

// Enum Types
export enum DocumentType {
  IDENTITY = 0,
  MEDICAL = 1,
  FINANCIAL = 2,
  EDUCATION = 3,
  LEGAL = 4,
  PROPERTY = 5,
  OTHER = 6,
}

export enum Consent {
  NONE = 0,
  REQUESTED = 1,
  GRANTED = 2,
  DENIED = 3,
}

// Base Document Structure
export interface DocumentInfo {
  isVerified: boolean;
  isExpired: boolean;
  issuer: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  documentType: DocumentType;
}

export interface DocumentBasic {
  issuer: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  isVerified: boolean;
  documentType: DocumentType;
}

export interface ConsentStatus {
  consentStatus: Consent;
  validUntil: number;
}

export interface ShareRequest {
  consent: Consent;
  validUntil: number;
}

// Function Input Types
export interface RegisterDocumentInput {
  contentHash: string;
  cid: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  documentType: DocumentType;
}

export interface RegisterDocumentsInput {
  contentHashes: string[];
  cids: string[];
  holders: string[];
  issuanceDates: number[];
  expirationDates: number[];
  documentTypes: DocumentType[];
}

export interface UpdateDocumentInput {
  oldDocumentId: string;
  contentHash: string;
  cid: string;
  expirationDate: number;
  documentType: DocumentType;
}

export interface GiveConsentInput {
  documentId: string;
  requester: string;
  consent: Consent;
  validUntil: number;
}

export interface ShareDocumentInput {
  documentId: string;
  requester: string;
}

export interface VerifyDocumentInput {
  documentId: string;
}

export interface VerifyDocumentsInput {
  documentIds: string[];
}

export interface RequestVerificationInput {
  documentId: string;
}

export interface RequestShareInput {
  documentId: string;
  requester: string;
}

export interface RevokeConsentInput {
  documentId: string;
  requester: string;
}

export interface GenerateDocumentIdInput {
  contentHash: string;
  holder: string;
  cid: string;
}

export interface VerifyCidInput {
  contentHash: string;
  holder: string;
  cid: string;
  documentId: string;
}

// Role Management Input Types
export interface RoleManagementInput {
  role: string;
  account: string;
}

export interface IssuerManagementInput {
  issuerAddr: string;
}

export interface VerifierManagementInput {
  verifierAddr: string;
}

export interface HolderManagementInput {
  userAddr: string;
}

export interface AdminManagementInput {
  adminAddr: string;
}

export interface OwnershipInput {
  newOwner: string;
}

// Function Output Types
export interface RegisterDocumentOutput {
  documentId: string;
}

export interface RegisterDocumentsOutput {
  documentIds: string[];
}

export interface ShareDocumentOutput {
  issuer: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  documentType: DocumentType;
}

export interface GetDocumentsOutput {
  documentIds: string[];
}

export interface UpdateDocumentOutput {
  documentId: string;
}

export interface GenerateDocumentIdOutput {
  documentId: string;
}

export interface GetConsentStatusOutput {
  consentStatus: Consent;
  validUntil: number;
}

export interface GetDocumentInfoOutput {
  isVerified: boolean;
  isExpired: boolean;
  issuer: string;
  holder: string;
  issuanceDate: number;
  expirationDate: number;
  documentType: DocumentType;
}

export interface IsDocumentExpiredOutput {
  expired: boolean;
}

export interface IsIssuerActiveOutput {
  active: boolean;
}

export interface VerifyCidOutput {
  valid: boolean;
}

// Role and Admin Check Output Types
export interface HasRoleOutput {
  hasRole: boolean;
}

export interface GetRoleAdminOutput {
  adminRole: string;
}

export interface PausedOutput {
  paused: boolean;
}

export interface OwnerOutput {
  owner: string;
}

// Constants Output Types
export interface RoleOutput {
  role: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  description?: string;
  issuerId: string;
  holderId: string;
  issuanceDate: string;
  expirationDate?: string;
  signature: string;
  verified: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  metadata?: Record<string, unknown>;
}

export interface DocumentCreateInput {
  id: string;
  type: DocumentType;
  title: string;
  description?: string;
  issuerId: string;
  holderId: string;
  issuanceDate: string;
  signature: string;
  verified: boolean;
  file?: File;
  metadata?: Record<string, unknown>;
}
