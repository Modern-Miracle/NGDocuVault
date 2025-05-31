import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { DidAuthABI } from '@docu/abi';
import { parseDidAuthError } from './error-parser';
import { CONTRACTS } from '@/config/contract';
import { getRoleHash } from './utils';
import { CONFIRMED_ROLE_NAMES } from '@/utils/roles';
import { RoleOutput } from '../docu-vault/types';
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

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = defaultConfig) => {
  return createPublicClient({
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
};

/**
 * Authenticate a DID for a specific role
 * @param did - The DID to authenticate
 * @param role - The role to authenticate for
 * @returns Whether the DID is authenticated for the role
 */
export async function authenticate(did: string, role: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    // Convert the role string to bytes32 hash
    const roleHash = getRoleHash(role);

    console.log(`[authenticate] Authenticating DID ${did} for role ${role} (hash: ${roleHash})`);

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'authenticate',
      args: [did, roleHash],
    })) as boolean;
  } catch (error) {
    console.error('Error authenticating DID:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the DID for an address
 * @param address - The address to get the DID for
 * @returns The DID associated with the address
 */
export async function getDid(address: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getDidFromAddress',
      args: [address],
    })) as string;
  } catch (error) {
    console.error('Error getting DID for address:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the required credential for a role
 * @param role - The role to get the required credential for
 * @returns The required credential for the role
 */
export async function getRequiredCredentialForRole(role: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    // Convert the role string to bytes32 hash
    const roleHash = getRoleHash(role);

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getRequiredCredentialForRole',
      args: [roleHash],
    })) as string;
  } catch (error) {
    console.error('Error getting required credential for role:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Check if a DID has the required roles and credentials
 * @param did - The DID to check
 * @param roles - The roles to check
 * @param credentialIds - The credential IDs to check
 * @returns Whether the DID has the required roles and credentials
 */
export async function hasRequiredRolesAndCredentials(
  did: string,
  roles: string[],
  credentialIds: string[]
): Promise<boolean> {
  try {
    const publicClient = getPublicClient();

    // Convert the role strings to bytes32 hashes
    const roleHashes = roles.map((role) => getRoleHash(role));
    // Convert the credential IDs to bytes32 if needed
    const credentialHashes = credentialIds.map((id) => {
      return id.startsWith('0x') ? (id as `0x${string}`) : getRoleHash(id);
    });

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'hasRequiredRolesAndCredentials',
      args: [did, roleHashes, credentialHashes],
    })) as boolean;
  } catch (error) {
    console.error('Error checking required roles and credentials:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Verify a credential for an action
 * @param did - The DID to verify
 * @param credentialType - The credential type to verify
 * @param credentialId - The credential ID to verify
 * @returns Whether the credential is verified for the action
 */
export async function verifyCredentialForAction(
  did: string,
  credentialType: string,
  credentialId: string
): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'verifyCredentialForAction',
      args: [did, credentialType, credentialId],
    })) as boolean;
  } catch (error) {
    console.error('Error verifying credential for action:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the holder credential type
 * @returns The holder credential type
 */
export async function getHolderCredential(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'HOLDER_CREDENTIAL',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting holder credential:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the producer credential type
 * @returns The producer credential type
 */
export async function getIssuerCredential(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'ISSUER_CREDENTIAL',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting issuer credential:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the producer role
 * @returns The producer role
 */
export async function getHolderRole(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'HOLDER_ROLE',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting holder role:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the service provider credential type
 * @returns The service provider credential type
 */
export async function getVerifierCredential(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'VERIFIER_CREDENTIAL',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting verifier credential:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the DID issuer contract address
 * @returns The DID issuer contract address
 */
export async function getDidIssuerAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'didIssuer',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting DID issuer address:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the DID registry contract address
 * @returns The DID registry contract address
 */
export async function getDidRegistryAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'didRegistry',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting DID registry address:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the DID verifier contract address
 * @returns The DID verifier contract address
 */
export async function getDidVerifierAddress(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'didVerifier',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting DID verifier address:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the caller's DID
 * @returns The DID of the caller
 */
export async function getCallerDid(): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getCallerDid',
      args: [],
    })) as string;
  } catch (error) {
    console.error('Error getting caller DID:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Resolve a DID to its controller address
 * @param did - The DID to resolve
 * @returns The controller address of the DID
 */
export async function resolveDidDocument(did: string): Promise<`0x${string}`> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'resolveDid',
      args: [did],
    })) as `0x${string}`;
  } catch (error) {
    console.error('Error resolving DID:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Check if a DID has a specific role
 * @param did - The DID to check
 * @param role - The role to check
 * @returns Whether the DID has the role
 */
export async function hasDidRole(did: string, role: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    // Convert the role string to bytes32 hash
    const roleHash = getRoleHash(role);

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'hasDidRole',
      args: [did, roleHash],
    })) as boolean;
  } catch (error) {
    console.error('Error checking DID role:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Check if an account has a specific role
 * @param role - The role to check
 * @param account - The account to check
 * @returns Whether the account has the role
 */
export async function hasRole(role: string, account: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    // Convert the role string to bytes32 hash
    const roleHash = getRoleHash(role);

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'hasRole',
      args: [roleHash, account],
    })) as boolean;
  } catch (error) {
    console.error('Error checking role:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Check if an issuer is trusted for a credential type
 * @param credentialType - The credential type to check
 * @param issuer - The issuer address to check
 * @returns Whether the issuer is trusted for the credential type
 */
export async function isTrustedIssuer(credentialType: string, issuer: `0x${string}`): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'isTrustedIssuer',
      args: [credentialType, issuer],
    })) as boolean;
  } catch (error) {
    console.error('Error checking trusted issuer:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get all roles assigned to a DID
 * @param did - The DID to get roles for
 * @returns Array of roles assigned to the DID
 */
export async function getUserRoles(did: string): Promise<`0x${string}`[]> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getUserRoles',
      args: [did],
    })) as `0x${string}`[];
  } catch (error) {
    console.error('Error getting user roles for DID:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get all roles assigned to an address
 * @param address - The address to get roles for
 * @returns Array of roles assigned to the address
 */
export async function getUserRolesByAddress(address: `0x${string}`): Promise<`0x${string}`[]> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'getUserRolesByAddress',
      args: [address],
    })) as `0x${string}`[];
  } catch (error) {
    console.error('Error getting user roles for address:', error);
    const parsedError = parseDidAuthError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

export async function getAllRoles() {
  const publicClient = getPublicClient();
  const roles: Record<string, string> = {};

  await Promise.all(
    CONFIRMED_ROLE_NAMES.map(async (roleName) => {
      try {
        const roleHash = await publicClient.readContract({
          address: defaultConfig.contractAddress,
          abi: DidAuthABI,
          functionName: roleName,
        });
        roles[roleName] = roleHash as string;
      } catch (error) {
        console.error(`Error fetching ${roleName}:`, error);
        roles[roleName] = 'Role not found';
      }
    })
  );

  return roles;
}

/**
 * Check if an address is an admin
 * @param address - The address to check
 * @returns Boolean indicating if the address is an admin
 */
export async function isAdmin(address: string): Promise<boolean> {
  if (!address) {
    throw new Error('Address is required');
  }

  try {
    const isAdmin = await hasRole('ADMIN', address as `0x${string}`);

    return isAdmin;
  } catch (error) {
    console.error('Error checking if address is admin:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if address is admin');
  }
}

/**
 * Check if an address is an issuer
 * @param address - The address to check
 * @returns Boolean indicating if the address is an issuer
 */
export async function isIssuer(address: string): Promise<boolean> {
  if (!address) {
    throw new Error('Address is required');
  }

  try {
    const isIssuer = await hasRole('ISSUER', address as `0x${string}`);
    return isIssuer;
  } catch (error) {
    console.error('Error checking if address is issuer:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if address is issuer');
  }
}

/**
 * Check if an address is a verifier
 * @param address - The address to check
 * @returns Boolean indicating if the address is a verifier
 */
export async function isVerifier(address: string): Promise<boolean> {
  if (!address) {
    throw new Error('Address is required');
  }

  try {
    const isVerifier = await hasRole('VERIFIER', address as `0x${string}`);

    return isVerifier;
  } catch (error) {
    console.error('Error checking if address is verifier:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if address is verifier');
  }
}

/**
 *
 * Check if an address is a holder
 * @param address - The address to check
 * @returns Boolean indicating if the address is a holder
 */

/**
 * Check if an address is a holder
 * @param address - The address to check
 * @returns Boolean indicating if the address is a holder
 */

export async function isHolder(address: string): Promise<boolean> {
  if (!address) {
    throw new Error('Address is required');
  }

  try {
    const isHolder = await hasRole('HOLDER', address as `0x${string}`);
    return isHolder;
  } catch (error) {
    console.error('Error checking if address is holder:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if address is holder');
  }
}

/**
 * Get the ADMIN_ROLE constant
 * @returns The bytes32 hash of the ADMIN_ROLE
 */
export async function getAdminRole(): Promise<RoleOutput> {
  try {
    const publicClient = getPublicClient();
    const adminRole = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'ADMIN_ROLE',
    });

    return { role: adminRole as string };
  } catch (error) {
    console.error('Error getting ADMIN_ROLE:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get ADMIN_ROLE');
  }
}

/**
 * Get the DEFAULT_ADMIN_ROLE constant
 * @returns The bytes32 hash of the DEFAULT_ADMIN_ROLE
 */
export async function getDefaultAdminRole(): Promise<RoleOutput> {
  try {
    const publicClient = getPublicClient();
    const defaultAdminRole = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'DEFAULT_ADMIN_ROLE',
    });

    return { role: defaultAdminRole as string };
  } catch (error) {
    console.error('Error getting DEFAULT_ADMIN_ROLE:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get DEFAULT_ADMIN_ROLE');
  }
}

/**
 * Get the ISSUER_ROLE constant
 * @returns The bytes32 hash of the ISSUER_ROLE
 */
export async function getIssuerRole(): Promise<RoleOutput> {
  try {
    const publicClient = getPublicClient();
    const issuerRole = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'ISSUER_ROLE',
    });

    return { role: issuerRole as string };
  } catch (error) {
    console.error('Error getting ISSUER_ROLE:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get ISSUER_ROLE');
  }
}

/**
 * Get the VERIFIER_ROLE constant
 * @returns The bytes32 hash of the VERIFIER_ROLE
 */
export async function getVerifierRole(): Promise<RoleOutput> {
  try {
    const publicClient = getPublicClient();
    const verifierRole = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidAuthABI,
      functionName: 'VERIFIER_ROLE',
    });

    return { role: verifierRole as string };
  } catch (error) {
    console.error('Error getting VERIFIER_ROLE:', error);
    const parsedError = parseDidAuthError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get VERIFIER_ROLE');
  }
}
