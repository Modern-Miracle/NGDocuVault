import React, { createContext, useContext, ReactNode, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useShareDocument, useRequestShare, useGiveConsent, useRevokeConsent } from '@/hooks/use-docu-vault';
import { useSharedDocumentsData, type SharedDocumentInfo } from '@/hooks/use-shared-documents-data';
import { Consent } from '@/lib/actions/docu-vault/types';

interface SharedDocumentsContextValue {
  // Data
  sharedWithMe: SharedDocumentInfo[];
  sharedByMe: SharedDocumentInfo[];
  filteredSharedWithMe: SharedDocumentInfo[];
  filteredSharedByMe: SharedDocumentInfo[];
  isLoading: boolean;
  error: Error | null;
  
  // Filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: 'shared-with-me' | 'shared-by-me';
  setActiveTab: (tab: 'shared-with-me' | 'shared-by-me') => void;
  
  // Actions
  viewDocument: (documentId: string) => void;
  shareDocument: (documentId: string, requester: string) => Promise<void>;
  requestShareAccess: (documentId: string, holder: string) => Promise<void>;
  grantConsent: (documentId: string, requester: string, validUntil: number) => Promise<void>;
  revokeConsent: (documentId: string, requester: string) => Promise<void>;
  refetch: () => void;
  
  // State
  processingDocumentId: string | null;
}

const SharedDocumentsContext = createContext<SharedDocumentsContextValue | undefined>(undefined);

export const useSharedDocuments = () => {
  const context = useContext(SharedDocumentsContext);
  if (!context) {
    throw new Error('useSharedDocuments must be used within SharedDocumentsProvider');
  }
  return context;
};

interface SharedDocumentsProviderProps {
  children: ReactNode;
}

export const SharedDocumentsProvider: React.FC<SharedDocumentsProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sharedWithMe, sharedByMe, isLoading, error, refetch } = useSharedDocumentsData();
  
  const shareDocumentMutation = useShareDocument();
  const requestShareMutation = useRequestShare();
  const giveConsentMutation = useGiveConsent();
  const revokeConsentMutation = useRevokeConsent();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'shared-with-me' | 'shared-by-me'>('shared-with-me');
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null);

  // Filter documents based on search term
  const filteredSharedWithMe = useMemo(() => {
    if (!searchTerm) return sharedWithMe;
    
    const search = searchTerm.toLowerCase();
    return sharedWithMe.filter((doc) => {
      return (
        doc.documentId.toLowerCase().includes(search) ||
        doc.holder.toLowerCase().includes(search) ||
        doc.issuer.toLowerCase().includes(search)
      );
    });
  }, [sharedWithMe, searchTerm]);

  const filteredSharedByMe = useMemo(() => {
    if (!searchTerm) return sharedByMe;
    
    const search = searchTerm.toLowerCase();
    return sharedByMe.filter((doc) => {
      return (
        doc.documentId.toLowerCase().includes(search) ||
        doc.sharedWith.toLowerCase().includes(search) ||
        doc.issuer.toLowerCase().includes(search)
      );
    });
  }, [sharedByMe, searchTerm]);

  const viewDocument = useCallback((documentId: string) => {
    navigate(`/document/${documentId}`);
  }, [navigate]);

  const shareDocument = useCallback(async (documentId: string, requester: string) => {
    if (processingDocumentId) return;

    setProcessingDocumentId(documentId);
    try {
      const result = await shareDocumentMutation.mutateAsync({
        documentId,
        requester,
      });

      if (result.success) {
        toast({
          title: 'Document shared successfully',
          description: 'The document has been shared with the requester',
        });
        refetch();
      } else {
        toast({
          title: 'Failed to share document',
          description: result.error || 'An error occurred while sharing the document',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      toast({
        title: 'Failed to share document',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingDocumentId(null);
    }
  }, [shareDocumentMutation, toast, refetch, processingDocumentId]);

  const requestShareAccess = useCallback(async (documentId: string, holder: string) => {
    if (processingDocumentId) return;

    setProcessingDocumentId(documentId);
    try {
      const result = await requestShareMutation.mutateAsync({
        documentId,
        requester: holder, // In the contract, this is the requester address
      });

      if (result.success) {
        toast({
          title: 'Share access requested',
          description: 'Your request has been sent to the document holder',
        });
        refetch();
      } else {
        toast({
          title: 'Failed to request access',
          description: result.error || 'An error occurred while requesting access',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting share access:', error);
      toast({
        title: 'Failed to request access',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingDocumentId(null);
    }
  }, [requestShareMutation, toast, refetch, processingDocumentId]);

  const grantConsent = useCallback(async (documentId: string, requester: string, validUntil: number) => {
    if (processingDocumentId) return;

    setProcessingDocumentId(documentId);
    try {
      const result = await giveConsentMutation.mutateAsync({
        documentId,
        requester,
        consent: Consent.GRANTED,
        validUntil,
      });

      if (result.success) {
        toast({
          title: 'Consent granted',
          description: 'Access has been granted to the requester',
        });
        refetch();
      } else {
        toast({
          title: 'Failed to grant consent',
          description: result.error || 'An error occurred while granting consent',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error granting consent:', error);
      toast({
        title: 'Failed to grant consent',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingDocumentId(null);
    }
  }, [giveConsentMutation, toast, refetch, processingDocumentId]);

  const revokeConsent = useCallback(async (documentId: string, requester: string) => {
    if (processingDocumentId) return;

    setProcessingDocumentId(documentId);
    try {
      const result = await revokeConsentMutation.mutateAsync({
        documentId,
        requester,
      });

      if (result.success) {
        toast({
          title: 'Consent revoked',
          description: 'Access has been revoked from the requester',
        });
        refetch();
      } else {
        toast({
          title: 'Failed to revoke consent',
          description: result.error || 'An error occurred while revoking consent',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
      toast({
        title: 'Failed to revoke consent',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setProcessingDocumentId(null);
    }
  }, [revokeConsentMutation, toast, refetch, processingDocumentId]);

  const value: SharedDocumentsContextValue = {
    sharedWithMe,
    sharedByMe,
    filteredSharedWithMe,
    filteredSharedByMe,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    viewDocument,
    shareDocument,
    requestShareAccess,
    grantConsent,
    revokeConsent,
    refetch,
    processingDocumentId,
  };

  return <SharedDocumentsContext.Provider value={value}>{children}</SharedDocumentsContext.Provider>;
};