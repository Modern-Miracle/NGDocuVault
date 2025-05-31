'use server';

/**
 * @file DID Issuer Query Actions
 * @description This file contains all read-only functions from the DID Issuer ABI.
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { DidIssuerABI } from '@docu/abi';
import { parseDidIssuerError } from './error-parser';
import { env } from '@/config/env';
import { CONTRACTS } from '@/config/contract';

/**
 * Configuration for the DID Issuer contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DidIssuer as `0x${string}`,
  chainId: Number(env.VITE_CHAIN_ID),
  rpcUrl: env.VITE_RPC_URL,
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = (config: ContractConfig = defaultConfig) => {
  return createPublicClient({
    chain: {
      ...mainnet,
      id: config.chainId,
    },
    transport: http(config.rpcUrl),
  });
};

/**
 * Check if a credential is valid
 * @param credentialId - The credential ID to check
 * @returns True if the credential is valid, false otherwise
 */
export async function isCredentialValid(credentialId: string): Promise<boolean> {
  try {
    const publicClient = getPublicClient();

    const isValid = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DidIssuerABI,
      functionName: 'isCredentialValid',
      args: [credentialId as `0x${string}`],
    });

    return isValid as boolean;
  } catch (error) {
    console.error('Error checking if credential is valid:', error);
    const parsedError = parseDidIssuerError(error);
    throw new Error(parsedError ? parsedError.message : String(error));
  }
}
