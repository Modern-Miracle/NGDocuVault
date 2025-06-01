/**
 * Represents the access level for IPFS content
 */
export enum IPFSAccessLevel {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin'
}

/**
 * Represents an access grant for IPFS content
 */
export interface IPFSAccessGrant {
  userDid: string; // consumer or provider did
  accessLevel: IPFSAccessLevel; // will check from smart contract and prefill
  grantedAt: Date;
  expiresAt: Date;
}

/**
 * Represents encryption details for IPFS content
 */
export interface IPFSEncryption {
  iv?: string;
  keyVersion?: string;
}

/**
 * Main interface for IPFS lookup entries
 */
export interface IPFSLookup {
  id: string; // Unique identifier
  cidUrl: string; // Reference to DataRegistry record
  cidHash: string; // Hash of the recordId

  // Access Control
  accessGrants: IPFSAccessGrant[];

  // Content Information
  encryption: IPFSEncryption;

  // System Fields
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Interface for creating new IPFS lookup entries
 */
export type CreateIPFSLookup = Omit<
  IPFSLookup,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

/**
 * Interface for updating IPFS lookup entries
 */
export type UpdateIPFSLookup = Partial<
  Omit<IPFSLookup, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

/**
 * Interface for querying IPFS lookup entries
 */
export interface IPFSLookupQuery {
  cidHash?: string;
}

/**
 * Inteface for Access grant lookup
 */
