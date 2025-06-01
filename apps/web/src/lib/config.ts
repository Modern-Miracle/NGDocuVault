/**
 * Configuration file for API endpoints and application settings
 */

// Get environment and determine appropriate base URL
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

// API base URL with fallbacks for different environments
// The backend API routes are registered at /api/v1
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDevelopment ? '/api/v1' : '/api/v1');

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

// Network configuration
export const NETWORK_CONFIG = {
  // Use the local API proxy to avoid CORS issues
  rpcUrl: isDevelopment ? 'http://localhost:8545' : '/api/proxy/ethereum',
  walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c38e2472aec3da732926d49c0b38ae5f',
};

// Debug settings
export const DEBUG = {
  logApiCalls: isDevelopment || import.meta.env.VITE_DEBUG_API === 'true',
  logAuthState: isDevelopment || import.meta.env.VITE_DEBUG_AUTH === 'true',
};

// Constants for ENS/DID resolvers
export const ENS_RESOLVER = {
  // Use the proxy endpoint for Merkle.io to avoid CORS issues
  merkleUrl: 'http://localhost:5000/api/v1/proxy/merkle',
  timeout: 5000, // Timeout in ms
  retries: 2, // Number of retries
};
