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
