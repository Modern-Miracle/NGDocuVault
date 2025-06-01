import { ethers } from 'hardhat';
import { DidRegistry, DidVerifier, DidIssuer, DidAuth } from '../../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

export interface DidAuthTestContext {
  // Signers
  owner: HardhatEthersSigner;
  admin: HardhatEthersSigner;
  issuer: HardhatEthersSigner;
  user1: HardhatEthersSigner;
  user2: HardhatEthersSigner;
  unauthorized: HardhatEthersSigner;

  // Contracts
  didRegistry: DidRegistry;
  didVerifier: DidVerifier;
  didIssuer: DidIssuer;
  didAuth: DidAuth;

  // Role constants
  DEFAULT_ADMIN_ROLE: string;
  ADMIN_ROLE: string;
  OPERATOR_ROLE: string;
  PRODUCER_ROLE: string;
  CONSUMER_ROLE: string;
  PROVIDER_ROLE: string;
  ISSUER_ROLE: string;
  VERIFIER_ROLE: string;

  // Credential type constants
  PRODUCER_CREDENTIAL: string;
  CONSUMER_CREDENTIAL: string;
  PROVIDER_CREDENTIAL: string;

  // DIDs
  adminDid: string;
  issuerDid: string;
  user1Did: string;
  user2Did: string;

  // Helper functions
  registerDid: (signer: HardhatEthersSigner, did: string, document: string, publicKey: string) => Promise<void>;
  grantRole: (signer: HardhatEthersSigner, did: string, role: string) => Promise<void>;
  revokeRole: (signer: HardhatEthersSigner, did: string, role: string) => Promise<void>;
  issueCredential: (
    signer: HardhatEthersSigner,
    credentialType: string,
    did: string,
    credentialId: string
  ) => Promise<void>;
  setTrustedIssuer: (
    signer: HardhatEthersSigner,
    credentialType: string,
    issuerAddress: string,
    trusted: boolean
  ) => Promise<void>;
  setRoleRequirement: (signer: HardhatEthersSigner, role: string, credentialType: string) => Promise<void>;
  verifyCredential: (
    signer: HardhatEthersSigner,
    did: string,
    credentialType: string,
    credentialId: string
  ) => Promise<boolean>;
  isValidTimestamp: (timestamp: number | bigint) => boolean;
}

/**
 * Validates if a timestamp is reasonably recent (within the last hour)
 */
export function isValidTimestamp(timestamp: number | bigint): boolean {
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const ts = BigInt(timestamp);
  // 1 hour window to accommodate test suite execution time
  return ts >= currentTime - BigInt(3600) && ts <= currentTime + BigInt(3600);
}

/**
 * Sets up the test environment for DidAuth tests
 */
export async function setupDidAuthTest(): Promise<DidAuthTestContext> {
  // Get signers
  const [owner, admin, issuer, user1, user2, unauthorized] = await ethers.getSigners();

  // Deploy DidRegistry
  const DidRegistryFactory = await ethers.getContractFactory('DidRegistry');
  const didRegistry = await DidRegistryFactory.deploy();
  await didRegistry.waitForDeployment();

  // Deploy DidVerifier
  const DidVerifierFactory = await ethers.getContractFactory('DidVerifier');
  const didVerifier = await DidVerifierFactory.deploy(await didRegistry.getAddress());
  await didVerifier.waitForDeployment();

  // Deploy DidIssuer
  const DidIssuerFactory = await ethers.getContractFactory('DidIssuer');
  const didIssuer = await DidIssuerFactory.deploy(await didRegistry.getAddress());
  await didIssuer.waitForDeployment();

  // Deploy DidAuth
  const DidAuthFactory = await ethers.getContractFactory('DidAuth');
  const didAuth = await DidAuthFactory.deploy(
    await didRegistry.getAddress(),
    await didVerifier.getAddress(),
    await didIssuer.getAddress(),
    owner.address
  );
  await didAuth.waitForDeployment();

  // Create DIDs for testing
  const adminDid = `did:example:admin:${admin.address}`;
  const issuerDid = `did:example:issuer:${issuer.address}`;
  const user1Did = `did:example:user1:${user1.address}`;
  const user2Did = `did:example:user2:${user2.address}`;

  // Register DIDs
  await didRegistry.connect(admin).registerDid(adminDid, '{"name":"Admin"}', '0xadmin');
  await didRegistry.connect(issuer).registerDid(issuerDid, '{"name":"Issuer"}', '0xissuer');
  await didRegistry.connect(user1).registerDid(user1Did, '{"name":"User1"}', '0xuser1');
  await didRegistry.connect(user2).registerDid(user2Did, '{"name":"User2"}', '0xuser2');

  // Get role constants
  const DEFAULT_ADMIN_ROLE = await didAuth.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await didAuth.ADMIN_ROLE();
  const OPERATOR_ROLE = await didAuth.OPERATOR_ROLE();
  const PRODUCER_ROLE = await didAuth.PRODUCER_ROLE();
  const CONSUMER_ROLE = await didAuth.CONSUMER_ROLE();
  const PROVIDER_ROLE = await didAuth.PROVIDER_ROLE();
  const ISSUER_ROLE = await didAuth.ISSUER_ROLE();
  const VERIFIER_ROLE = await didAuth.VERIFIER_ROLE();

  // Get credential type constants
  const PRODUCER_CREDENTIAL = await didAuth.PRODUCER_CREDENTIAL();
  const CONSUMER_CREDENTIAL = await didAuth.CONSUMER_CREDENTIAL();
  const PROVIDER_CREDENTIAL = await didAuth.PROVIDER_CREDENTIAL();

  // Helper functions
  const registerDid = async (
    signer: HardhatEthersSigner,
    did: string,
    document: string,
    publicKey: string
  ): Promise<void> => {
    await didRegistry.connect(signer).registerDid(did, document, publicKey);
  };

  const grantRole = async (signer: HardhatEthersSigner, did: string, role: string): Promise<void> => {
    await didAuth.connect(signer).grantDidRole(did, role);
  };

  const revokeRole = async (signer: HardhatEthersSigner, did: string, role: string): Promise<void> => {
    await didAuth.connect(signer).revokeDidRole(did, role);
  };

  const issueCredential = async (
    signer: HardhatEthersSigner,
    credentialType: string,
    did: string,
    credentialId: string
  ): Promise<void> => {
    await didAuth.connect(signer).issueCredential(credentialType, did, ethers.id(credentialId));
  };

  const setTrustedIssuer = async (
    signer: HardhatEthersSigner,
    credentialType: string,
    issuerAddress: string,
    trusted: boolean
  ): Promise<void> => {
    await didAuth.connect(signer).setTrustedIssuer(credentialType, issuerAddress, trusted);
  };

  const setRoleRequirement = async (
    signer: HardhatEthersSigner,
    role: string,
    credentialType: string
  ): Promise<void> => {
    await didAuth.connect(signer).setRoleRequirement(role, credentialType);
  };

  const verifyCredential = async (
    signer: HardhatEthersSigner,
    did: string,
    credentialType: string,
    credentialId: string
  ): Promise<boolean> => {
    return await didAuth.connect(signer).verifyCredentialForAction(did, credentialType, ethers.id(credentialId));
  };

  // Grant roles to test users
  await didAuth.connect(owner).grantDidRole(adminDid, ADMIN_ROLE);
  await didAuth.connect(owner).grantDidRole(issuerDid, ISSUER_ROLE);

  return {
    owner,
    admin,
    issuer,
    user1,
    user2,
    unauthorized,
    didRegistry,
    didVerifier,
    didIssuer,
    didAuth,
    DEFAULT_ADMIN_ROLE,
    ADMIN_ROLE,
    OPERATOR_ROLE,
    PRODUCER_ROLE,
    CONSUMER_ROLE,
    PROVIDER_ROLE,
    ISSUER_ROLE,
    VERIFIER_ROLE,
    PRODUCER_CREDENTIAL,
    CONSUMER_CREDENTIAL,
    PROVIDER_CREDENTIAL,
    adminDid,
    issuerDid,
    user1Did,
    user2Did,
    registerDid,
    grantRole,
    revokeRole,
    issueCredential,
    setTrustedIssuer,
    setRoleRequirement,
    verifyCredential,
    isValidTimestamp,
  };
}
