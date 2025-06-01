import { env } from '@/config/env';

/**
 * Configuration file for API endpoints and application settings
 */

// API base URL with fallbacks for different environments
// The backend API routes are registered at /api/v1
export const API_BASE_URL = '/api/v1';
const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

// SIWE authentication endpoints
export const SIWE_ENDPOINTS = {
  nonce: `${API_BASE_URL}/auth/siwe/nonce`,
  verify: `${API_BASE_URL}/auth/siwe/verify`,
  session: `${API_BASE_URL}/auth/siwe/session`,
  didInfo: `${API_BASE_URL}/auth/siwe/did-info`,
  logout: `${API_BASE_URL}/auth/siwe/logout`,
};

export const IPFS_ENDPOINTS = {
  getDataByCid: `${API_BASE_URL}/ipfs/data/:cid`,
  getDataByQuery: `${API_BASE_URL}/ipfs/data`,
  getBulkData: `${API_BASE_URL}/ipfs/data/bulk`,
  reencryptData: `${API_BASE_URL}/ipfs/reencrypt/:cid`,
  uploadJsonData: `${API_BASE_URL}/ipfs/upload/json`,
  uploadEncryptedData: `${API_BASE_URL}/ipfs/upload/encrypted`,
  batchUpload: `${API_BASE_URL}/ipfs/batch/upload`,
  batchDelete: `${API_BASE_URL}/ipfs/batch`,
  deleteData: `${API_BASE_URL}/ipfs/data`,
};

console.log('env.VITE_RPC_URL', env.VITE_RPC_URL);
// Network configuration
export const NETWORK_CONFIG = {
  // Use the local API proxy to avoid CORS issues
  rpcUrl: env.VITE_RPC_URL,
  walletConnectProjectId: env.VITE_WALLETCONNECT_PROJECT_ID,
};

// Debug settings
export const DEBUG = {
  logApiCalls: isDevelopment || import.meta.env.VITE_DEBUG_API === 'true',
  logAuthState: isDevelopment || import.meta.env.VITE_DEBUG_AUTH === 'true',
};

// Constants for ENS/DID resolvers
export const ENS_RESOLVER = {
  // Use the proxy endpoint for Merkle.io to avoid CORS issues
  merkleUrl: `${env.VITE_API_BASE_URL}/proxy/merkle`,
  timeout: 5000, // Timeout in ms
  retries: 2, // Number of retries
};
