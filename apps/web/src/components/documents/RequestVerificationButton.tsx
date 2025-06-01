import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRequestVerification } from '@/hooks/use-docu-vault';
import { useToast } from '@/hooks/use-toast';

type RequestVerificationButtonProps = {
  documentId: string;
  onSuccess?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
};

export function RequestVerificationButton({
  documentId,
  onSuccess,
  className,
  variant = 'secondary',
  size = 'default',
}: RequestVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const requestVerificationMutation = useRequestVerification();
  const { toast } = useToast();

  const handleRequestVerification = async () => {
    if (!documentId || isLoading) return;

    setIsLoading(true);
    try {
      const result = await requestVerificationMutation.mutateAsync({
        documentId,
      });

      if (result.success) {
        toast.success('Verification requested successfully');
        onSuccess?.();
      } else if (result.error) {
        toast.error('Failed to request verification', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast.error('Failed to request verification', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRequestVerification}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Requesting...' : 'Request Verification'}
    </Button>
  );
}
