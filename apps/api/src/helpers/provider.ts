import { ethers, JsonRpcProvider } from 'ethers';

import {
  LOCAL_PRIVATE_KEY,
  SEPOLIA_PRIVATE_KEY,
  MAINNET_PRIVATE_KEY
} from '../constants';

/**
 * Retrieves the RPC URL for connecting to the Ethereum blockchain.
 *
 * Priority is given to the following sources in order:
 * 1. Custom RPC URL from the environment variable `RPC_URL`.
 * 2. Alchemy service using the `ALCHEMY_API_KEY` for the Sepolia test network.
 * 3. Infura service using the `INFURA_API_KEY` for the Sepolia test network.
 *
 * @returns {string} The URL for the RPC endpoint.
 */
const getRpcUrl = (): string => {
  let env = process.env.NETWORK || 'local';
  let url: string;

  if (env === 'local') {
    url = process.env.LOCAL_RPC_URL || '';
  } else if (env === 'sepolia') {
    url = process.env.TESTNET_RPC_URL || '';
  } else if (env === 'mainnet') {
    url = process.env.MAINNET_RPC_URL || '';
  } else {
    throw new Error('Invalid NODE_ENV');
  }

  return url;
};

/**
 * The provider is configured with an explicit network to avoid ENS-related issues
 * on networks that don't support ENS.
 *
 * @const {Provider} provider - The initialized Ethereum provider.
 *
 * @example
 * // Usage example:
 * const blockNumber = await provider.getBlockNumber();
 * console.log('Current block number:', blockNumber);
 */

// Create provider with explicit network
export const provider = new JsonRpcProvider(getRpcUrl());

/**
 * Creates a wallet instance using the private key.
 *
 * The wallet is initialized with the `PRIVATE_KEY` environment variable, allowing the wallet to
 * sign transactions and messages, interact with smart contracts, and manage an Ethereum address.
 *
 * @const {Wallet} wallet - The wallet instance created from the private key.
 *
 * @example
 * // Usage example:
 * const balance = await wallet.getBalance();
 * console.log('Wallet balance:', ethers.utils.formatEther(balance));
 */
export const wallet = new ethers.Wallet(LOCAL_PRIVATE_KEY);
