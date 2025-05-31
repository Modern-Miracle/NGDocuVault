import { env } from './env';

export const CONTRACTS: { [key: string]: string } = {
  DidRegistry: env.VITE_DID_REGISTRY_CONTRACT_ADDRESS!,
  DidIssuer: env.VITE_DID_ISSUER_CONTRACT_ADDRESS!,
  DidVerifier: env.VITE_DID_VERIFIER_CONTRACT_ADDRESS!,
  DocuVault: env.VITE_DOCU_VAULT_CONTRACT_ADDRESS!,
  DidAuth: env.VITE_DID_AUTH_CONTRACT_ADDRESS!,
  VerifierFactory: env.VITE_VERIFIER_FACTORY_CONTRACT_ADDRESS!,
  AgeVerifier: env.VITE_AGE_VERIFIER_CONTRACT_ADDRESS!,
  HashVerifier: env.VITE_HASH_VERIFIER_CONTRACT_ADDRESS!,
};

// const DidRegistry = import.meta.env.VITE_DID_REGISTRY_CONTRACT_ADDRESS;
// const DidIssuer = import.meta.env.VITE_DID_ISSUER_CONTRACT_ADDRESS;
// const DidVerifier = import.meta.env.VITE_DID_VERIFIER_CONTRACT_ADDRESS;
// const DocuVault = import.meta.env.VITE_DOCU_VAULT_CONTRACT_ADDRESS;
// const DidAuth = import.meta.env.VITE_DID_AUTH_CONTRACT_ADDRESS;
// const VerifierFactory = import.meta.env.VITE_VERIFIER_FACTORY_CONTRACT_ADDRESS;
// const AgeVerifier = import.meta.env.VITE_AGE_VERIFIER_CONTRACT_ADDRESS;
// const HashVerifier = import.meta.env.VITE_HASH_VERIFIER_CONTRACT_ADDRESS;

// const testDidRegistry = import.meta.env.VITE_SEPOLIA_DID_REGISTRY_CONTRACT_ADDRESS;
// const testDidIssuer = import.meta.env.VITE_SEPOLIA_DID_ISSUER_CONTRACT_ADDRESS;
// const testDidVerifier = import.meta.env.VITE_SEPOLIA_DID_VERIFIER_CONTRACT_ADDRESS;
// const testDocuVault = import.meta.env.VITE_SEPOLIA_DOCU_VAULT_CONTRACT_ADDRESS;
// const testDidAuth = import.meta.env.VITE_SEPOLIA_DID_AUTH_CONTRACT_ADDRESS;
// const testVerifierFactory = import.meta.env.VITE_SEPOLIA_VERIFIER_FACTORY_CONTRACT_ADDRESS;
// const testAgeVerifier = import.meta.env.VITE_SEPOLIA_AGE_VERIFIER_CONTRACT_ADDRESS;
// const testHashVerifier = import.meta.env.VITE_SEPOLIA_HASH_VERIFIER_CONTRACT_ADDRESS;

// const env = import.meta.env.NODE_ENV || 'development';

// const isTestEnv = env === 'production' || env === 'development';
