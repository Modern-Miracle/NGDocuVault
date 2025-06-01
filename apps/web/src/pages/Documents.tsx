import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { DocumentsProvider } from '@/components/documents-management/DocumentsProvider';
import { DocumentsContent } from '@/components/documents-management/DocumentsContent';
import { Loader2 } from 'lucide-react';

const Documents: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/auth/siwe" />;
  }

  return (
    <DocumentsProvider>
      <DocumentsContent />
    </DocumentsProvider>
  );
};

export default Documents;