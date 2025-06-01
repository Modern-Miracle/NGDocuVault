import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVerifyDocument } from '@/hooks/use-docu-vault';
import { useToast } from '@/hooks/use-toast';

type VerifyDocumentButtonProps = {
  documentId: string;
  onSuccess?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function VerifyDocumentButton({
  documentId,
  onSuccess,
  className,
  variant = 'default',
  size = 'default',
}: VerifyDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const verifyMutation = useVerifyDocument();
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!documentId || isLoading) return;

    setIsLoading(true);
    try {
      const result = await verifyMutation.mutateAsync({
        documentId,
      });

      if (result.success) {
        toast.success('Document verified successfully');
        onSuccess?.();
      } else if (result.error) {
        toast.error('Failed to verify document', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to verify document', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleVerify} disabled={isLoading} className={className}>
      {isLoading ? 'Verifying...' : 'Verify Document'}
    </Button>
  );
}
