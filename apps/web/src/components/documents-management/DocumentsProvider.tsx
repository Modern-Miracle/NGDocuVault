import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRequestVerification } from '@/hooks/use-docu-vault';
import { useDocumentsData, type DocumentInfo, type DocumentFilters } from '@/hooks/use-documents-data';

interface DocumentsContextValue {
  // Data
  documents: DocumentInfo[];
  filteredDocuments: DocumentInfo[];
  isLoading: boolean;
  error: Error | null;

  // Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: DocumentFilters;
  setFilters: (filters: DocumentFilters) => void;

  // Actions
  viewDocument: (documentId: string) => void;
  requestVerification: (documentId: string) => Promise<void>;
  refetch: () => void;

  // State
  verifyingDocumentId: string | null;
}

const DocumentsContext = createContext<DocumentsContextValue | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentsContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentsProvider');
  }
  return context;
};

interface DocumentsProviderProps {
  children: ReactNode;
}

export const DocumentsProvider: React.FC<DocumentsProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { documents, isLoading, error, refetch } = useDocumentsData();
  const requestVerificationMutation = useRequestVerification();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DocumentFilters>({
    verified: null,
    documentType: null,
    sortBy: 'issuanceTimestamp',
    sortDirection: 'desc',
  });
  const [verifyingDocumentId, setVerifyingDocumentId] = useState<string | null>(null);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];

    return documents
      .filter((doc: DocumentInfo) => {
        // Verification filter
        if (filters.verified !== null && doc.isVerified !== filters.verified) {
          return false;
        }

        // Document type filter
        if (filters.documentType !== null && doc.documentType !== filters.documentType) {
          return false;
        }

        // Search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const docId = doc.documentId.toLowerCase();
          const holderAddr = doc.holder.toLowerCase();
          const issuerAddr = doc.issuer.toLowerCase();

          if (!docId.includes(search) && !holderAddr.includes(search) && !issuerAddr.includes(search)) {
            return false;
          }
        }

        return true;
      })
      .sort((a: DocumentInfo, b: DocumentInfo) => {
        const field = filters.sortBy;
        const direction = filters.sortDirection === 'asc' ? 1 : -1;

        const aValue = Number(a[field] || 0);
        const bValue = Number(b[field] || 0);

        return direction * (aValue - bValue);
      });
  }, [documents, filters, searchTerm]);

  const viewDocument = useCallback(
    (documentId: string) => {
      navigate(`/documents/${documentId}`);
    },
    [navigate]
  );

  const requestVerification = useCallback(
    async (documentId: string) => {
      if (!documentId || verifyingDocumentId) return;

      setVerifyingDocumentId(documentId);
      try {
        const result = await requestVerificationMutation.mutateAsync({
          documentId,
        });

        if (result.success) {
          toast.success('Verification requested successfully');
          refetch();
        } else if (result.error) {
          toast.error('Failed to request verification', {
            description: result.error,
          });
        }
      } catch (error) {
        console.error('Error requesting verification:', error);
        toast.error('Failed to request verification', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setVerifyingDocumentId(null);
      }
    },
    [requestVerificationMutation, toast, refetch, verifyingDocumentId]
  );

  const value: DocumentsContextValue = {
    documents,
    filteredDocuments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    viewDocument,
    requestVerification,
    refetch,
    verifyingDocumentId,
  };

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
};
