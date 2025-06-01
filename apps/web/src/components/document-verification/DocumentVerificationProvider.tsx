import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVerifyDocument } from '@/hooks/use-docu-vault';
import { useDocumentVerificationData, type DocumentInfo } from '@/hooks/use-document-verification-data';

interface DocumentVerificationContextValue {
  // Data
  unverifiedDocuments: DocumentInfo[];
  isLoading: boolean;
  isVerifying: boolean;

  // Selection
  selectedDocuments: string[];
  handleSelectDocument: (documentId: string) => void;
  clearSelection: () => void;

  // Actions
  verifyDocument: (documentId: string) => Promise<void>;
  verifySelectedDocuments: () => Promise<void>;
  
  // Filters and search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const DocumentVerificationContext = createContext<DocumentVerificationContextValue | undefined>(undefined);

export const useDocumentVerification = () => {
  const context = useContext(DocumentVerificationContext);
  if (!context) {
    throw new Error('useDocumentVerification must be used within DocumentVerificationProvider');
  }
  return context;
};

interface DocumentVerificationProviderProps {
  children: ReactNode;
}

export const DocumentVerificationProvider: React.FC<DocumentVerificationProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { unverifiedDocuments, isLoading } = useDocumentVerificationData();
  const { mutateAsync: verifyDocumentMutation } = useVerifyDocument();

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedDocIds, setVerifiedDocIds] = useState<Set<string>>(new Set());

  // Filter out documents that have been verified in this session
  const activeUnverifiedDocuments = unverifiedDocuments.filter((doc) => {
    const docId = String(doc.contentHash || doc.documentId || '');
    return !verifiedDocIds.has(docId);
  });

  const handleSelectDocument = useCallback((documentId: string) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDocuments([]);
  }, []);

  const verifyDocument = useCallback(async (documentId: string) => {
    try {
      setIsVerifying(true);
      await verifyDocumentMutation({ documentId });
      
      // Mark as verified in local state
      setVerifiedDocIds((prev) => new Set(prev).add(documentId));
      
      // Remove from selection if selected
      setSelectedDocuments((prev) => prev.filter((id) => id !== documentId));
      
      toast.success('Document verified successfully!');
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document');
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, [verifyDocumentMutation, toast]);

  const verifySelectedDocuments = useCallback(async () => {
    if (selectedDocuments.length === 0) return;

    try {
      setIsVerifying(true);
      const results = await Promise.allSettled(
        selectedDocuments.map((docId) => verifyDocumentMutation({ documentId: docId }))
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      // Mark successful verifications
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          setVerifiedDocIds((prev) => new Set(prev).add(selectedDocuments[index]));
        }
      });

      if (successful > 0) {
        toast.success(`${successful} document${successful > 1 ? 's' : ''} verified successfully!`);
      }
      if (failed > 0) {
        toast.error(`Failed to verify ${failed} document${failed > 1 ? 's' : ''}`);
      }

      clearSelection();
    } catch (error) {
      console.error('Error verifying documents:', error);
      toast.error('Failed to verify documents');
    } finally {
      setIsVerifying(false);
    }
  }, [selectedDocuments, verifyDocumentMutation, clearSelection, toast]);

  const value: DocumentVerificationContextValue = {
    unverifiedDocuments: activeUnverifiedDocuments,
    isLoading,
    isVerifying,
    selectedDocuments,
    handleSelectDocument,
    clearSelection,
    verifyDocument,
    verifySelectedDocuments,
    searchTerm,
    setSearchTerm,
  };

  return (
    <DocumentVerificationContext.Provider value={value}>
      {children}
    </DocumentVerificationContext.Provider>
  );
};