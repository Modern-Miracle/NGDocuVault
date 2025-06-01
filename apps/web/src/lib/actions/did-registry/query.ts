'use server';

import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { DidRegistryABI } from '@docu/abi';
import { CONTRACTS } from '@/config/contract';
import { parseDidRegistryError } from './error-parser';

/**
 * Configuration for the DID Registry contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DidRegistry as `0x${string}`,
  chainId: 31337,
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
};

/**
 * Get a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = defaultConfig) => {
  return createPublicClient({
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
};

/**
 * DID Document structure returned by the contract
 */
export type DIDDocument = {
  subject: string;
  lastUpdated: number;
  active: boolean;
  publicKey: string;
  document: string;
};

/**
 * Get the DID for an address
 * @param address - The address to get the DID for
 * @returns The DID associated with the address
 */
export async function addressToDID(address: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'addressToDID',
      args: [address],
    })) as string;
  } catch (error) {
    console.error('Error getting DID for address:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the controller address for a DID
 * @param did - The DID to get the controller for
 * @returns The controller address for the DID
 */
export async function getController(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getController',
      args: [did],
    })) as string;
  } catch (error) {
    console.error('Error getting controller for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the DID document for a DID
 * @param did - The DID to get the document for
 * @returns The DID document string
 */
export async function getDidDocument(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getDocument',
      args: [did],
    })) as string;
  } catch (error) {
    console.error('Error getting document for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the DID document for a DID (alternative method)
 * @param did - The DID to get the document for
 * @returns The DID document string
 */
export async function getDocumentForDid(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getDocumentForDid',
      args: [did],
    })) as string;
  } catch (error) {
    const parsedError = parseDidRegistryError(error);

    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the last updated timestamp for a DID
 * @param did - The DID to get the last updated timestamp for
 * @returns The last updated timestamp
 */
export async function getLastUpdated(did: string): Promise<number> {
  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getLastUpdated',
      args: [did],
    });
    return Number(result);
  } catch (error) {
    console.error('Error getting last updated timestamp for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the last updated timestamp for a DID (alternative method)
 * @param did - The DID to get the last updated timestamp for
 * @returns The last updated timestamp
 */
export async function getLastUpdatedForDid(did: string): Promise<number> {
  try {
    const publicClient = getPublicClient();
    const result = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getLastUpdatedForDid',
      args: [did],
    });
    return Number(result);
  } catch (error) {
    console.error('Error getting last updated timestamp for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the public key for a DID
 * @param did - The DID to get the public key for
 * @returns The public key
 */
export async function getPublicKey(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();

    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getPublicKey',
      args: [did],
    })) as string;
  } catch (error) {
    console.error('Error getting public key for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the public key for a DID (alternative method)
 * @param did - The DID to get the public key for
 * @returns The public key
 */
export async function getPublicKeyForDid(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getPublicKeyForDid',
      args: [did],
    })) as string;
  } catch (error) {
    console.error('Error getting public key for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the subject address for a DID
 * @param did - The DID to get the subject for
 * @returns The subject address
 */
export async function getSubject(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getSubject',
      args: [did],
    })) as string;
  } catch (error) {
    console.error('Error getting subject for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Get the subject address for a DID (alternative method)
 * @param did - The DID to get the subject for
 * @returns The subject address
 */
export async function getSubjectForDid(did: string): Promise<string> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'getSubjectForDid',
      args: [did],
    })) as string;
  } catch (error) {
    console.error('Error getting subject for DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Check if a DID is active
 * @param did - The DID to check
 * @returns Whether the DID is active
 */
export async function isActive(did: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'isActive',
      args: [did],
    })) as boolean;
  } catch (error) {
    console.error('Error checking if DID is active:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Check if a DID is active (alternative method)
 * @param did - The DID to check
 * @returns Whether the DID is active
 */
export async function isActiveForDid(did: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();
    return (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'isActiveForDid',
      args: [did],
    })) as boolean;
  } catch (error) {
    console.error('Error checking if DID is active:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}

/**
 * Resolve a DID to get all its information
 * @param did - The DID to resolve
 * @returns The resolved DID information
 */
export async function resolveDid(did: string): Promise<DIDDocument> {
  try {
    const publicClient = getPublicClient();

    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidRegistryABI,
      functionName: 'resolveDid',
      args: [did],
    })) as {
      subject: string;
      lastUpdated: bigint;
      active: boolean;
      publicKey: string;
      document: string;
    };

    // Convert the result to a more usable format
    return {
      subject: result.subject,
      lastUpdated: Number(result.lastUpdated),
      active: result.active,
      publicKey: result.publicKey,
      document: result.document,
    };
  } catch (error) {
    console.error('Error resolving DID:', error);
    const parsedError = parseDidRegistryError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}
