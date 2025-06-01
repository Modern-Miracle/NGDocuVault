import React from 'react';
import { FileCheck, AlertCircle, ShieldOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRegisterDocument } from './RegisterDocumentProvider';
import { RegisterDocumentForm } from './RegisterDocumentForm';
import { useNavigate } from 'react-router-dom';

export const RegisterDocumentContent: React.FC = () => {
  const { isIssuer, isLoadingPermissions } = useRegisterDocument();
  const navigate = useNavigate();

  if (isLoadingPermissions) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Register Document</h1>
            <p className="text-muted-foreground">Create and register new documents on the blockchain</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Checking permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isIssuer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <ShieldOff className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Register Document</h1>
            <p className="text-muted-foreground">Create and register new documents on the blockchain</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be registered as an issuer to access this feature. Please contact an administrator to get issuer
            permissions.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          <Button variant="outline" onClick={() => navigate('/documents')}>
            View Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Register Document</h1>
          <p className="text-muted-foreground">Create and register new documents on the blockchain</p>
        </div>
      </div>

      {/* Instructions */}
      <Alert className="bg-primary/10 text-primary">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Registration Guidelines</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Ensure all document information is accurate before submission</li>
            <li>• Documents will be permanently stored on IPFS and blockchain</li>
            <li>• The holder address must be a valid Ethereum address</li>
            <li>• Expiration date must be in the future</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Registration Form */}
      <RegisterDocumentForm />
    </div>
  );
};
