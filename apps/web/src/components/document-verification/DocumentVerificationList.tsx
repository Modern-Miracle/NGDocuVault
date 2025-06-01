import React from 'react';
import { FilePenLine } from 'lucide-react';
import { useDocumentVerification } from './DocumentVerificationProvider';
import { DocumentVerificationItem } from './DocumentVerificationItem';

export const DocumentVerificationList: React.FC = () => {
  const { unverifiedDocuments, isLoading, searchTerm } = useDocumentVerification();

  // Filter documents based on search term
  const filteredDocuments = unverifiedDocuments.filter((doc) => {
    if (!searchTerm) return true;
    const docId = String(doc.contentHash || doc.documentId || '');
    const holderAddress = doc.holder.toLowerCase();
    const search = searchTerm.toLowerCase();
    return docId.toLowerCase().includes(search) || holderAddress.includes(search);
  });

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-lg text-card-foreground">Pending Verification Requests</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and verify documents that have been submitted for verification
        </p>
      </div>

      {isLoading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading documents...</p>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="divide-y divide-border">
          {filteredDocuments.map((doc) => {
            const docId = String(doc.contentHash || doc.documentId || Math.random());
            return <DocumentVerificationItem key={docId} document={doc} />;
          })}
        </div>
      ) : (
        <div className="p-8 text-center">
          <FilePenLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-1">No documents to verify</h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'No documents match your search criteria' 
              : 'There are currently no documents waiting for verification'}
          </p>
        </div>
      )}
    </div>
  );
};