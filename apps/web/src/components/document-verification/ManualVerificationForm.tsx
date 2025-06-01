import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDocumentVerification } from './DocumentVerificationProvider';
import { toast } from 'sonner';

export const ManualVerificationForm: React.FC = () => {
  const { verifyDocument, isVerifying } = useDocumentVerification();
  const [documentId, setDocumentId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId.trim()) return;

    try {
      await verifyDocument(documentId);
      setDocumentId('');
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification failed. Please check the document ID and try again.');
    } finally {
      setDocumentId('');
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="font-semibold text-lg text-card-foreground">Manual Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter a document ID to verify it manually</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            placeholder="Enter document ID"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            disabled={isVerifying}
            className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isVerifying || !documentId.trim()}
            className="ml-3 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};
