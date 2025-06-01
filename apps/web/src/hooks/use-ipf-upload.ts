'use client';

import { useState } from 'react';
import { useUploadToIPFS } from './use-ipfs-mutations';
import { useIPFSData } from './use-ipfs-queries';
import { toast } from 'sonner';
import { useRegisterDocument, useUpdateDocument, useVerifyDocument, DOCU_VAULT_KEYS } from '@/hooks/use-docu-vault';
import { generateDocumentId } from '@/lib/actions/docu-vault/query';
import { hashData } from '@/lib/hash';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { logger } from '@/lib/logger';

export interface UploadDocumentOptions {
  documentType?: number;
  expirationDate?: number;
  issuanceDate?: number;
  metadata?: Record<string, unknown>;
}

export interface UploadDocumentResult {
  success: boolean;
  cid: string;
  transactionHash: string;
  documentId: string | null;
  contentHash?: string;
}

/**
 * Hook for managing IPFS data upload and retrieval with DocuVault integration
 * @returns Functions and state for IPFS operations with DocuVault integration
 */
export function useIPFSUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadedCid, setUploadedCid] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { address } = useAccount();

  // IPFS hooks
  const uploadToIPFSMutation = useUploadToIPFS();
  const uploadedDataQuery = useIPFSData(uploadedCid || undefined, {
    enabled: !!uploadedCid,
  });

  // DocuVault hooks
  const registerDocumentMutation = useRegisterDocument();
  const updateDocumentMutation = useUpdateDocument();
  const verifyDocumentMutation = useVerifyDocument();

  /**
   * Upload data to IPFS without blockchain registration
   * @param data - The data to upload
   * @param holder - The document holder address
   * @returns The IPFS response with CID and content hash
   */
  const uploadToIPFS = async (data: Record<string, unknown>, holder: string) => {
    try {
      setUploading(true);
      logger.info('Uploading data to IPFS for holder:', holder);

      const response = await uploadToIPFSMutation.mutateAsync({ data, holder });
      logger.info('Data uploaded successfully with CID:', response.cid);

      setUploadedCid(response.cid);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to upload to IPFS: ${errorMessage}`);
      toast.error(`Failed to upload to IPFS: ${errorMessage}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload data to IPFS and register it on the blockchain using DocuVault
   * @param data - The data to upload
   * @param holder - The document holder address
   * @param options - Additional options for document registration
   * @returns The registration response
   */
  const uploadAndRegisterDocument = async (
    data: Record<string, unknown>,
    holder: `0x${string}`,
    options: UploadDocumentOptions = {}
  ): Promise<UploadDocumentResult> => {
    try {
      setUploading(true);
      logger.info('Starting document upload and registration process');

      // Default values
      const documentType = options.documentType || 0; // Default document type (GENERAL)
      const now = Math.floor(Date.now() / 1000);
      const issuanceDate = options.issuanceDate || now;
      const expirationDate = options.expirationDate || now + 31536000; // Default 1 year expiration

      // Step 1: Upload to IPFS
      const response = await uploadToIPFSMutation.mutateAsync({
        data: {
          ...data,
          metadata: options.metadata || {},
        },
        holder,
      });

      setUploadedCid(response.cid);
      logger.info('Data uploaded to IPFS with CID:', response.cid);

      // Step 2: Create content hash from the CID
      const contentHash = response.contentHash
        ? (`0x${response.contentHash}` as `0x${string}`)
        : await hashData({ cid: response.cid });

      // Step 3: Generate document ID (helps us track it later)
      const docIdResult = await generateDocumentId(contentHash, holder, response.cid);
      const generatedDocumentId = docIdResult?.documentId || null;

      if (generatedDocumentId) {
        setDocumentId(generatedDocumentId);
        logger.info('Generated document ID:', generatedDocumentId);
      }

      // Step 4: Register document with DocuVault
      const registerResponse = await registerDocumentMutation.mutateAsync({
        contentHash,
        cid: response.cid,
        holder,
        issuanceDate,
        expirationDate,
        documentType,
      });

      if (registerResponse.success && registerResponse.hash) {
        logger.info('Document successfully registered on DocuVault with hash:', registerResponse.hash);
        toast.success('Document successfully registered on DocuVault');

        // Invalidate any relevant queries
        if (address) {
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.holder.documents(address as `0x${string}`),
          });
        }

        if (generatedDocumentId) {
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.document.info(generatedDocumentId),
          });
        }

        return {
          success: true,
          cid: response.cid,
          transactionHash: registerResponse.hash,
          documentId: generatedDocumentId,
          contentHash: contentHash as string,
        };
      } else {
        throw new Error(registerResponse.error || 'Failed to register document');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to upload and register document: ${errorMessage}`);
      toast.error(`Failed to upload and register document: ${errorMessage}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Upload data to IPFS and update an existing document on DocuVault
   * @param data - The data to upload
   * @param oldDocumentId - The ID of the document to update
   * @param options - Additional options for document update
   * @returns The update response
   */
  const uploadAndUpdateDocument = async (
    data: Record<string, unknown>,
    oldDocumentId: string,
    options: Omit<UploadDocumentOptions, 'issuanceDate'> = {}
  ): Promise<UploadDocumentResult> => {
    try {
      setUploading(true);
      logger.info('Starting document update process for ID:', oldDocumentId);

      // Default values
      const documentType = options.documentType || 0;
      const expirationDate = options.expirationDate || Math.floor(Date.now() / 1000) + 31536000; // Default 1 year expiration

      // Format document ID correctly
      const formattedDocumentId =
        typeof oldDocumentId === 'string' && oldDocumentId.startsWith('0x')
          ? (oldDocumentId as `0x${string}`)
          : (`0x${oldDocumentId}` as `0x${string}`);

      // Step 1: Upload to IPFS
      const response = await uploadToIPFSMutation.mutateAsync({
        data: {
          ...data,
          metadata: options.metadata || {},
          documentId: formattedDocumentId, // Include document ID in metadata
        },
        holder: address as string, // Use current account as holder
      });

      setUploadedCid(response.cid);
      logger.info('Updated data uploaded to IPFS with CID:', response.cid);

      // Step 2: Create content hash from the file content
      const contentHash = response.contentHash
        ? (`0x${response.contentHash}` as `0x${string}`)
        : await hashData({ cid: response.cid });

      // Step 3: Update document with DocuVault
      const updateResponse = await updateDocumentMutation.mutateAsync({
        oldDocumentId: formattedDocumentId,
        contentHash,
        cid: response.cid,
        expirationDate,
        documentType,
      });

      if (updateResponse.success && updateResponse.hash) {
        logger.info('Document successfully updated on DocuVault with hash:', updateResponse.hash);
        toast.success('Document successfully updated on DocuVault');

        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.info(formattedDocumentId),
        });

        if (address) {
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.holder.documents(address as `0x${string}`),
          });
        }

        return {
          success: true,
          cid: response.cid,
          transactionHash: updateResponse.hash,
          documentId: formattedDocumentId,
          contentHash: contentHash as string,
        };
      } else {
        throw new Error(updateResponse.error || 'Failed to update document');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to upload and update document: ${errorMessage}`);
      toast.error(`Failed to upload and update document: ${errorMessage}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Verify a document on DocuVault
   * @param documentId - The ID of the document to verify
   * @returns The verification result
   */
  const verifyDocument = async (documentId: string) => {
    try {
      logger.info('Verifying document:', documentId);

      const formattedDocumentId =
        typeof documentId === 'string' && documentId.startsWith('0x')
          ? (documentId as `0x${string}`)
          : (`0x${documentId}` as `0x${string}`);

      const result = await verifyDocumentMutation.mutateAsync({
        documentId: formattedDocumentId,
      });

      if (result.success) {
        logger.info('Document successfully verified');
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.info(formattedDocumentId),
        });
      } else {
        logger.warn('Document verification failed:', result.error);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to verify document: ${errorMessage}`);
      toast.error(`Failed to verify document: ${errorMessage}`);
      throw error;
    }
  };

  return {
    uploading,
    uploadedCid,
    uploadedData: uploadedDataQuery.data,
    isLoadingUploadedData: uploadedDataQuery.isLoading,
    documentId,
    // IPFS functions
    uploadToIPFS,
    // DocuVault integrated functions
    uploadAndRegisterDocument,
    uploadAndUpdateDocument,
    verifyDocument,
    reset: () => {
      setUploadedCid(null);
      setDocumentId(null);
    },
  };
}
