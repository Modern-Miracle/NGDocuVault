import { useContext } from 'react';
import { DocumentDetailsContext } from '@/components/document-details/DocumentDetailsProvider';

export function useDocumentDetails() {
  const context = useContext(DocumentDetailsContext);
  if (!context) {
    throw new Error('useDocumentDetails must be used within DocumentDetailsProvider');
  }
  return context;
}
