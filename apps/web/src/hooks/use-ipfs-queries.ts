'use client';

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { useAccount, usePublicClient } from 'wagmi';
import { DocuVaultABI } from '@docu/abi';
import { useMemo, useEffect, useCallback, useState } from 'react';
import { AsymmetricEncryptOutput, decryptWithPrivateKey } from '@/lib/asymmetric';
import { logger } from '@/lib/logger';
import {
  useDocumentInfo,
  useHolderDocuments,
  DOCU_VAULT_KEYS,
  useIsDocumentExpired,
  DocumentInfo,
} from '@/hooks/use-docu-vault';
import { parseDocuVaultError } from '@/lib/actions/docu-vault/error-parser';
import { IPFS_ENDPOINTS } from '@/lib/config';
import { fetchWithErrorHandling } from '@/lib/apiHelper';

// Default configuration - should be overridden in production
const defaultConfig = {
  contractAddress: (import.meta.env.VITE_DOCU_VAULT_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 31337),
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545',
};

/**
 * Interface for IPFS data response
 */
export interface IPFSDataResponse {
  success: boolean;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  cid?: string;
  error?: string;
  ephemeralPublicKey?: string;
  iv?: string;
  authTag?: string;
  encrypted?: string;
}

/**
 * Interface for encrypted data
 */
export interface EncryptedData {
  ephemeralPublicKey: string;
  iv: string;
  authTag: string;
  encrypted: string;
}

/**
 * Interface for bulk IPFS data response
 */
export interface BulkIPFSDataResponse {
  success: boolean;
  results: IPFSDataResponse[];
  error?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
}

/**
 * Interface for raw IPFS data response
 */
export interface RawIPFSDataResponse {
  success: boolean;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  error?: string;
}

/**
 * Get IPFS data by CID
 * @param cid The IPFS CID
 * @returns Promise with the IPFS data response
 */
export async function getIPFSData(cid: string): Promise<IPFSDataResponse> {
  try {
    const url = IPFS_ENDPOINTS.getDataByCid.replace(':cid', cid);
    const response = await fetchWithErrorHandling<IPFSDataResponse>(url, {
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get IPFS data');
    }

    return {
      success: true,
      data: response.data.data || {},
      metadata: response.data.metadata,
      cid: response.data.cid || cid,
    };
  } catch (error) {
    logger.error('Error getting IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get raw IPFS data by CID
 * @param cid The IPFS CID
 * @returns Promise with the raw IPFS data
 */
export async function getRawIPFSData(cid: string): Promise<RawIPFSDataResponse> {
  try {
    const url = `${IPFS_ENDPOINTS.getDataByQuery}?cid=${cid}`;
    const response = await fetchWithErrorHandling<RawIPFSDataResponse>(url, {
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get raw IPFS data');
    }

    return {
      success: true,
      data: response.data.data || {},
      metadata: response.data.metadata,
    };
  } catch (error) {
    logger.error('Error getting raw IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get data from multiple IPFS CIDs in a single request
 * @param cids Array of IPFS CIDs to retrieve
 * @returns Promise with the bulk IPFS data response
 */
export async function getBulkIPFSData(cids: string[]): Promise<BulkIPFSDataResponse> {
  try {
    if (!cids.length) {
      return {
        success: false,
        results: [],
        summary: { total: 0, successful: 0, failed: 0, successRate: 0 },
      };
    }

    logger.info(`Fetching bulk IPFS data for ${cids.length} CIDs`);

    const response = await fetchWithErrorHandling<BulkIPFSDataResponse>(IPFS_ENDPOINTS.getBulkData, {
      method: 'POST',
      body: JSON.stringify({ cids }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get bulk IPFS data');
    }

    return {
      success: true,
      results: response.data.results || [],
      summary: response.data.summary || {
        total: cids.length,
        successful: response.data.results ? response.data.results.filter((r) => r.success).length : 0,
        failed: response.data.results ? response.data.results.filter((r) => !r.success).length : cids.length,
        successRate: response.data.results
          ? (response.data.results.filter((r) => r.success).length / cids.length) * 100
          : 0,
      },
    };
  } catch (error) {
    logger.error('Error getting bulk IPFS data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Get access to encrypted data using a public key for re-encryption
 * @param cid The IPFS CID
 * @param publicKey The public key for re-encryption
 * @param documentId Optional document ID for access control
 * @returns Promise with the re-encrypted data
 */
export async function getAccessForData(
  cid: string,
  did: string,
  consumerAddress: string,
  recordId?: string
): Promise<IPFSDataResponse> {
  try {
    const url = IPFS_ENDPOINTS.reencryptData.replace(':cid', cid);
    const response = await fetchWithErrorHandling<IPFSDataResponse>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ did, consumerAddress, recordId }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get access to data');
    }

    return {
      success: true,
      data: response.data.data || {},
      metadata: response.data.metadata,
      ephemeralPublicKey: response.data.ephemeralPublicKey,
      iv: response.data.iv,
      authTag: response.data.authTag,
      encrypted: response.data.encrypted,
      cid: response.data.cid || cid,
    };
  } catch (error) {
    logger.error('Error getting access for data:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Create a utility hook for queries that should be fetched infrequently
export function useInfrequentQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    // Apply aggressive caching defaults
    staleTime: 120 * 60 * 1000, // 2 hours
    gcTime: 240 * 60 * 1000, // 4 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once to reduce API load
    ...options,
  });
}

/**
 * Hook to fetch and decode IPFS data for a given CID
 * @param cid - Content identifier to fetch
 * @param options - Additional query options
 * @returns Query object with the IPFS data
 */
export function useIPFSData(cid?: string, options: { enabled?: boolean } = {}) {
  return useInfrequentQuery(
    ['ipfs', 'data', cid],
    async () => {
      if (!cid) throw new Error('CID is required');
      return await getIPFSData(cid);
    },
    {
      enabled: !!cid && options.enabled !== false,
    }
  );
}

/**
 * Hook to fetch raw IPFS data for a given CID
 * @param cid - Content identifier to fetch
 * @param options - Additional query options
 * @returns Query object with the raw IPFS data
 */
export function useRawIPFSData(cid: string | undefined, options: { enabled?: boolean } = {}) {
  return useInfrequentQuery(
    ['ipfs', 'raw', cid],
    async () => {
      if (!cid) throw new Error('CID is required');
      return await getRawIPFSData(cid);
    },
    {
      enabled: !!cid && options.enabled !== false,
    }
  );
}

/**
 * Hook to fetch document data from both DocuVault and IPFS
 * @param documentId - The document ID to fetch
 * @param options - Additional query options
 * @returns Query object with the combined document data
 */
export function useDocumentWithIPFSData(documentId: string | undefined, options: { enabled?: boolean } = {}) {
  const documentInfoQuery = useDocumentInfo(documentId || '');

  // Extract CID from document info
  const cid = useMemo(() => {
    if (!documentInfoQuery.data) return '';
    // Cast to DocumentInfo to access the cid property
    return (documentInfoQuery.data as unknown as DocumentInfo).cid || '';
  }, [documentInfoQuery.data]);

  const ipfsDataQuery = useIPFSData(cid, {
    enabled: !!cid && !documentInfoQuery.isLoading && !documentInfoQuery.isError && options.enabled !== false,
  });

  return {
    isLoading: documentInfoQuery.isLoading || ipfsDataQuery.isLoading,
    isError: documentInfoQuery.isError || ipfsDataQuery.isError,
    error: documentInfoQuery.error || ipfsDataQuery.error,
    data:
      documentInfoQuery.data && ipfsDataQuery.data
        ? {
            documentInfo: documentInfoQuery.data,
            ipfsData: ipfsDataQuery.data,
          }
        : undefined,
    documentInfoQuery,
    ipfsDataQuery,
  };
}

/**
 * Interface for document record with IPFS data
 */
export interface DocumentWithIPFSData extends DocumentInfo {
  ipfsData?: Record<string, unknown>;
  ipfsMetadata?: Record<string, unknown>;
}

/**
 * Interface for record with IPFS data
 */
export interface RecordWithIPFSData {
  recordId: string;
  cid?: string;
  contentHash: `0x${string}`;
  ipfsData?: Record<string, unknown>;
  ipfsMetadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Hook to fetch all holder documents with their associated IPFS data
 * Using a bulk IPFS data fetch approach for better performance
 *
 * @param holder - The holder address
 * @param options - Additional query options
 * @returns Query object with the holder documents and their IPFS data
 */
export function useHolderDocumentsWithIPFSData(
  holder: string | undefined,
  options: { enabled?: boolean; fetchIPFS?: boolean } = {}
) {
  const { fetchIPFS = true } = options;
  const { address } = useAccount();
  const holderAddress = holder || address;
  const publicClient = usePublicClient();

  // Get documents from DocuVault
  const holderDocumentsQuery = useHolderDocuments(holderAddress as `0x${string}`);

  // Get document IDs for memoization - ensure it's an array
  const documentIds = useMemo(() => {
    // Cast to string array since we know that's what it is at runtime
    return (Array.isArray(holderDocumentsQuery.data) ? holderDocumentsQuery.data : []) as string[];
  }, [holderDocumentsQuery.data]);

  // Get document info for all documents
  const documentInfoQuery = useInfrequentQuery<DocumentInfo[]>(
    DOCU_VAULT_KEYS.multiDocuments.info(documentIds),
    async () => {
      if (!documentIds || documentIds.length === 0) return [];

      if (!publicClient) throw new Error('Public client not available');

      try {
        // Fetch document info for each document ID
        const documentInfos = await Promise.all(
          documentIds.map(async (docId: string) => {
            try {
              const result = (await publicClient.readContract({
                address: defaultConfig.contractAddress,
                abi: DocuVaultABI,
                functionName: 'getDocumentInfo',
                args: [docId],
              })) as [
                `0x${string}`, // documentId
                `0x${string}`, // contentHash
                string, // cid
                `0x${string}`, // holder
                `0x${string}`, // issuer
                bigint, // documentType
                bigint, // issuanceTimestamp
                bigint, // expirationTimestamp
                boolean, // isVerified
                `0x${string}`, // verifier
                bigint, // verificationTimestamp
              ];

              const [
                docIdResult,
                contentHash,
                cid,
                holder,
                issuer,
                documentType,
                issuanceTimestamp,
                expirationTimestamp,
                isVerified,
                verifier,
                verificationTimestamp,
              ] = result;

              return {
                documentId: docIdResult,
                contentHash,
                cid,
                holder,
                issuer,
                documentType,
                issuanceTimestamp,
                expirationTimestamp,
                isVerified,
                verifier,
                verificationTimestamp,
                metadata: '',
              } as DocumentInfo;
            } catch (error) {
              console.error(`Error fetching document info for ${docId}:`, error);
              const parsedError = parseDocuVaultError(error);
              if (parsedError) {
                console.log(`Document error: ${parsedError.message}`);
              }
              return null;
            }
          })
        );

        return documentInfos.filter((doc): doc is DocumentInfo => doc !== null);
      } catch (error) {
        console.error('Error getting document info:', error);
        throw error;
      }
    },
    {
      enabled: !!documentIds && documentIds.length > 0 && options.enabled !== false,
    }
  );

  // Extract CIDs from document info
  const cids = useMemo(() => {
    if (!documentInfoQuery.data) return [];
    return documentInfoQuery.data
      .map((doc) => doc.cid)
      .filter((cid): cid is string => typeof cid === 'string' && cid !== '');
  }, [documentInfoQuery.data]);

  // Create a stable key for the CIDs query
  const cidsString = useMemo(() => {
    if (!fetchIPFS) return '';
    return cids.join(',');
  }, [cids, fetchIPFS]);

  // Use a single query to fetch all IPFS data in bulk
  const bulkIPFSDataQuery = useInfrequentQuery(
    ['ipfs', 'bulk-data', cidsString],
    async () => {
      if (!cidsString) return {};
      try {
        const cidArray = cidsString.split(',').filter(Boolean);
        if (cidArray.length === 0) return {};

        const result = await getBulkIPFSData(cidArray);

        // Convert the array of results to a map for easier lookup
        const ipfsDataMap: Record<
          string,
          {
            data: Record<string, unknown>;
            metadata: Record<string, unknown>;
          }
        > = {};

        if (result.success && result.results && Array.isArray(result.results)) {
          result.results.forEach((item) => {
            if (item.success && item.cid) {
              ipfsDataMap[item.cid] = {
                data: item.data || {},
                metadata: item.metadata || {},
              };
            }
          });
        }

        return ipfsDataMap;
      } catch (error) {
        console.error('Error fetching bulk IPFS data:', error);
        throw error;
      }
    },
    {
      enabled: fetchIPFS && cidsString.length > 0 && !documentInfoQuery.isLoading && !documentInfoQuery.isError,
    }
  );

  // Check if any queries are loading or have errors
  const isLoading =
    holderDocumentsQuery.isLoading || documentInfoQuery.isLoading || (fetchIPFS && bulkIPFSDataQuery.isLoading);
  const isError = holderDocumentsQuery.isError || documentInfoQuery.isError || (fetchIPFS && bulkIPFSDataQuery.isError);
  const error = holderDocumentsQuery.error || documentInfoQuery.error || bulkIPFSDataQuery.error;

  // Combine document info with IPFS data
  const documentsWithIPFSData = useMemo(() => {
    if (!documentInfoQuery.data) return [];

    return documentInfoQuery.data.map((docInfo) => {
      if (fetchIPFS && bulkIPFSDataQuery.data && docInfo.cid && bulkIPFSDataQuery.data[docInfo.cid]) {
        return {
          ...docInfo,
          ipfsData: bulkIPFSDataQuery.data[docInfo.cid].data,
          ipfsMetadata: bulkIPFSDataQuery.data[docInfo.cid].metadata,
        };
      }
      return { ...docInfo };
    });
  }, [documentInfoQuery.data, bulkIPFSDataQuery.data, fetchIPFS]);

  return {
    isLoading,
    isError,
    error,
    data: documentsWithIPFSData,
    documentIds,
    holderDocumentsQuery,
    documentInfoQuery,
    bulkIPFSDataQuery,
  };
}

/**
 * Hook to check if a document is expired
 * @param documentId - The document ID to check
 * @returns Query result with expiration status
 */
export function useIsDocumentExpiredWithCache(documentId?: string) {
  return useIsDocumentExpired(documentId);
}

/**
 * Hook to fetch access information for a document
 * @param cid - The IPFS CID
 * @param documentId - The document ID
 * @param requesterAddress - The address requesting access
 * @returns Query result with access information
 */
export function useDocumentAccess(cid?: string, documentId?: string, requesterAddress?: string) {
  const { address } = useAccount();
  const requester = requesterAddress || address;

  return useInfrequentQuery(
    ['document', 'access', documentId, requester],
    async () => {
      if (!cid) throw new Error('CID is required');
      if (!documentId) throw new Error('Document ID is required');
      if (!requester) throw new Error('Requester address is required');

      // You would implement this based on your application's access control
      return { hasAccess: true };
    },
    {
      enabled: !!cid && !!documentId && !!requester,
    }
  );
}

/**
 * Hook to get access for a given CID with better error handling
 * @param cid - The CID to get access for
 * @param documentId - The document ID
 * @param requesterAddress - The address requesting access
 * @returns Query object with the access information
 */
export function useAccessData(cid?: string, documentId?: string, requesterAddress?: string) {
  const { address } = useAccount();
  const requester = requesterAddress || address;

  return useInfrequentQuery(
    ['ipfs', 'access', cid, documentId, requester],
    async () => {
      if (!cid) throw new Error('CID is required');
      if (!documentId) throw new Error('Document ID is required');
      if (!requester) throw new Error('Requester address is required');

      try {
        const result = await getAccessForData(cid, documentId, requester as string);
        console.log('Access data result:', result);
        return result;
      } catch (error) {
        logger.error('Error getting access for data:', error);
        throw error;
      }
    },
    {
      enabled: !!cid && !!documentId && !!requester,
      retry: 1,
    }
  );
}

/**
 * Hook to decrypt data using the private key
 * @param encryptedData - The encrypted data to decrypt
 * @param privateKey - The private key to use for decryption
 * @returns Object containing the decrypted data and loading/error states
 */
export function useDecryptData(
  encryptedData: AsymmetricEncryptOutput | undefined | null,
  privateKey: string | undefined
) {
  const [state, setState] = useState<{
    isDecrypting: boolean;
    error: Error | null;
    decryptedData: Record<string, unknown> | string | null;
  }>({
    isDecrypting: false,
    error: null,
    decryptedData: null,
  });

  useEffect(() => {
    // Reset state when inputs change
    if (!encryptedData || !privateKey) {
      setState({
        isDecrypting: false,
        error: null,
        decryptedData: null,
      });
      return;
    }

    const decryptData = async () => {
      setState((prev) => ({ ...prev, isDecrypting: true, error: null }));

      try {
        // Log the incoming data format
        console.log('Attempting to decrypt data:', JSON.stringify(encryptedData).substring(0, 100) + '...');

        // Format the encrypted data correctly for decryption
        const parsedData: AsymmetricEncryptOutput = {
          ephemeralPublicKey: '',
          iv: '',
          authTag: '',
          encrypted: '',
        };

        // Check if all the required fields are already present
        if (
          typeof encryptedData === 'object' &&
          encryptedData.ephemeralPublicKey &&
          encryptedData.iv &&
          encryptedData.authTag &&
          encryptedData.encrypted
        ) {
          // Data already in the right format
          parsedData.ephemeralPublicKey = encryptedData.ephemeralPublicKey;
          parsedData.iv = encryptedData.iv;
          parsedData.authTag = encryptedData.authTag;
          parsedData.encrypted = encryptedData.encrypted;
        } else {
          // Try to parse it from a string if needed
          try {
            const parsed = typeof encryptedData === 'string' ? JSON.parse(encryptedData) : encryptedData;

            if (parsed && parsed.ephemeralPublicKey && parsed.iv && parsed.authTag && parsed.encrypted) {
              parsedData.ephemeralPublicKey = parsed.ephemeralPublicKey;
              parsedData.iv = parsed.iv;
              parsedData.authTag = parsed.authTag;
              parsedData.encrypted = parsed.encrypted;
            } else {
              throw new Error('Missing required encryption fields in parsed data');
            }
          } catch (error) {
            throw new Error(
              `Failed to parse encrypted data: ${error instanceof Error ? error.message : 'Invalid format'}`
            );
          }
        }

        // Validate the data
        if (!parsedData.ephemeralPublicKey || !parsedData.iv || !parsedData.authTag || !parsedData.encrypted) {
          throw new Error('Missing required encryption fields');
        }

        // Log the formatted data
        console.log('Decrypting data with format:', {
          hasEphemeralKey: !!parsedData.ephemeralPublicKey,
          epkLength: parsedData.ephemeralPublicKey.length,
          hasIV: !!parsedData.iv,
          ivLength: parsedData.iv.length,
          hasAuthTag: !!parsedData.authTag,
          authTagLength: parsedData.authTag.length,
          hasEncrypted: !!parsedData.encrypted,
          encryptedLength: parsedData.encrypted.length,
        });

        // Ensure private key is in the expected format (hex without 0x prefix)
        const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

        // Decrypt the data
        const decrypted = decryptWithPrivateKey(parsedData, formattedPrivateKey);

        // Parse the decrypted JSON data
        let result;
        try {
          result = JSON.parse(await decrypted);
        } catch {
          logger.warn(
            'Decrypted data is not valid JSON, returning as string:',
            (await decrypted).substring(0, 50) + '...'
          );
          result = await decrypted;
        }

        setState({
          isDecrypting: false,
          error: null,
          decryptedData: result,
        });
      } catch (error) {
        logger.error('Error decrypting data:', error);
        setState({
          isDecrypting: false,
          error: error instanceof Error ? error : new Error('Unknown decryption error'),
          decryptedData: null,
        });
      }
    };

    decryptData();
  }, [encryptedData, privateKey]);

  return state;
}

/**
 * High-level hook that combines data access and decryption
 * @param cid - The CID of the document
 * @param documentId - The ID of the document
 * @param requesterAddress - The address of the requester
 * @param privateKey - The private key for decryption
 * @returns Object containing the decrypted data and loading/error states
 */
export function useDecryptedDocumentData(
  cid?: string,
  documentId?: string,
  requesterAddress?: string,
  privateKey?: string
) {
  // First get the encrypted access data
  const {
    data: accessData,
    isLoading: isAccessLoading,
    error: accessError,
  } = useAccessData(cid, documentId, requesterAddress);

  // Get the actual encrypted data from the response
  const encryptedData = useMemo(() => {
    if (!accessData) return undefined;

    if (accessData.data && typeof accessData.data === 'object') {
      // Check if it has the required fields for encryption
      if (
        'ephemeralPublicKey' in accessData.data &&
        'iv' in accessData.data &&
        'authTag' in accessData.data &&
        'encrypted' in accessData.data
      ) {
        return accessData.data as AsymmetricEncryptOutput;
      }
    }

    return undefined;
  }, [accessData]);

  // Then decrypt the data with the private key
  const { decryptedData, isDecrypting, error: decryptionError } = useDecryptData(encryptedData, privateKey);

  return {
    data: decryptedData,
    isLoading: isAccessLoading || isDecrypting,
    error: accessError || decryptionError,
    // Include raw data for debugging
    rawAccessData: accessData,
    encryptedData,
  };
}

/**
 * Hook to manage the authorized revealing of document data with permission tracking
 * @param cid - The CID of the document to reveal
 * @param documentId - The ID of the document
 * @param requesterAddress - The address of the data requester
 * @param privateKey - The private key for decryption
 * @param options - Additional options for revealing data
 * @returns Object containing the revealed data with loading/error states and access control
 */
export function useRevealDocumentData(
  cid?: string,
  documentId?: string,
  requesterAddress?: string,
  privateKey?: string,
  options: {
    trackAccess?: boolean;
    redactSensitiveFields?: boolean;
  } = {}
) {
  // Default options
  const { trackAccess = true, redactSensitiveFields = true } = options;

  // State for tracking access permissions and revealed data
  const [revealState, setRevealState] = useState<{
    isRevealed: boolean;
    hasPermission: boolean;
    accessGranted: Date | null;
    sensitiveFieldsHidden: boolean;
    accessLog: Array<{ timestamp: Date; action: string }>;
  }>({
    isRevealed: false,
    hasPermission: false,
    accessGranted: null,
    sensitiveFieldsHidden: redactSensitiveFields,
    accessLog: [],
  });

  // Use our existing hook to get and decrypt the data
  const {
    data: decryptedData,
    isLoading,
    error,
    rawAccessData,
  } = useDecryptedDocumentData(cid, documentId, requesterAddress, privateKey);

  // Determine if user has permission based on the access response and decryption success
  const hasPermission = useMemo(() => {
    // If we have successfully decrypted data, we definitely have permission
    if (decryptedData) {
      return true;
    }

    // If we're still loading, don't make any determination yet
    if (isLoading) {
      return revealState.hasPermission;
    }

    // If we have an error that specifically mentions permission or authentication,
    // then we likely don't have permission
    if (error) {
      const errorMsg = error instanceof Error ? error.message.toLowerCase() : '';
      if (
        errorMsg.includes('permission') ||
        errorMsg.includes('access denied') ||
        errorMsg.includes('authenticate') ||
        errorMsg.includes('unauthorized')
      ) {
        return false;
      }
    }

    // Fall back to checking if we have any data at all
    return !!rawAccessData && !error;
  }, [decryptedData, isLoading, error, rawAccessData, revealState.hasPermission]);

  // Process the decrypted data to redact sensitive fields if needed
  const processedData = useMemo(() => {
    if (!decryptedData) return null;

    // If we're not redacting sensitive fields, return the full data
    if (!redactSensitiveFields || !revealState.sensitiveFieldsHidden) {
      return decryptedData;
    }

    // Otherwise redact sensitive fields
    try {
      if (typeof decryptedData === 'object' && decryptedData !== null) {
        // Redact common sensitive fields - customize based on your data model
        const sensitiveFields = ['ssn', 'dob', 'birthDate', 'address', 'phoneNumber', 'personalId', 'medicalId'];
        const redacted = { ...(decryptedData as Record<string, unknown>) };

        sensitiveFields.forEach((field) => {
          if (field in redacted) {
            redacted[field] = '*** REDACTED ***';
          }
        });

        return redacted;
      }
      return decryptedData;
    } catch (e) {
      logger.error('Error redacting sensitive fields:', e);
      return decryptedData;
    }
  }, [decryptedData, redactSensitiveFields, revealState.sensitiveFieldsHidden]);

  // Update permission state when it changes
  useEffect(() => {
    if (hasPermission !== revealState.hasPermission) {
      setRevealState((prev) => ({ ...prev, hasPermission }));
    }
  }, [hasPermission, revealState.hasPermission]);

  // Log access when data is first revealed
  useEffect(() => {
    // Only track access if enabled and we have permission and data
    if (trackAccess && hasPermission && decryptedData && !revealState.isRevealed) {
      const now = new Date();

      // Update the reveal state
      setRevealState((prev) => ({
        ...prev,
        isRevealed: true,
        hasPermission,
        accessGranted: now,
        accessLog: [...prev.accessLog, { timestamp: now, action: 'initial_reveal' }],
      }));

      // Here you could also implement server-side access logging
      logger.info(`Document data revealed: CID ${cid}, document ${documentId}, requester ${requesterAddress}`);
    }
  }, [trackAccess, hasPermission, decryptedData, revealState.isRevealed, cid, documentId, requesterAddress]);

  // Function to toggle showing sensitive fields
  const toggleSensitiveFields = useCallback(() => {
    setRevealState((prev) => {
      const newState = {
        ...prev,
        sensitiveFieldsHidden: !prev.sensitiveFieldsHidden,
        accessLog: [
          ...prev.accessLog,
          {
            timestamp: new Date(),
            action: prev.sensitiveFieldsHidden ? 'reveal_sensitive_fields' : 'hide_sensitive_fields',
          },
        ],
      };

      // Log this action
      logger.info(
        `Sensitive fields ${newState.sensitiveFieldsHidden ? 'hidden' : 'revealed'} for document ${documentId}`
      );

      return newState;
    });
  }, [documentId]);

  return {
    data: processedData,
    isLoading,
    error,
    isRevealed: revealState.isRevealed,
    hasPermission,
    sensitiveFieldsHidden: revealState.sensitiveFieldsHidden,
    toggleSensitiveFields,
    accessLog: revealState.accessLog,
    accessGranted: revealState.accessGranted,
    rawAccessData,
  };
}
