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
  chainId: Number(import.meta.env.CHAIN_ID || 1),
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
};

/**
 * Type for transaction response with additional metadata
 */
type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
  // For client-side transaction preparation
  contractAddress?: `0x${string}`;
  abi?: typeof DidRegistryABI;
  functionName?: string;
  args?: unknown[];
};

/**
 * Create a public client for reading from the blockchain
 */
const getPublicClient = () => {
  return createPublicClient({
    chain: hardhat,
    transport: http(defaultConfig.rpcUrl),
  });
};

/**
 * Prepare transaction data for client-side execution
 * @param functionName - The contract function to call
 * @param args - The arguments for the function
 * @returns Transaction data for client-side execution
 */
const prepareTransactionData = (functionName: string, args: unknown[]) => {
  return {
    contractAddress: defaultConfig.contractAddress,
    abi: DidRegistryABI,
    functionName,
    args,
  };
};

/**
 * Update a DID document - server-side preparation
 * @param did - The DID to update
 * @param newDocument - The new DID document
 * @returns The transaction data for client-side execution
 */
export async function updateDidDocument(did: string, newDocument: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is active before attempting to update
    try {
      // Use resolveDid to check if the DID exists and is active
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is active
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (!isActive) {
        return {
          success: false,
          error: `DID ${did} is not active`,
        };
      }

      // Get the DID controller to log for debugging
      await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError) {
      const parsedError = parseDidRegistryError(checkError);
      return {
        success: false,
        error: parsedError ? parsedError.message : String(checkError),
      };
    }

    return {
      success: true,
      ...prepareTransactionData('updateDidDocument', [did, newDocument]),
    };
  } catch (error) {
    console.error('Error preparing DID document update:', error);
    const parsedError = parseDidRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Update a DID public key - server-side preparation
 * @param did - The DID to update
 * @param newPublicKey - The new public key
 * @returns The transaction data for client-side execution
 */
export async function updateDidPublicKey(did: string, newPublicKey: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is active before attempting to update
    try {
      // Use resolveDid to check if the DID exists
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is active
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (!isActive) {
        return {
          success: false,
          error: `DID ${did} is not active`,
        };
      }

      // Get the DID controller to log for debugging
      await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError) {
      const parsedError = parseDidRegistryError(checkError);
      return {
        success: false,
        error: parsedError ? parsedError.message : String(checkError),
      };
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('updateDidPublicKey', [did, newPublicKey]),
    };
  } catch (error) {
    console.error('Error preparing DID public key update:', error);
    const parsedError = parseDidRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Register a new DID - server-side preparation
 * @param did - The DID to register
 * @param document - The DID document
 * @param publicKey - The DID public key
 * @returns The transaction data for client-side execution
 */
export async function registerDid(did: string, document: string, publicKey: string): Promise<TransactionResponse> {
  try {
    // Get public client to check if DID already exists
    const publicClient = getPublicClient();

    try {
      const addressMatch = did.match(/did:docuvault:(0x[a-fA-F0-9]{40})/);

      if (!addressMatch || !addressMatch[1]) {
        return {
          success: false,
          error: 'Invalid DID format. Expected did:docuvault:0x...',
        };
      }

      const address = addressMatch[1] as `0x${string}`;

      // Check if this address already has a registered DID
      const existingDid = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'addressToDID',
        args: [address],
      });

      // If the address already has a DID, check if it's the same one
      if (existingDid && existingDid !== '') {
        if (existingDid === did) {
          return {
            success: false,
            error: `DID ${did} is already registered to this address`,
          };
        } else {
          return {
            success: false,
            error: `Address ${address} already has a different DID registered: ${existingDid}`,
          };
        }
      }
    } catch (checkError) {
      // If we get here with an error, it's likely not related to DID existence
      console.error('Error checking DID existence:', checkError);
      const parsedError = parseDidRegistryError(checkError);
      if (parsedError && parsedError.message !== 'Invalid DID provided') {
        return {
          success: false,
          error: parsedError ? parsedError.message : String(checkError),
        };
      }
      // If the error is "Invalid DID provided", it likely means the DID doesn't exist,
      // which is what we want for registration, so we can continue
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('registerDid', [did, document, publicKey]),
    };
  } catch (error) {
    console.error('Error preparing DID registration:', error);
    const parsedError = parseDidRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Deactivate a DID - server-side preparation
 * @param did - The DID to deactivate
 * @returns The transaction data for client-side execution
 */
export async function deactivateDid(did: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is active before attempting to deactivate
    try {
      // Use resolveDid to check if the DID exists
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is already inactive
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (!isActive) {
        return {
          success: false,
          error: `DID ${did} is already inactive`,
        };
      }

      // Get the DID controller to log for debugging
      await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError) {
      const parsedError = parseDidRegistryError(checkError);
      return {
        success: false,
        error: parsedError ? parsedError.message : String(checkError),
      };
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('deactivateDid', [did]),
    };
  } catch (error) {
    console.error('Error preparing DID deactivation:', error);
    const parsedError = parseDidRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Reactivate a DID - server-side preparation
 * @param did - The DID to reactivate
 * @returns The transaction data for client-side execution
 */
export async function reactivateDid(did: string): Promise<TransactionResponse> {
  try {
    // Get public client to check DID status
    const publicClient = getPublicClient();

    // Check if the DID exists and is inactive before attempting to reactivate
    try {
      // Use resolveDid to check if the DID exists
      const didDocument = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'resolveDid',
        args: [did],
      });

      // Check if the DID exists (if resolveDid returns a valid document)
      if (!didDocument) {
        return {
          success: false,
          error: `DID ${did} does not exist`,
        };
      }

      // Check if the DID is already active
      const isActive = await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'isActive',
        args: [did],
      });

      if (isActive) {
        return {
          success: false,
          error: `DID ${did} is already active`,
        };
      }

      // Get the DID controller to log for debugging
      await publicClient.readContract({
        address: defaultConfig.contractAddress,
        abi: DidRegistryABI,
        functionName: 'getController',
        args: [did],
      });
    } catch (checkError) {
      const parsedError = parseDidRegistryError(checkError);
      return {
        success: false,
        error: parsedError ? parsedError.message : String(checkError),
      };
    }

    // Prepare transaction data for client-side execution
    return {
      success: true,
      ...prepareTransactionData('reactivateDid', [did]),
    };
  } catch (error) {
    console.error('Error preparing DID reactivation:', error);
    const parsedError = parseDidRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Process a transaction receipt and validate success
 * @param hash - The transaction hash
 * @param path - Optional redirect path after processing
 * @returns Success status and optional error message
 */
export async function processTransactionReceipt(
  hash: `0x${string}`,
  path?: string
): Promise<{ success: boolean; error?: string }> {
  console.log('Processing transaction receipt:', path);
  try {
    // Get public client to check transaction status
    const publicClient = getPublicClient();

    // Wait for the transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Check if receipt is valid
    if (!receipt) {
      throw new Error('Transaction receipt is null');
    }

    return {
      success: receipt.status === 'success',
      error: receipt.status !== 'success' ? 'Transaction failed' : undefined,
    };
  } catch (error) {
    console.error('Error processing transaction:', error);
    const parsedError = parseDidRegistryError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}
