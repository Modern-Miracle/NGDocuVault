// Types
export interface IPFSUploadResponse {
  cid: string;
  size: number;
  contentHash: string;
}

export interface IPFSDataResponse {
  data: unknown;
  metadata: {
    cid: string;
    contentHash: string;
  };
}

export interface IPFSBackendResponse {
  success: boolean;
  results: Array<{
    cid: string;
    data: unknown;
    metadata: unknown;
    success: boolean;
  }>;
  summary: {
    total: number;
    success: number;
    failed: number;
    successRate: number;
  };
}

export interface IPFSDataBulkResponse extends IPFSBackendResponse {
  message: string;
}

export interface UpdateBlockchainParams {
  recordId: string;
  cid: string;
  contentHash: string;
  resourceType: number;
  dataSize: number;
}
