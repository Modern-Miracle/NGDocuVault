import { DocumentType, ConsentStatus } from './generated/graphql';

/**
 * GraphQL Context interface
 * This will be available in all resolver functions
 */
export interface GraphQLContext {
  dataSources: {
    documents: DocumentDataSource;
    issuers: IssuerDataSource;
    holders: HolderDataSource;
    dids: DIDDataSource;
    verifiers: VerifierDataSource;
  };
  user?: {
    id: string;
    address: string;
  };
}

/**
 * Data source interfaces
 */
export interface DocumentDataSource {
  getDocumentById(id: string): Promise<DocumentModel | null>;
  getDocuments(args: {
    first?: number;
    skip?: number;
    where?: {
      documentType?: DocumentType;
      isVerified?: boolean;
    };
  }): Promise<DocumentModel[]>;
  getDocumentsByHolder(holderId: string, first: number, skip: number): Promise<DocumentModel[]>;
  getDocumentsCount(): Promise<number>;
}

export interface IssuerDataSource {
  getIssuerById(id: string): Promise<IssuerModel | null>;
  getIssuers(first?: number, skip?: number): Promise<IssuerModel[]>;
  getIssuersCount(): Promise<number>;
}

export interface HolderDataSource {
  getHolderById(id: string): Promise<HolderModel | null>;
  getHolders(first?: number, skip?: number): Promise<HolderModel[]>;
  getHoldersCount(): Promise<number>;
}

export interface DIDDataSource {
  getDIDById(id: string): Promise<DIDModel | null>;
  getDIDs(first?: number, skip?: number): Promise<DIDModel[]>;
}

export interface VerifierDataSource {
  getVerifierById(id: string): Promise<VerifierModel | null>;
  getVerifiers(first?: number, skip?: number): Promise<VerifierModel[]>;
}

/**
 * Data models
 */
export interface DocumentModel {
  id: string;
  documentId: string;
  issuer: IssuerModel;
  holder: HolderModel;
  issuanceDate: string;
  expirationDate: string;
  isVerified: boolean;
  documentType: DocumentType;
  verifiedAt?: string;
  verifiedBy?: string;
  isExpired: boolean;
  registeredAt: string;
  previousVersion?: DocumentModel;
  shareRequests: ShareRequestModel[];
  verificationRequests: VerificationRequestModel[];
  updates: DocumentModel[];
}

export interface IssuerModel {
  id: string;
  address: string;
  isActive: boolean;
  registeredAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
  documents: DocumentModel[];
}

export interface HolderModel {
  id: string;
  address: string;
  documents: DocumentModel[];
  shareRequests: ShareRequestModel[];
  verificationRequests: VerificationRequestModel[];
}

export interface ShareRequestModel {
  id: string;
  document: DocumentModel;
  requester: string;
  holder: HolderModel;
  status: ConsentStatus;
  requestedAt: string;
  validUntil?: string;
  grantedAt?: string;
  revokedAt?: string;
}

export interface VerificationRequestModel {
  id: string;
  document: DocumentModel;
  holder: HolderModel;
  requestedAt: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface DIDModel {
  id: string;
  did: string;
  controller: string;
  active: boolean;
  lastUpdated: string;
  publicKey?: string;
  document?: string;
  credentials: CredentialModel[];
  roles: RoleModel[];
}

export interface CredentialModel {
  id: string;
  credentialType: string;
  subject: DIDModel;
  credentialId: string;
  issuedAt: string;
  issuer: string;
  verified?: boolean;
  verifiedAt?: string;
}

export interface RoleModel {
  id: string;
  did: DIDModel;
  role: string;
  granted: boolean;
  grantedAt: string;
  revokedAt?: string;
}

export interface VerifierModel {
  id: string;
  address: string;
  verifierType: string;
  owner: string;
  createdAt: string;
  verifications: VerificationModel[];
}

export interface VerificationModel {
  id: string;
  success: boolean;
  timestamp: string;
  verifier: VerifierModel;
}
