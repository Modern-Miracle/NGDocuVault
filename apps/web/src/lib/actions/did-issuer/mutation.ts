'use server';

/**
 * @file DID Issuer Mutation Actions
 * @description This file contains all state-changing functions from the DID Issuer ABI.
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { DidIssuerABI } from '@docu/abi';
import { CONTRACTS } from '@/config/contract';
import { parseDidIssuerError } from './error-parser';

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
  chainId: Number(import.meta.env.CHAIN_ID || 1),
  rpcUrl: import.meta.env.RPC_URL || 'http://127.0.0.1:8545',
};

/**
 * Type for transaction response with additional metadata
 */
type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
  data?: string;
  to?: string;
  from?: string;
  method?: string;
  args?: unknown[];
};

/**
 * Create a wallet client for sending transactions
 */
const getWalletClient = async (privateKey: string, config: ContractConfig = defaultConfig) => {
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain: {
      ...mainnet,
      id: config.chainId,
    },
    transport: http(config.rpcUrl),
  });
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
 * Process a transaction receipt and return a standardized response
 */
const processTransactionReceipt = async (
  hash: `0x${string}`,
  method: string,
  args: unknown[] = []
): Promise<TransactionResponse> => {
  try {
    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      return {
        success: true,
        hash,
        method,
        args,
      };
    } else {
      return {
        success: false,
        hash,
        error: 'Transaction failed',
        method,
        args,
      };
    }
  } catch (error) {
    console.error('Error processing transaction receipt:', error);
    const parsedError = parseDidIssuerError(error);
    return {
      success: false,
      hash,
      error: parsedError ? parsedError.message : String(error),
      method,
      args,
    };
  }
};

/**
 * Process a transaction response
 * @param txHash - The transaction hash
 * @param path - The path to revalidate
 */
export async function processTransactionResponse(
  txHash: `0x${string}`,
  path?: string
): Promise<{ success: boolean; error?: string }> {
  console.log('Processing transaction response:', txHash, path);
  try {
    const publicClient = getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === 'success') {
      return { success: true };
    } else {
      return { success: false, error: 'Transaction failed' };
    }
  } catch (error) {
    console.error('Error processing transaction response:', error);
    const parsedError = parseDidIssuerError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Issue a credential
 * @param credentialType - The type of credential to issue
 * @param subject - The subject of the credential
 * @param credentialId - The ID of the credential
 * @param privateKey - The private key for signing transactions
 */
export async function issueCredentialIssuer(
  credentialType: string,
  subject: string,
  credentialId: string,
  privateKey: string
): Promise<TransactionResponse> {
  try {
    const walletClient = await getWalletClient(privateKey);
    const account = walletClient.account;

    if (!account) {
      throw new Error('No account available');
    }

    const hash = await walletClient.writeContract({
      address: defaultConfig.contractAddress,
      abi: DidIssuerABI,
      functionName: 'issueCredential',
      args: [credentialType, subject, credentialId as `0x${string}`],
    });

    return processTransactionReceipt(hash, 'issueCredential', [credentialType, subject, credentialId]);
  } catch (error) {
    console.error('Error issuing credential:', error);
    const parsedError = parseDidIssuerError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
      method: 'issueCredential',
      args: [credentialType, subject, credentialId],
    };
  }
}
