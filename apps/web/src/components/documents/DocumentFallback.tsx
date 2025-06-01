import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentErrorProps {
  error: unknown;
  onReturnClick: () => void;
}

export function DocumentError({ error, onReturnClick }: DocumentErrorProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-3">Error Loading Document</h2>
        <p className="text-muted-foreground mb-6">
          {error instanceof Error ? error.message : 'Failed to load document details.'}
        </p>
        <Button onClick={onReturnClick} className="bg-primary text-primary-foreground">
          Return to Documents
        </Button>
      </div>
    </div>
  );
}

export function DocumentNotFound({ onReturnClick }: { onReturnClick: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-3">Document Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The document you are looking for either does not exist or you don't have permission to view it.
        </p>
        <Button onClick={onReturnClick} className="bg-primary text-primary-foreground">
          Return to Documents
        </Button>
      </div>
    </div>
  );
}

export function DocumentLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
