import React from 'react';
import { format } from 'date-fns';
import { FileCheck } from 'lucide-react';
import { useDocumentVerification } from './DocumentVerificationProvider';
import type { DocumentInfo } from '@/hooks/use-document-verification-data';

interface DocumentVerificationItemProps {
  document: DocumentInfo;
}

export const DocumentVerificationItem: React.FC<DocumentVerificationItemProps> = ({ document }) => {
  const { selectedDocuments, handleSelectDocument, verifyDocument, isVerifying } = useDocumentVerification();
  
  const docId = String(document.contentHash || document.documentId || '');
  const isSelected = selectedDocuments.includes(docId);

  return (
    <div className="p-4 hover:bg-muted/50">
      <div className="flex items-start">
        <div className="flex items-center h-5 mt-1">
          <input
            id={`document-${docId}`}
            name={`document-${docId}`}
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectDocument(docId)}
            className="h-4 w-4 text-primary border-input rounded accent-primary"
            aria-label={`Select document ${docId.substring(0, 6)}...${docId.substring(docId.length - 4)}`}
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Document ID: {docId.substring(0, 6)}...{docId.substring(docId.length - 4)}
              </p>
              <div className="flex flex-wrap items-center mt-1 gap-y-1">
                <span className="text-xs text-muted-foreground mr-2">
                  Holder: {document.holder.substring(0, 6)}...{document.holder.substring(document.holder.length - 4)}
                </span>
                <span className="text-xs text-muted-foreground mr-2">
                  Issued: {format(new Date(Number(document.issuanceTimestamp || Date.now())), 'MMM d, yyyy')}
                </span>
                <span className="text-xs text-muted-foreground">
                  Expires: {format(new Date(Number(document.expirationTimestamp || Date.now())), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => verifyDocument(docId)}
              disabled={isVerifying}
              className={`
                flex items-center py-1.5 px-3 rounded-lg text-sm font-medium
                ${
                  isVerifying
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-chart-3/10 text-chart-3 hover:bg-chart-3/20'
                }
                transition-colors
              `}
            >
              <FileCheck className="h-4 w-4 mr-1.5" />
              Verify
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};