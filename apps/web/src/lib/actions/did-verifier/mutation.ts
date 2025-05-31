/**
 * @file DID Verifier Mutation Actions
 * @description This file contains all state-changing functions from the DID Verifier ABI.
 */

import { createWalletClient, createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { DidVerifierABI } from '@docu/abi';
import { CONTRACTS } from '@/config/contract';
import { parseDidVerifierError } from './error-parser';
import { env } from '@/config/env';

/**
 * Configuration for the DID Verifier contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DidVerifier as `0x${string}`,
  chainId: Number(env.VITE_CHAIN_ID),
  rpcUrl: env.VITE_RPC_URL,
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
    chain: hardhat,
    transport: http(config.rpcUrl),
  });
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
    const parsedError = parseDidVerifierError(error);
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
 * Set the trust status of an issuer for a specific credential type
 * @param credentialType - The type of credential
 * @param issuer - The issuer address
 * @param trusted - Whether the issuer should be trusted
 * @param privateKey - The private key for signing transactions
 */
export async function setIssuerTrustStatus(
  credentialType: string,
  issuer: `0x${string}`,
  trusted: boolean,
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
      abi: DidVerifierABI,
      functionName: 'setIssuerTrustStatus',
      args: [credentialType, issuer, trusted],
    });

    return processTransactionReceipt(hash, 'setIssuerTrustStatus', [credentialType, issuer, trusted]);
  } catch (error) {
    console.error('Error setting issuer trust status:', error);
    const parsedError = parseDidVerifierError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
      method: 'setIssuerTrustStatus',
      args: [credentialType, issuer, trusted],
    };
  }
}
