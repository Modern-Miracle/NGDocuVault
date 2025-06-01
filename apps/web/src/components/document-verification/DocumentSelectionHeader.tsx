import React from 'react';
import { FileCheck, Trash2 } from 'lucide-react';
import { useDocumentVerification } from './DocumentVerificationProvider';

export const DocumentSelectionHeader: React.FC = () => {
  const { selectedDocuments, clearSelection, verifySelectedDocuments, isVerifying } = useDocumentVerification();

  if (selectedDocuments.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
      </span>
      <button
        type="button"
        onClick={verifySelectedDocuments}
        disabled={isVerifying}
        className={`
          flex items-center py-2 px-3 rounded-lg text-primary-foreground font-medium
          ${isVerifying ? 'bg-muted cursor-not-allowed' : 'bg-chart-3 hover:bg-chart-3/90'}
          transition-colors
        `}
      >
        <FileCheck className="h-4 w-4 mr-1.5" />
        Verify Selected
      </button>
      <button
        type="button"
        onClick={clearSelection}
        disabled={isVerifying}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Clear selection"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
};