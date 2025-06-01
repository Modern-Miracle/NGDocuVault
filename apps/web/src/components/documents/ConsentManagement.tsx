import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGiveConsent, useRevokeConsent, useShareRequest } from '@/hooks/use-docu-vault';
import { useToast } from '@/hooks/use-toast';

type ConsentManagementProps = {
  documentId: string;
  onSuccess?: () => void;
};

export function ConsentManagement({ documentId, onSuccess }: ConsentManagementProps) {
  const [requesterAddress, setRequesterAddress] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [isGiving, setIsGiving] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [currentRequester, setCurrentRequester] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const giveConsentMutation = useGiveConsent();
  const revokeConsentMutation = useRevokeConsent();
  const { data: shareRequest, isLoading: shareRequestLoading } = useShareRequest(
    documentId,
    currentRequester || undefined
  );
  const { toast } = useToast();

  const handleGiveConsent = async () => {
    if (!documentId || !requesterAddress || !validUntil || isGiving) return;

    const validUntilDate = Math.floor(new Date(validUntil).getTime() / 1000);

    setIsGiving(true);
    try {
      const result = await giveConsentMutation.mutateAsync({
        documentId,
        requester: requesterAddress as `0x${string}`,
        consent: 2,
        validUntil: validUntilDate,
      });

      if (result.success) {
        toast.success('Consent granted successfully');
        setDialogOpen(false);
        setRequesterAddress('');
        setValidUntil('');
        onSuccess?.();
      } else if (result.error) {
        toast.error('Failed to grant consent', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Error granting consent:', error);
      toast.error('Failed to grant consent', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsGiving(false);
    }
  };

  const handleRevokeConsent = async (requester: string) => {
    if (!documentId || !requester || isRevoking) return;

    setIsRevoking(true);
    try {
      const result = await revokeConsentMutation.mutateAsync({
        documentId,
        requester: requester as `0x${string}`,
      });

      if (result.success) {
        toast.success('Consent revoked successfully');
        onSuccess?.();
      } else if (result.error) {
        toast.error('Failed to revoke consent', {
          description: result.error,
        });
      }
    } catch (error) {
      console.error('Error revoking consent:', error);
      toast.error('Failed to revoke consent', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Grant Access</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Access to Document</DialogTitle>
            <DialogDescription>
              Enter the address of the user you want to grant access to, and how long the access should be valid.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="requester">Requester Address</Label>
              <Input
                id="requester"
                value={requesterAddress}
                onChange={(e) => setRequesterAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleGiveConsent} disabled={!requesterAddress || !validUntil || isGiving}>
              {isGiving ? 'Granting...' : 'Grant Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Check Access Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checkRequester">Requester Address</Label>
              <div className="flex gap-2">
                <Input
                  id="checkRequester"
                  value={currentRequester}
                  onChange={(e) => setCurrentRequester(e.target.value)}
                  placeholder="0x..."
                />
                <Button
                  variant="outline"
                  onClick={() => handleRevokeConsent(currentRequester)}
                  disabled={!currentRequester || isRevoking || !shareRequest?.consent}
                >
                  {isRevoking ? 'Revoking...' : 'Revoke'}
                </Button>
              </div>
            </div>

            {currentRequester && !shareRequestLoading && shareRequest && (
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium">
                  Status:{' '}
                  {shareRequest.consent === 2
                    ? 'Access Granted'
                    : shareRequest.consent === 3
                      ? 'Access Revoked'
                      : 'No Access'}
                </p>
                {shareRequest.consent === 2 && shareRequest.validUntil && (
                  <p className="text-sm text-muted-foreground">
                    Valid until: {new Date(Number(shareRequest.validUntil) * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">You can grant or revoke access to your documents at any time.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
