// Define the BlockchainUpdateRequest interface to match the one in IPFSService
interface BlockchainUpdateRequest {
  document: Record<string, any>;
  metadata: {
    name: string;
    documentType: string;
    owner: string;
    timestamp: number;
    contentHash: string;
    signature: string;
  };
  [key: string]: any;
}

// Sample CIDs for testing
export const TEST_CIDS = {
  regular: 'QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx',
  encrypted: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
  invalid: 'invalid-cid'
};

// Sample public key for re-encryption tests
export const TEST_PUBLIC_KEY =
  '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Sample data for upload tests
export const TEST_UPLOAD_DATA = {
  data: { key: 'value', test: true, count: 42 },
  fileName: 'test-data.json',
  contentType: 'application/json'
};

// Sample metadata for encrypted uploads
export const TEST_METADATA = {
  name: 'Test Resource',
  documentType: 'document',
  owner: '0x1234567890123456789012345678901234567890',
  timestamp: Date.now(),
  contentHash: '0xhash',
  signature: '0xsignature'
};

// Sample resource for encrypted uploads
export const TEST_RESOURCE = {
  id: 'resource-123',
  type: 'document',
  title: 'Test Document',
  content: 'This is a test document content',
  createdAt: new Date().toISOString()
};

// Sample blockchain update request
export const TEST_BLOCKCHAIN_REQUEST: BlockchainUpdateRequest = {
  document: TEST_RESOURCE,
  metadata: TEST_METADATA
};

// Sample batch files for batch upload
export const TEST_BATCH_FILES = [
  {
    document: { ...TEST_RESOURCE, id: 'resource-1' },
    metadata: { ...TEST_METADATA, name: 'Test Resource 1' }
  },
  {
    document: { ...TEST_RESOURCE, id: 'resource-2' },
    metadata: { ...TEST_METADATA, name: 'Test Resource 2' }
  }
];

// Sample encrypted data response
export const TEST_ENCRYPTED_DATA = {
  encrypted: 'encrypted-data',
  metadata: {
    ...TEST_METADATA,
    ledupVersion: '1.0.0'
  }
};

// Sample IPFS upload response
export const TEST_IPFS_UPLOAD_RESPONSE = {
  cid: TEST_CIDS.encrypted,
  size: 1024,
  timestamp: new Date().toISOString()
};

// Sample IPFS data fetch response
export const TEST_IPFS_DATA_RESPONSE = {
  data: TEST_RESOURCE,
  raw: TEST_ENCRYPTED_DATA,
  metadata: TEST_METADATA
};

// Sample bulk IPFS data fetch response
export const TEST_BULK_RESPONSE = {
  [TEST_CIDS.regular]: {
    data: { content: 'regular data' },
    raw: { content: 'raw regular data' }
  },
  [TEST_CIDS.encrypted]: { data: TEST_RESOURCE, raw: TEST_ENCRYPTED_DATA }
};
