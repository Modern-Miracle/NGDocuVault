import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Users, UserPlus, Eye, EyeOff, Clock, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentDetails } from '@/hooks/use-document-details';
import { useGiveConsent, useRevokeConsent } from '@/hooks/use-docu-vault';
import { useToast } from '@/hooks/use-toast';
import { Consent } from '@/lib/actions/docu-vault/types';
import { isAddress } from 'viem';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Type interface for events with requester property
interface EventWithRequester {
  type: string;
  timestamp?: bigint;
  args?: {
    requester?: string;
  };
}

export function DocumentDetailsSharing() {
  const { documentId, isHolder, events, refetchAll } = useDocumentDetails();
  const { mutate: giveConsent, isPending: isGivingConsent } = useGiveConsent();
  const { mutate: revokeConsent, isPending: isRevokingConsent } = useRevokeConsent();
  const { toast } = useToast();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [requesterAddress, setRequesterAddress] = useState('');
  const [consentType, setConsentType] = useState<'granted' | 'denied'>('granted');
  const [validityDays, setValidityDays] = useState('30');

  // Process events to get sharing information
  const { shareRequests, consentStatuses } = useMemo(() => {
    const consentStatuses = new Map<string, { status: Consent; timestamp?: bigint }>();

    // Get share requests
    const shareRequests = events
      .filter((e) => e.type === 'ShareRequested')
      .map((e) => {
        const eventWithRequester = e as EventWithRequester;
        return {
          requester: eventWithRequester.args?.requester || '',
          timestamp: e.timestamp,
        };
      });

    // Process consent events
    events.forEach((event) => {
      const eventWithRequester = event as EventWithRequester;

      if (event.type === 'ConsentGranted') {
        consentStatuses.set(eventWithRequester.args?.requester || '', {
          status: Consent.GRANTED,
          timestamp: event.timestamp,
        });
      } else if (event.type === 'ConsentRevoked') {
        consentStatuses.set(eventWithRequester.args?.requester || '', {
          status: Consent.NONE,
          timestamp: event.timestamp,
        });
      }
    });

    return { shareRequests, consentStatuses };
  }, [events]);

  const handleGiveConsent = () => {
    if (!isAddress(requesterAddress)) {
      toast.error('Invalid Ethereum address');
      return;
    }

    const validUntil = Math.floor(Date.now() / 1000) + parseInt(validityDays) * 24 * 60 * 60;
    const consent = consentType === 'granted' ? Consent.GRANTED : Consent.DENIED;

    giveConsent(
      {
        documentId,
        requester: requesterAddress,
        consent,
        validUntil,
      },
      {
        onSuccess: () => {
          toast.success(`Consent ${consentType} successfully`);
          setShowShareDialog(false);
          setRequesterAddress('');
          refetchAll();
        },
        onError: (error) => {
          toast.error('Failed to update consent', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      }
    );
  };

  const handleRevokeConsent = (requester: string) => {
    revokeConsent(
      { documentId, requester },
      {
        onSuccess: () => {
          toast.success('Consent revoked successfully');
          refetchAll();
        },
        onError: (error) => {
          toast.error('Failed to revoke consent', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      }
    );
  };

  /*
const handleRequestShare = () => {
    if (!isAddress(requesterAddress)) {
      toast.error('Invalid Ethereum address');
      return;
    }

    requestShare(
      { documentId, requester: requesterAddress },
      {
        onSuccess: () => {
          toast.success('Share request sent successfully');
          setRequesterAddress('');
          refetchAll();
        },
        onError: (error) => {
          toast.error('Failed to request share', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      }
    );
  };
  */

  const getConsentBadge = (status: Consent) => {
    switch (status) {
      case Consent.GRANTED:
        return (
          <Badge variant="default" className="bg-green-600">
            <Check className="w-3 h-3 mr-1" />
            Granted
          </Badge>
        );
      case Consent.DENIED:
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      case Consent.REQUESTED:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Requested
          </Badge>
        );
      default:
        return <Badge variant="outline">None</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Document Sharing
          </CardTitle>
          <CardDescription>Manage document sharing permissions and access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Share Requests */}
          {shareRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Share Requests</h3>
              {shareRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Request from {request.requester.slice(0, 6)}...{request.requester.slice(-4)}
                      </p>
                      {request.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          Requested {format(new Date(Number(request.timestamp) * 1000), 'PPp')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {consentStatuses.get(request.requester)?.status &&
                      getConsentBadge(consentStatuses.get(request.requester)?.status as Consent)}
                    {isHolder && consentStatuses.get(request.requester)?.status === Consent.GRANTED && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeConsent(request.requester)}
                          disabled={isRevokingConsent}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Consents */}
          {consentStatuses.size > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Current Permissions</h3>
                {Array.from(consentStatuses.entries()).map(([requester, consent]) => (
                  <div key={requester} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {consent.status === Consent.GRANTED ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {requester.slice(0, 6)}...{requester.slice(-4)}
                        </p>
                        {consent.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            Updated {format(new Date(Number(consent.timestamp) * 1000), 'PPp')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getConsentBadge(consent.status as Consent)}
                      {isHolder && consent.status === Consent.GRANTED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeConsent(requester)}
                          disabled={isRevokingConsent}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Grant New Consent */}
          {isHolder && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Grant New Access</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="requester-address">Requester Address</Label>
                    <Input
                      id="requester-address"
                      placeholder="0x..."
                      value={requesterAddress}
                      onChange={(e) => setRequesterAddress(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleGiveConsent}
                    disabled={!requesterAddress || isGivingConsent}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {isGivingConsent ? 'Granting...' : 'Grant Access'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Info Alert */}
          <Alert>
            <Clock className="w-4 h-4" />
            <AlertDescription>
              Document sharing permissions are recorded on the blockchain and cannot be deleted, only revoked.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Document Access</DialogTitle>
            <DialogDescription>Grant or deny access to this document for a specific address</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="requester">Requester Address</Label>
              <Input
                id="requester"
                placeholder="0x..."
                value={requesterAddress}
                onChange={(e) => setRequesterAddress(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="consent-type">Consent Type</Label>
              <Select value={consentType} onValueChange={(v) => setConsentType(v as 'granted' | 'denied')}>
                <SelectTrigger id="consent-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="granted">Grant Access</SelectItem>
                  <SelectItem value="denied">Deny Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="validity">Valid For (days)</Label>
              <Input
                id="validity"
                type="number"
                min="1"
                max="365"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGiveConsent} disabled={isGivingConsent}>
              {isGivingConsent ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
