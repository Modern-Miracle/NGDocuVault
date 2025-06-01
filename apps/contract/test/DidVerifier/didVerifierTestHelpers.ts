import { ethers } from 'hardhat';
import { DidRegistry, DidVerifier } from '../../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

export interface DidVerifierTestContext {
  // Signers
  owner: HardhatEthersSigner;
  issuer1: HardhatEthersSigner;
  issuer2: HardhatEthersSigner;
  user1: HardhatEthersSigner;
  user2: HardhatEthersSigner;
  unauthorized: HardhatEthersSigner;

  // Contracts
  didRegistry: DidRegistry;
  didVerifier: DidVerifier;

  // DIDs
  issuer1Did: string;
  issuer2Did: string;
  user1Did: string;
  user2Did: string;

  // Credential types
  CONSUMER_CREDENTIAL: string;
  PROVIDER_CREDENTIAL: string;
  ADMIN_CREDENTIAL: string;

  // Helper functions
  registerDid: (signer: HardhatEthersSigner, did: string, document: string, publicKey: string) => Promise<void>;
  deactivateDid: (signer: HardhatEthersSigner, did: string) => Promise<void>;
  reactivateDid: (signer: HardhatEthersSigner, did: string) => Promise<void>;
  setIssuerTrustStatus: (
    signer: HardhatEthersSigner,
    credentialType: string,
    issuer: HardhatEthersSigner,
    trusted: boolean
  ) => Promise<void>;
  isValidTimestamp: (timestamp: bigint) => boolean;
}

/**
 * Setup function for DidVerifier tests
 */
export async function setupDidVerifierTest(): Promise<DidVerifierTestContext> {
  // Get signers
  const [owner, issuer1, issuer2, user1, user2, unauthorized] = await ethers.getSigners();

  // Deploy DidRegistry
  const didRegistryFactory = await ethers.getContractFactory('DidRegistry');
  const didRegistry = await didRegistryFactory.deploy();

  // Deploy DidVerifier
  const didVerifierFactory = await ethers.getContractFactory('DidVerifier');
  const didVerifier = await didVerifierFactory.deploy(await didRegistry.getAddress());

  // Create DIDs
  const issuer1Did = `did:example:issuer1:${issuer1.address}`;
  const issuer2Did = `did:example:issuer2:${issuer2.address}`;
  const user1Did = `did:example:user1:${user1.address}`;
  const user2Did = `did:example:user2:${user2.address}`;

  // Register DIDs
  await didRegistry.connect(issuer1).registerDid(issuer1Did, '{"name":"Issuer 1 Document"}', '0xissuer1key');

  await didRegistry.connect(issuer2).registerDid(issuer2Did, '{"name":"Issuer 2 Document"}', '0xissuer2key');

  await didRegistry.connect(user1).registerDid(user1Did, '{"name":"User 1 Document"}', '0xuser1key');

  await didRegistry.connect(user2).registerDid(user2Did, '{"name":"User 2 Document"}', '0xuser2key');

  // Credential types
  const CONSUMER_CREDENTIAL = 'CONSUMER_CREDENTIAL';
  const PROVIDER_CREDENTIAL = 'PROVIDER_CREDENTIAL';
  const ADMIN_CREDENTIAL = 'ADMIN_CREDENTIAL';

  // Helper functions
  const registerDid = async (signer: HardhatEthersSigner, did: string, document: string, publicKey: string) => {
    await didRegistry.connect(signer).registerDid(did, document, publicKey);
  };

  const deactivateDid = async (signer: HardhatEthersSigner, did: string) => {
    await didRegistry.connect(signer).deactivateDid(did);
  };

  const reactivateDid = async (signer: HardhatEthersSigner, did: string) => {
    await didRegistry.connect(signer).reactivateDid(did);
  };

  const setIssuerTrustStatus = async (
    signer: HardhatEthersSigner,
    credentialType: string,
    issuer: HardhatEthersSigner,
    trusted: boolean
  ) => {
    await didVerifier.connect(signer).setIssuerTrustStatus(credentialType, issuer.address, trusted);
  };

  // Helper to check if timestamp is recent
  const isValidTimestamp = (timestamp: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const fiveMinutesAgo = now - BigInt(300);
    const fiveMinutesFromNow = now + BigInt(300);

    return timestamp >= fiveMinutesAgo && timestamp <= fiveMinutesFromNow;
  };

  return {
    owner,
    issuer1,
    issuer2,
    user1,
    user2,
    unauthorized,
    didRegistry,
    didVerifier,
    issuer1Did,
    issuer2Did,
    user1Did,
    user2Did,
    CONSUMER_CREDENTIAL,
    PROVIDER_CREDENTIAL,
    ADMIN_CREDENTIAL,
    registerDid,
    deactivateDid,
    reactivateDid,
    setIssuerTrustStatus,
    isValidTimestamp,
  };
}
