import dotenv from 'dotenv';
dotenv.config();
import * as env from '../constants/env';

interface NetworkConfig {
  rpcUrl: string;
  networkId: number;
  contractAddress: string;
  privateKey: string;
  didAuthContractAddress: string;
  didRegistryContractAddress: string;
  didVerifierContractAddress: string;
  didIssuerContractAddress: string;
  docuVaultContractAddress: string;
}

const getNetworkConfig = (): NetworkConfig => {
  if (process.env.NODE_ENV === 'test') {
    return {
      rpcUrl: 'http://127.0.0.1:8545',
      networkId: 1337,
      privateKey:
        '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      didAuthContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa1',
      didRegistryContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa2',
      didVerifierContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      didIssuerContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa4',
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa5',
      docuVaultContractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa6'
    };
  }

  console.log(process.env.NETWORK);
  switch (process.env.NETWORK) {
    case 'local':
      return {
        rpcUrl: env.LOCAL_RPC_URL,
        networkId: Number(env.LOCAL_NETWORK_ID),
        contractAddress: env.LOCAL_CONTRACT_ADDRESS,
        privateKey: env.LOCAL_PRIVATE_KEY,
        didAuthContractAddress: env.LOCAL_DID_AUTH_CONTRACT_ADDRESS,
        didRegistryContractAddress: env.LOCAL_DID_REGISTRY_CONTRACT_ADDRESS,
        didVerifierContractAddress: env.LOCAL_DID_VERIFIER_CONTRACT_ADDRESS,
        didIssuerContractAddress: env.LOCAL_DID_ISSUER_CONTRACT_ADDRESS,
        docuVaultContractAddress: env.LOCAL_DOCU_VAULT_CONTRACT_ADDRESS
      };
    case 'sepolia':
      return {
        rpcUrl: env.TESTNET_RPC_URL,
        networkId: Number(env.TESTNET_NETWORK_ID),
        contractAddress: env.TESTNET_CONTRACT_ADDRESS,
        privateKey: env.TESTNET_PRIVATE_KEY,
        didAuthContractAddress: env.TESTNET_DID_AUTH_CONTRACT_ADDRESS,
        didRegistryContractAddress: env.TESTNET_DID_REGISTRY_CONTRACT_ADDRESS,
        didVerifierContractAddress: env.TESTNET_DID_VERIFIER_CONTRACT_ADDRESS,
        didIssuerContractAddress: env.TESTNET_DID_ISSUER_CONTRACT_ADDRESS,
        docuVaultContractAddress: env.TESTNET_DOCU_VAULT_CONTRACT_ADDRESS
      };
    case 'mainnet':
      return {
        rpcUrl: env.MAINNET_RPC_URL,
        networkId: Number(env.MAINNET_NETWORK_ID),
        contractAddress: env.MAINNET_CONTRACT_ADDRESS,
        privateKey: env.MAINNET_PRIVATE_KEY,
        didAuthContractAddress: env.MAINNET_DID_AUTH_CONTRACT_ADDRESS,
        didRegistryContractAddress: env.MAINNET_DID_REGISTRY_CONTRACT_ADDRESS,
        didVerifierContractAddress: env.MAINNET_DID_VERIFIER_CONTRACT_ADDRESS,
        didIssuerContractAddress: env.MAINNET_DID_ISSUER_CONTRACT_ADDRESS,
        docuVaultContractAddress: env.MAINNET_DOCU_VAULT_CONTRACT_ADDRESS
      };
    default:
      throw new Error('Invalid NETWORK');
  }
};

export const config = getNetworkConfig();
