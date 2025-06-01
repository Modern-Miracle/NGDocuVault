import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useHolderDocuments, useMultipleDocumentInfo } from '@/hooks/use-docu-vault';

export interface DocumentInfo {
  isVerified: boolean;
  contentHash?: `0x${string}`;
  documentId?: string;
  holder: `0x${string}`;
  documentType: bigint | number;
  issuanceTimestamp?: bigint;
  expirationTimestamp?: bigint;
}

export interface UseDocumentVerificationDataReturn {
  allDocuments: DocumentInfo[];
  unverifiedDocuments: DocumentInfo[];
  isLoading: boolean;
  documentIds: string[];
}

export const useDocumentVerificationData = (): UseDocumentVerificationDataReturn => {
  const { address } = useAccount();
  const { data: documentsData } = useHolderDocuments((address as `0x${string}`) || '0x0');
  const documentIds = documentsData?.documentIds || [];

  // Get document info data
  const { data: rawDocumentsInfo = [], isLoading } = useMultipleDocumentInfo(
    documentIds.length > 0 ? documentIds : undefined
  );

  // Memoize the processed documents to prevent infinite loops
  const allDocuments = useMemo(() => {
    if (!rawDocumentsInfo || !Array.isArray(rawDocumentsInfo)) return [];
    return rawDocumentsInfo as DocumentInfo[];
  }, [rawDocumentsInfo]);

  // Memoize unverified documents
  const unverifiedDocuments = useMemo(() => {
    return allDocuments.filter((doc) => !doc.isVerified);
  }, [allDocuments]);

  return {
    allDocuments,
    unverifiedDocuments,
    isLoading,
    documentIds,
  };
};