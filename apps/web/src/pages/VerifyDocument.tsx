import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useDidSiwe } from '@/hooks/use-did-siwe';
import {
  DocumentVerificationProvider,
  DocumentSelectionHeader,
  DocumentVerificationList,
  ManualVerificationForm,
} from '@/components/document-verification';

// Inner component that uses the context
const VerifyDocumentContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Verify Documents</h1>
        <DocumentSelectionHeader />
      </div>

      <DocumentVerificationList />
      <ManualVerificationForm />
    </div>
  );
};

// Main component that handles authentication and provides context
const VerifyDocument: React.FC = () => {
  const navigate = useNavigate();
  const { isVerifier } = useDidSiwe();

  // Check if user has verifier role
  if (!isVerifier) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Permission Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need Verifier privileges to access this page. Please contact an administrator to request access.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <DocumentVerificationProvider>
      <VerifyDocumentContent />
    </DocumentVerificationProvider>
  );
};

export default VerifyDocument;