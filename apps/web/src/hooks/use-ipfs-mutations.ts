'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { hashData } from '@/lib/hash';
import { DocuVaultABI } from '@docu/abi';
import { parseDocuVaultError } from '@/lib/actions/docu-vault/error-parser';
import { DOCU_VAULT_KEYS } from '@/hooks/use-docu-vault';
import { IPFS_ENDPOINTS } from '@/lib/config';
import { fetchWithErrorHandling } from '@/lib/apiHelper';
import { logger } from '@/lib/logger';

/**
 * Interface for IPFS upload response
 */
export interface IPFSUploadResponse {
  cid: string;
  size: number;
  contentHash: string;
}

/**
 * Interface for document data with resource type
 * Includes index signature to make it assignable to Record<string, unknown>
 */
export interface DocumentData {
  document?: {
    documentType?: string;
  };
  metadata?: {
    documentType?: string;
    recordId?: string;
  };
  id?: string;
  documentId?: string;
  [key: string]: unknown;
}

/**
 * Upload to IPFS function
 * Sends data to the backend IPFS service for upload
 */
const uploadToIPFS = async (data: Record<string, unknown>, holder: string): Promise<IPFSUploadResponse> => {
  try {
    // Extract resource type from data if available
    const documentType =
      data.document && typeof data.document === 'object' && 'documentType' in data.document
        ? (data.document.documentType as string)
        : data.metadata && typeof data.metadata === 'object' && 'documentType' in data.metadata
          ? (data.metadata.documentType as string)
          : 'general';

    const response = await fetchWithErrorHandling<IPFSUploadResponse>(IPFS_ENDPOINTS.uploadEncryptedData, {
      method: 'POST',
      body: JSON.stringify({
        document: data,
        metadata: {
          name: (data.name as string) || 'Untitled Document',
          owner: holder,
          description: (data.description as string) || '',
          type: documentType,
        },
      }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to upload to IPFS');
    }

    logger.info(`Data uploaded to IPFS with CID: ${response.data.cid}`);
    return response.data;
  } catch (error) {
    logger.error('Error uploading to IPFS:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

/**
 * Delete IPFS data function
 * Calls the backend API to unpin/delete data from IPFS
 */
const deleteIPFSData = async (cid: string): Promise<{ success: boolean }> => {
  try {
    const url = `${IPFS_ENDPOINTS.deleteData}?cid=${cid}`;
    const response = await fetchWithErrorHandling<{ success: boolean }>(url, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete from IPFS');
    }

    return { success: true };
  } catch (error) {
    logger.error('Error deleting from IPFS:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// Default configuration - should be overridden in production
const defaultConfig = {
  contractAddress: (import.meta.env.VITE_DOCU_VAULT_CONTRACT_ADDRESS || '0x0') as `0x${string}`,
  chainId: Number(import.meta.env.VITE_CHAIN_ID || 1),
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545',
};

/**
 * Enumeration of document types in DocuVault
 */
export enum DocumentType {
  GENERAL = 0,
  IDENTITY = 1,
  HEALTH = 2,
  FINANCIAL = 3,
  EDUCATIONAL = 4,
  LEGAL = 5,
  CERTIFICATION = 6,
  OTHER = 7,
}

/**
 * Convert string resource type to enum value
 * @param resourceType Resource type string
 * @returns The enum value
 */
export function getDocumentTypeEnum(resourceType: string): number {
  const resourceTypeMap: Record<string, DocumentType> = {
    general: DocumentType.GENERAL,
    identity: DocumentType.IDENTITY,
    health: DocumentType.HEALTH,
    financial: DocumentType.FINANCIAL,
    educational: DocumentType.EDUCATIONAL,
    legal: DocumentType.LEGAL,
    certification: DocumentType.CERTIFICATION,
    other: DocumentType.OTHER,
  };

  return resourceTypeMap[resourceType.toLowerCase()] ?? DocumentType.OTHER;
}

/**
 * Hook for uploading data to IPFS
 * @returns Mutation object for uploading data to IPFS
 */
export function useUploadToIPFS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      holder,
    }: {
      data: Record<string, unknown>;
      holder: string;
    }): Promise<IPFSUploadResponse> => {
      console.log('Uploading data with issuer/holder:', holder);
      return await uploadToIPFS(data, holder);
    },
    onSuccess: () => {
      toast.success('Data successfully uploaded to IPFS');
      queryClient.invalidateQueries({ queryKey: ['holderDocuments'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload to IPFS: ${error.message}`);
    },
  });
}

/**
 * Hook for deleting data from IPFS
 * @returns Mutation object for deleting data from IPFS
 */
export function useDeleteIPFSData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cid: string): Promise<{ success: boolean }> => {
      return await deleteIPFSData(cid);
    },
    onSuccess: () => {
      toast.success('Data successfully deleted from IPFS');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['holderDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['ipfs'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete from IPFS: ${error.message}`);
    },
  });
}

/**
 * Hook for batch uploading multiple files to IPFS
 * @returns Mutation object for the batch upload operation
 */
export function useBatchUploadToIPFS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
    }: {
      files: Array<{
        data: Record<string, unknown>;
        metadata: Record<string, unknown>;
      }>;
    }): Promise<Array<IPFSUploadResponse>> => {
      try {
        const response = await fetchWithErrorHandling<{ results: Array<IPFSUploadResponse> }>(
          IPFS_ENDPOINTS.batchUpload,
          {
            method: 'POST',
            body: JSON.stringify({
              files: files.map((file) => ({
                document: file.data,
                metadata: file.metadata,
              })),
            }),
          }
        );

        if (!response.success || !response.data?.results) {
          throw new Error(response.message || 'Failed to batch upload to IPFS');
        }

        return response.data.results;
      } catch (error) {
        logger.error('Error batch uploading to IPFS:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Files successfully uploaded to IPFS');
      queryClient.invalidateQueries({ queryKey: ['holderDocuments'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to batch upload to IPFS: ${error.message}`);
    },
  });
}

/**
 * Hook for batch deleting multiple files from IPFS
 * @returns Mutation object for the batch delete operation
 */
export function useBatchDeleteFromIPFS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      cids: string[]
    ): Promise<{ success: boolean; results: Array<{ cid: string; success: boolean }> }> => {
      try {
        const response = await fetchWithErrorHandling<{
          success: boolean;
          results: Array<{ cid: string; success: boolean }>;
        }>(IPFS_ENDPOINTS.batchDelete, {
          method: 'DELETE',
          body: JSON.stringify({ cids }),
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to batch delete from IPFS');
        }

        return {
          success: response.data.success,
          results: response.data.results || [],
        };
      } catch (error) {
        logger.error('Error batch deleting from IPFS:', error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Files successfully deleted from IPFS');
      queryClient.invalidateQueries({ queryKey: ['holderDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['ipfs'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to batch delete from IPFS: ${error.message}`);
    },
  });
}

/**
 * Hook for registering a document with DocuVault using IPFS
 * @returns Mutation object for the complete flow
 */
export function useCreateRecordWithIPFS() {
  const uploadToIPFSMutation = useUploadToIPFS();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async ({ data, holder }: { data: DocumentData; holder: string }) => {
      if (!address || !walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        console.log('Creating document with data:', {
          documentType: data.document?.documentType,
          metadataDocumentType: data.metadata?.documentType,
          recordId: data.metadata?.recordId,
        });

        // Step 1: Upload to IPFS
        const ipfsResponse = await uploadToIPFSMutation.mutateAsync({ data, holder });
        const cidHash = await hashData({ cid: ipfsResponse.cid });

        // Get the resource type from the form data
        const documentType = data.document?.documentType || 'general';

        // Convert string resource type to enum
        const documentTypeEnum = getDocumentTypeEnum(documentType);

        // Current timestamp in seconds
        const now = Math.floor(Date.now() / 1000);

        // Default expiration 1 year from now
        const expirationDate = now + 31536000;

        // Step 2: Register on DocuVault using wallet client

        const { request } = await publicClient.simulateContract({
          address: defaultConfig.contractAddress,
          abi: DocuVaultABI,
          functionName: 'registerDocument',
          args: [
            cidHash as `0x${string}`,
            ipfsResponse.cid,
            holder as `0x${string}`,
            BigInt(now), // issuanceDate
            BigInt(expirationDate), // expirationDate
            BigInt(documentTypeEnum), // documentType
          ],
          account: address,
        });

        // Send the transaction
        const hash = await walletClient.writeContract(request);

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
          success: true,
          hash: receipt.transactionHash,
          receipt,
          cid: ipfsResponse.cid,
          documentId: cidHash,
          documentType,
        };
      } catch (error: unknown) {
        console.error('Error creating record with IPFS:', error);

        // Type guard for error-like objects
        const isErrorLike = (
          obj: unknown
        ): obj is { cause?: { reason?: string }; shortMessage?: string; message?: string } => {
          return obj !== null && typeof obj === 'object';
        };

        // Try to extract specific error information
        if (isErrorLike(error)) {
          if (error.cause?.reason) {
            throw new Error(error.cause.reason);
          }
          if (error.shortMessage) {
            throw new Error(error.shortMessage);
          }
          if (error.message) {
            throw new Error(error.message);
          }
        }

        throw new Error('Unknown contract error');
      }
    },
    onSuccess: (result) => {
      toast.success(`${result.documentType} document successfully created and registered on DocuVault`);
      // Invalidate relevant queries
      if (address) {
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.holder.documents(address as `0x${string}`),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to create record: ${error.message}`);
    },
  });
}

/**
 * Hook for updating a document on DocuVault with new IPFS data
 * @returns Mutation object for the complete flow
 */
export function useUpdateRecordWithIPFS() {
  const uploadToIPFSMutation = useUploadToIPFS();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  return useMutation({
    mutationFn: async ({ data, holder }: { data: DocumentData; holder: string }) => {
      if (!address || !walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        // Step 1: Upload to IPFS
        const ipfsResponse = await uploadToIPFSMutation.mutateAsync({ data, holder });

        // Ensure documentId is properly formatted
        const documentId = data.id || data.documentId;
        if (!documentId) {
          throw new Error('Document ID is required for updating');
        }

        const formattedDocumentId =
          typeof documentId === 'string' && documentId.startsWith('0x')
            ? (documentId as `0x${string}`)
            : (`0x${documentId}` as `0x${string}`);

        // Get the resource type
        const documentType = data.document?.documentType || 'general';
        const documentTypeEnum = getDocumentTypeEnum(documentType);

        // Default expiration 1 year from now
        const expirationDate = Math.floor(Date.now() / 1000) + 31536000;

        // Generate content hash
        const contentHash = await hashData({ cid: ipfsResponse.cid });

        // Step 2: Update on DocuVault
        // Prepare the transaction
        const { request } = await publicClient.simulateContract({
          address: defaultConfig.contractAddress,
          abi: DocuVaultABI,
          functionName: 'updateDocument',
          args: [formattedDocumentId, contentHash, ipfsResponse.cid, BigInt(expirationDate), BigInt(documentTypeEnum)],
          account: address,
        });

        // Send the transaction
        const hash = await walletClient.writeContract(request);

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
          success: true,
          hash: receipt.transactionHash,
          receipt,
          cid: ipfsResponse.cid,
          documentId: formattedDocumentId,
        };
      } catch (error) {
        console.error('Error updating record with IPFS:', error);
        const parsedError = parseDocuVaultError(error);
        if (parsedError) {
          throw new Error(parsedError.message);
        }
        throw new Error('Failed to update record with IPFS');
      }
    },
    onSuccess: (_, variables) => {
      toast.success('Document successfully updated on IPFS and DocuVault');
      // Invalidate relevant queries
      if (address) {
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.holder.documents(address as `0x${string}`),
        });
      }

      const documentId = variables.data.id || variables.data.documentId;
      if (documentId) {
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.info(documentId.toString()),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update record: ${error.message}`);
    },
  });
}
