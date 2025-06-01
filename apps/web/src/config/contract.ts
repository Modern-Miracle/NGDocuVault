const DidRegistry = import.meta.env.VITE_DID_REGISTRY_CONTRACT_ADDRESS;
const DidIssuer = import.meta.env.VITE_DID_ISSUER_CONTRACT_ADDRESS;
const DidVerifier = import.meta.env.VITE_DID_VERIFIER_CONTRACT_ADDRESS;
const DocuVault = import.meta.env.VITE_DOCU_VAULT_CONTRACT_ADDRESS;
const DidAuth = import.meta.env.VITE_DID_AUTH_CONTRACT_ADDRESS;
const VerifierFactory = import.meta.env.VITE_VERIFIER_FACTORY_CONTRACT_ADDRESS;
const AgeVerifier = import.meta.env.VITE_AGE_VERIFIER_CONTRACT_ADDRESS;
const HashVerifier = import.meta.env.VITE_HASH_VERIFIER_CONTRACT_ADDRESS;

export const CONTRACTS: { [key: string]: string } = {
  DidRegistry,
  DidIssuer,
  DidVerifier,
  DocuVault,
  DidAuth,
  VerifierFactory,
  AgeVerifier,
  HashVerifier,
};
