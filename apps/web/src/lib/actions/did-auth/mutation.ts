import { DidAuthABI } from '@docu/abi';
import { CONTRACTS } from '@/config/contract';
import { parseDidAuthError } from './error-parser';
import { env } from '@/config/env';

/**
 * Configuration for the DID Auth contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DidAuth as `0x${string}`,
  chainId: Number(env.VITE_CHAIN_ID),
  rpcUrl: env.VITE_RPC_URL,
};

// console.log(CONTRACTS.DidAuth);

/**
 * Type for transaction response with additional metadata
 */
type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
  // For client-side transaction preparation
  contractAddress?: `0x${string}`;
  abi?: typeof DidAuthABI;
  functionName?: string;
  args?: unknown[];
};

/**
 * Grant a role to a DID
 * @param did - The DID to grant the role to
 * @param role - The role to grant
 * @returns The transaction response
 */
export async function grantDidRole(did: string, role: string): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'grantDidRole',
      args: [did, role],
    };
  } catch (error) {
    console.error('Error granting DID role:', error);
    const parsedError = parseDidAuthError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Revoke a role from a DID
 * @param did - The DID to revoke the role from
 * @param role - The role to revoke
 * @returns The transaction response
 */
export async function revokeDidRole(did: string, role: string): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'revokeDidRole',
      args: [did, role],
    };
  } catch (error) {
    console.error('Error revoking DID role:', error);
    const parsedError = parseDidAuthError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Set a trusted issuer for a credential type
 * @param credentialType - The credential type
 * @param issuer - The issuer address
 * @param trusted - Whether the issuer should be trusted
 * @returns The transaction response
 */
export async function setTrustedIssuer(
  credentialType: string,
  issuer: `0x${string}`,
  trusted: boolean
): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'setTrustedIssuer',
      args: [credentialType, issuer, trusted],
    };
  } catch (error) {
    console.error('Error setting trusted issuer:', error);
    const parsedError = parseDidAuthError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Set the credential requirement for a role
 * @param role - The role to set the requirement for
 * @param requirement - The credential type required
 * @returns The transaction response
 */
export async function setRoleRequirement(role: string, requirement: string): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'setRoleRequirement',
      args: [role, requirement],
    };
  } catch (error) {
    console.error('Error setting role requirement:', error);
    const parsedError = parseDidAuthError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Issue a credential to a DID
 * @param credentialType - The type of credential to issue
 * @param did - The DID to issue the credential to
 * @param credentialId - The unique identifier for the credential
 * @returns The transaction response
 */
export async function issueCredential(
  credentialType: string,
  did: string,
  credentialId: string
): Promise<TransactionResponse> {
  try {
    return {
      success: true,
      contractAddress: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'issueCredential',
      args: [credentialType, did, credentialId],
    };
  } catch (error) {
    console.error('Error issuing credential:', error);
    const parsedError = parseDidAuthError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

// Note: The DID Auth contract doesn't have any state-changing functions in the ABI.
// All functions are view functions, so there are no mutation functions to implement.
// This file is included for consistency with the data-registry implementation pattern.
