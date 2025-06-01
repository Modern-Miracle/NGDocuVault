import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { RegisterDocumentProvider } from '@/components/register-document';
import { RegisterDocumentContent } from '@/components/register-document';
import { Loader2 } from 'lucide-react';

const RegisterDocument: React.FC = () => {
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
    <RegisterDocumentProvider>
      <RegisterDocumentContent />
    </RegisterDocumentProvider>
  );
};

export default RegisterDocument;
