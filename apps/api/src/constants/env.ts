// rpc urls
export const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL as string;
export const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL as string;
export const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL as string;
// network ids
export const LOCAL_NETWORK_ID = process.env.LOCAL_NETWORK_ID as string;
export const SEPOLIA_NETWORK_ID = process.env.SEPOLIA_NETWORK_ID as string;
export const MAINNET_NETWORK_ID = process.env.MAINNET_NETWORK_ID as string;

// smart contract addresses
export const LOCAL_CONTRACT_ADDRESS = process.env
  .LOCAL_CONTRACT_ADDRESS as string;

export const LOCAL_DID_AUTH_CONTRACT_ADDRESS = process.env
  .LOCAL_DID_AUTH_CONTRACT_ADDRESS as string;
export const LOCAL_DID_REGISTRY_CONTRACT_ADDRESS = process.env
  .LOCAL_DID_REGISTRY_CONTRACT_ADDRESS as string;
export const LOCAL_DID_VERIFIER_CONTRACT_ADDRESS = process.env
  .LOCAL_DID_VERIFIER_CONTRACT_ADDRESS as string;
export const LOCAL_DID_ISSUER_CONTRACT_ADDRESS = process.env
  .LOCAL_DID_ISSUER_CONTRACT_ADDRESS as string;
export const LOCAL_DOCU_VAULT_CONTRACT_ADDRESS = process.env
  .LOCAL_DOCU_VAULT_CONTRACT_ADDRESS as string;

// testnet
export const SEPOLIA_CONTRACT_ADDRESS = process.env
  .SEPOLIA_CONTRACT_ADDRESS as string;
export const SEPOLIA_DID_AUTH_CONTRACT_ADDRESS = process.env
  .SEPOLIA_DID_AUTH_CONTRACT_ADDRESS as string;
export const SEPOLIA_DID_REGISTRY_CONTRACT_ADDRESS = process.env
  .SEPOLIA_DID_REGISTRY_CONTRACT_ADDRESS as string;
export const SEPOLIA_DID_VERIFIER_CONTRACT_ADDRESS = process.env
  .SEPOLIA_DID_VERIFIER_CONTRACT_ADDRESS as string;
export const SEPOLIA_DID_ISSUER_CONTRACT_ADDRESS = process.env
  .SEPOLIA_DID_ISSUER_CONTRACT_ADDRESS as string;
export const SEPOLIA_DOCU_VAULT_CONTRACT_ADDRESS = process.env
  .SEPOLIA_DOCU_VAULT_CONTRACT_ADDRESS as string;

export const MAINNET_CONTRACT_ADDRESS = process.env
  .MAINNET_CONTRACT_ADDRESS as string;
export const MAINNET_DID_AUTH_CONTRACT_ADDRESS = process.env
  .MAINNET_DID_AUTH_CONTRACT_ADDRESS as string;
export const MAINNET_DID_REGISTRY_CONTRACT_ADDRESS = process.env
  .MAINNET_DID_REGISTRY_CONTRACT_ADDRESS as string;
export const MAINNET_DID_VERIFIER_CONTRACT_ADDRESS = process.env
  .MAINNET_DID_VERIFIER_CONTRACT_ADDRESS as string;
export const MAINNET_DID_ISSUER_CONTRACT_ADDRESS = process.env
  .MAINNET_DID_ISSUER_CONTRACT_ADDRESS as string;
export const MAINNET_DOCU_VAULT_CONTRACT_ADDRESS = process.env
  .MAINNET_DOCU_VAULT_CONTRACT_ADDRESS as string;

// database configuration
export const DB_HOST = process.env.DB_HOST as string;
export const DB_PORT = parseInt(process.env.DB_PORT || '5432');
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const DB_NAME = process.env.DB_NAME as string;

// Production database configuration
export const PROD_DB_HOST = process.env.PROD_DB_HOST as string;
export const PROD_DB_PORT = parseInt(process.env.PROD_DB_PORT || '5432');
export const PROD_DB_USER = process.env.PROD_DB_USER as string;
export const PROD_DB_PASSWORD = process.env.PROD_DB_PASSWORD as string;
export const PROD_DB_NAME = process.env.PROD_DB_NAME as string;

// Wallet configuration
export const LOCAL_PRIVATE_KEY = process.env.LOCAL_PRIVATE_KEY as string;
export const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY as string;
export const MAINNET_PRIVATE_KEY = process.env.MAINNET_PRIVATE_KEY as string;

// jwts and session
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const SESSION_SECRET = process.env.SESSION_SECRET as string;

// IPFS
export const PINATA_JWT = process.env.PINATA_JWT as string;
export const PINATA_API_KEY = process.env.PINATA_API_KEY as string;
export const PINATA_API_SECRET = process.env.PINATA_API_SECRET as string;
export const PINATA_API_JWT = process.env.PINATA_API_JWT as string;
export const IPFS_GATEWAY_URL = process.env.IPFS_GATEWAY_URL as string;
