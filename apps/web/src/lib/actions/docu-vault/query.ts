import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import { DocuVaultABI } from '@docu/abi';
import {
  Consent,
  DocumentType,
  DocumentInfo,
  DocumentBasic,
  GetDocumentInfoOutput,
  GetConsentStatusOutput,
  GetDocumentsOutput,
  IsDocumentExpiredOutput,
  IsIssuerActiveOutput,
  VerifyCidOutput,
  PausedOutput,
  OwnerOutput,
  GenerateDocumentIdOutput,
  ShareRequest,
} from './types';
import { CONTRACTS } from '@/config/contract';
import { parseDocuVaultError } from './error-parser';
import { env } from '@/config/env';

/**
 * Configuration for the DocuVault contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DocuVault as `0x${string}`,
  chainId: Number(env.VITE_CHAIN_ID),
  rpcUrl: env.VITE_RPC_URL,
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
 * Gets information about a document
 * @param documentId - The bytes32 document ID
 * @returns Basic document information
 */
export async function getDocument(documentId: string): Promise<DocumentBasic> {
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  try {
    const publicClient = getPublicClient();
    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'documents',
      args: [documentId],
    })) as [string, string, number, number, boolean, number, string];

    const [issuer, holder, issuanceDate, expirationDate, isVerified, documentType, cid] = result;

    return {
      issuer: issuer as `0x${string}`,
      holder: holder as `0x${string}`,
      issuanceDate: Number(issuanceDate),
      expirationDate: Number(expirationDate),
      isVerified,
      documentType: documentType as DocumentType,
      cid,
    };
  } catch (error) {
    console.error('Error getting document:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get document information');
  }
}

/**
 * Generate a document ID based on content hash, holder, and CID
 * @param contentHash - The bytes32 hash of the document content
 * @param holder - The address of the document holder
 * @param cid - The IPFS CID of the document
 * @returns Generated document ID
 */
export async function generateDocumentId(
  contentHash: string,
  holder: string,
  cid: string
): Promise<GenerateDocumentIdOutput> {
  if (!contentHash || !holder || !cid) {
    throw new Error('Content hash, holder, and CID are required');
  }

  try {
    const publicClient = getPublicClient();
    const documentId = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'generateDocumentId',
      args: [contentHash, holder, cid],
    });

    return { documentId: documentId as string };
  } catch (error) {
    console.error('Error generating document ID:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to generate document ID');
  }
}

/**
 * Get the consent status for a document shared with a requester
 * @param documentId - The bytes32 document ID
 * @param requester - The address of the requester
 * @returns Consent status and validity period
 */
export async function getConsentStatus(documentId: string, requester: string): Promise<GetConsentStatusOutput> {
  if (!documentId || !requester) {
    throw new Error('Document ID and requester address are required');
  }

  try {
    const publicClient = getPublicClient();

    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'getConsentStatus',
      args: [documentId, requester],
    })) as [number, number];

    const [consentStatus, validUntil] = result;

    return {
      consentStatus: consentStatus as Consent,
      validUntil: Number(validUntil),
    };
  } catch (error) {
    console.error('Error getting consent status:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get consent status');
  }
}

/**
 * Get detailed information about a document
 * @param documentId - The bytes32 document ID
 * @returns Detailed document information
 */
export async function getDocumentInfo(documentId: string): Promise<GetDocumentInfoOutput> {
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  try {
    const publicClient = getPublicClient();
    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'getDocumentInfo',
      args: [documentId],
    })) as [boolean, boolean, string, string, number, number, number, string];

    const [isVerified, isExpired, issuer, holder, issuanceDate, expirationDate, documentType, cid] = result;

    return {
      isVerified,
      isExpired,
      issuer: issuer as `0x${string}`,
      holder: holder as `0x${string}`,
      issuanceDate: Number(issuanceDate),
      expirationDate: Number(expirationDate),
      documentType: documentType as DocumentType,
      cid,
    };
  } catch (error) {
    console.error('Error getting document info:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get document information');
  }
}

/**
 * Get all documents associated with a holder
 * @param holder - The address of the document holder
 * @returns Array of document IDs
 */
export async function getDocuments(holder: `0x${string}`): Promise<GetDocumentsOutput> {
  if (!holder) {
    throw new Error('Holder address is required');
  }

  try {
    const publicClient = getPublicClient();
    const documentIds = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'getDocuments',
      args: [holder],
    })) as string[]; //FIXME: This is not a string[] but a bytes32[] -> therefore it should be number[]

    return {
      documentIds,
    };
  } catch (error) {
    console.error('Error getting holder documents:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get holder documents');
  }
}

// /**
//  * Get the admin role for a specific role
//  * @param role - The bytes32 role identifier
//  * @returns The admin role for the specified role
//  */
// export async function getRoleAdmin(role: string): Promise<GetRoleAdminOutput> {
//   if (!role) {
//     throw new Error('Role identifier is required');
//   }

//   try {
//     const publicClient = getPublicClient();
//     const adminRole = await publicClient.readContract({
//       address: defaultConfig.contractAddress,
//       abi: DocuVaultABI,
//       functionName: 'getRoleAdmin',
//       args: [role],
//     });

//     return {
//       adminRole: adminRole as string,
//     };
//   } catch (error) {
//     console.error('Error getting role admin:', error);
//     const parsedError = parseDocuVaultError(error);
//     if (parsedError) {
//       throw new Error(parsedError.message);
//     }
//     throw new Error('Failed to get role admin');
//   }
// }

// /**
//  * Check if an account has a specific role
//  * @param role - The bytes32 role identifier
//  * @param account - The address to check
//  * @returns Boolean indicating if the account has the role
//  */
// export async function hasCorrectRole(role: string, account: string): Promise<HasRoleOutput> {
//   if (!role || !account) {
//     throw new Error('Role identifier and account address are required');
//   }

//   try {
//     const publicClient = getPublicClient();
//     const hasRoleResult = await publicClient.readContract({
//       address: defaultConfig.contractAddress,
//       abi: DocuVaultABI,
//       functionName: 'hasRole',
//       args: [role, account],
//     });

//     return {
//       hasRole: Boolean(hasRoleResult),
//     };
//   } catch (error) {
//     console.error('Error checking if account has role:', error);
//     const parsedError = parseDocuVaultError(error);
//     if (parsedError) {
//       throw new Error(parsedError.message);
//     }
//     throw new Error('Failed to check if account has role');
//   }
// }

/**
 * Check if a document is expired
 * @param documentId - The bytes32 document ID
 * @returns Boolean indicating if the document is expired
 */
export async function isDocumentExpired(documentId: string): Promise<IsDocumentExpiredOutput> {
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  try {
    const publicClient = getPublicClient();
    const isExpired = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'isDocumentExpired',
      args: [documentId],
    });

    return {
      expired: Boolean(isExpired),
    };
  } catch (error) {
    console.error('Error checking if document is expired:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if document is expired');
  }
}

/**
 * Check if an issuer is active
 * @param issuerAddr - The address of the issuer
 * @returns Boolean indicating if the issuer is active
 */
export async function isIssuerActive(issuerAddr: string): Promise<IsIssuerActiveOutput> {
  if (!issuerAddr) {
    throw new Error('Issuer address is required');
  }

  try {
    const publicClient = getPublicClient();
    const isActive = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'isIssuerActive',
      args: [issuerAddr],
    });

    return {
      active: Boolean(isActive),
    };
  } catch (error) {
    console.error('Error checking if issuer is active:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if issuer is active');
  }
}

/**
 * Get the contract owner
 * @returns The address of the contract owner
 */
export async function getOwner(): Promise<OwnerOutput> {
  try {
    const publicClient = getPublicClient();
    const owner = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'owner',
    });

    return {
      owner: owner as string,
    };
  } catch (error) {
    console.error('Error getting contract owner:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get contract owner');
  }
}

/**
 * Check if the contract is paused
 * @returns Boolean indicating if the contract is paused
 */
export async function isPaused(): Promise<PausedOutput> {
  try {
    const publicClient = getPublicClient();
    const paused = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'paused',
    });

    return {
      paused: Boolean(paused),
    };
  } catch (error) {
    console.error('Error checking if contract is paused:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check if contract is paused');
  }
}

/**
 * Get the share request information for a document and requester
 * @param documentId - The bytes32 document ID
 * @param requester - The address of the requester
 * @returns The share request status and validity
 */
export async function getShareRequest(documentId: string, requester: string): Promise<ShareRequest> {
  if (!documentId || !requester) {
    throw new Error('Document ID and requester address are required');
  }

  try {
    const publicClient = getPublicClient();
    const result = (await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'shareRequests',
      args: [documentId, requester],
    })) as [number, number];

    const [consent, validUntil] = result;

    return {
      consent: consent as Consent,
      validUntil: Number(validUntil),
    };
  } catch (error) {
    console.error('Error getting share request:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get share request information');
  }
}

/**
 * Check if the contract supports a specific interface
 * @param interfaceId - The interface ID to check
 * @returns Boolean indicating if the interface is supported
 */
export async function supportsInterface(interfaceId: string): Promise<boolean> {
  if (!interfaceId) {
    throw new Error('Interface ID is required');
  }

  try {
    const publicClient = getPublicClient();
    const isSupported = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'supportsInterface',
      args: [interfaceId],
    });

    return Boolean(isSupported);
  } catch (error) {
    console.error('Error checking interface support:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to check interface support');
  }
}

/**
 * Verify the CID of a document
 * @param contentHash - The bytes32 hash of the document content
 * @param holder - The address of the document holder
 * @param cid - The IPFS CID of the document
 * @param documentId - The bytes32 document ID
 * @returns Boolean indicating if the CID is valid
 */
export async function verifyCid(
  contentHash: string,
  holder: string,
  cid: string,
  documentId: string
): Promise<VerifyCidOutput> {
  if (!contentHash || !holder || !cid || !documentId) {
    throw new Error('Content hash, holder, CID, and document ID are required');
  }

  try {
    const publicClient = getPublicClient();
    const isValid = await publicClient.readContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: 'verifyCid',
      args: [contentHash, holder, cid, documentId],
    });

    return {
      valid: Boolean(isValid),
    };
  } catch (error) {
    console.error('Error verifying CID:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to verify CID');
  }
}

/**
 * Get detailed information for a list of documents
 * @param documentIds - Array of document IDs
 * @returns Array of document information
 */
export async function getMultipleDocumentInfo(documentIds: string[]): Promise<DocumentInfo[]> {
  if (!documentIds || !documentIds.length) {
    throw new Error('Document IDs array is required');
  }

  try {
    const publicClient = getPublicClient();

    // Get information for each document in parallel
    const documentsInfo = await Promise.all(
      documentIds.map(async (documentId) => {
        try {
          const result = (await publicClient.readContract({
            address: defaultConfig.contractAddress,
            abi: DocuVaultABI,
            functionName: 'getDocumentInfo',
            args: [documentId],
          })) as [boolean, boolean, string, string, number, number, number, string];

          const [isVerified, isExpired, issuer, holder, issuanceDate, expirationDate, documentType, cid] = result;

          return {
            isVerified,
            isExpired,
            issuer: issuer as `0x${string}`,
            holder: holder as `0x${string}`,
            issuanceDate: Number(issuanceDate),
            expirationDate: Number(expirationDate),
            documentType: documentType as DocumentType,
            cid,
          };
        } catch (error) {
          console.error(`Error getting info for document ${documentId}:`, error);
          return null;
        }
      })
    );

    // Use a more explicit type guard to fix the linter error
    return documentsInfo.filter((doc): doc is NonNullable<(typeof documentsInfo)[number]> => doc !== null);
  } catch (error) {
    console.error('Error getting multiple document info:', error);
    const parsedError = parseDocuVaultError(error);
    if (parsedError) {
      throw new Error(parsedError.message);
    }
    throw new Error('Failed to get multiple document information');
  }
}
