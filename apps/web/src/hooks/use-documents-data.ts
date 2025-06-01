import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useHolderDocuments, useMultipleDocumentInfo } from '@/hooks/use-docu-vault';
import { DocumentType } from '@/lib/actions/docu-vault/types';

export interface DocumentInfo {
  documentId: string;
  contentHash?: `0x${string}`;
  cid: string;
  holder: `0x${string}`;
  issuer: `0x${string}`;
  issuanceTimestamp: bigint;
  expirationTimestamp: bigint;
  isVerified: boolean;
  documentType: DocumentType;
  isExpired?: boolean;
}

export interface DocumentFilters {
  verified: boolean | null;
  documentType: DocumentType | null;
  sortBy: 'issuanceTimestamp' | 'expirationTimestamp';
  sortDirection: 'asc' | 'desc';
}

export interface UseDocumentsDataReturn {
  documents: DocumentInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDocumentsData = (): UseDocumentsDataReturn => {
  const { address } = useAuth();
  
  const {
    data: holderData,
    isLoading: loadingHolder,
    error: holderError,
    refetch: refetchHolder,
  } = useHolderDocuments(address as `0x${string}`);

  const documentIds = holderData?.documentIds || [];

  const {
    data: documentsInfo = [],
    isLoading: loadingInfo,
    error: infoError,
    refetch: refetchInfo,
  } = useMultipleDocumentInfo(documentIds.length > 0 ? documentIds : undefined);

  // Process documents with proper type mapping
  const documents = useMemo(() => {
    if (!documentsInfo || !Array.isArray(documentsInfo)) return [];
    
    return documentsInfo.map((doc, index) => {
      const now = Date.now() / 1000; // Current timestamp in seconds
      const expirationTime = Number(doc.expirationTimestamp || 0);
      
      return {
        documentId: documentIds[index] || doc.documentId || '',
        contentHash: doc.contentHash,
        cid: doc.cid || '',
        holder: doc.holder,
        issuer: doc.issuer,
        issuanceTimestamp: doc.issuanceTimestamp || BigInt(0),
        expirationTimestamp: doc.expirationTimestamp || BigInt(0),
        isVerified: doc.isVerified || false,
        documentType: Number(doc.documentType) as DocumentType,
        isExpired: expirationTime > 0 && expirationTime < now,
      } as DocumentInfo;
    });
  }, [documentsInfo, documentIds]);

  const refetch = () => {
    refetchHolder();
    refetchInfo();
  };

  return {
    documents,
    isLoading: loadingHolder || loadingInfo,
    error: holderError || infoError,
    refetch,
  };
};