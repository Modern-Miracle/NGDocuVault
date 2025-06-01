import { format } from 'date-fns';
import { Clock, FileText, Shield, Share2, Check, X, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocumentDetails } from '@/hooks/use-document-details';

interface EventIconProps {
  type: string;
  className?: string;
}

function EventIcon({ type, className = 'w-4 h-4' }: EventIconProps) {
  switch (type) {
    case 'DocumentRegistered':
      return <FileText className={className} />;
    case 'DocumentVerified':
      return <Shield className={className} />;
    case 'DocumentShared':
      return <Share2 className={className} />;
    case 'ConsentGranted':
      return <Check className={className} />;
    case 'ConsentRevoked':
      return <X className={className} />;
    case 'VerificationRequested':
      return <Shield className={className} />;
    case 'ShareRequested':
      return <UserPlus className={className} />;
    default:
      return <Clock className={className} />;
  }
}

interface DocumentEvent {
  type: string;
  args?: {
    issuer?: string;
    holder?: string;
    verifier?: string;
    requester?: string;
    timestamp?: bigint;
  };
  timestamp?: bigint;
  transactionHash?: string;
}

function getEventDescription(event: DocumentEvent): string {
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  switch (event.type) {
    case 'DocumentRegistered':
      return `Document registered by ${formatAddress(event.args?.issuer || '')} for holder ${formatAddress(event.args?.holder || '')}`;
    case 'DocumentVerified':
      return `Document verified by ${formatAddress(event.args?.verifier || '')}`;
    case 'DocumentShared':
      return `Document shared with ${formatAddress(event.args?.holder || '')}`;
    case 'ConsentGranted':
      return `Access granted to ${formatAddress(event.args?.requester || '')}`;
    case 'ConsentRevoked':
      return `Access revoked for ${formatAddress(event.args?.requester || '')}`;
    case 'VerificationRequested':
      return `Verification requested by ${formatAddress(event.args?.holder || '')}`;
    case 'ShareRequested':
      return `Access requested by ${formatAddress(event.args?.requester || '')}`;
    default:
      return 'Unknown event';
  }
}

function getEventBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'DocumentRegistered':
      return 'default';
    case 'DocumentVerified':
      return 'default';
    case 'ConsentGranted':
      return 'default';
    case 'ConsentRevoked':
      return 'destructive';
    case 'VerificationRequested':
    case 'ShareRequested':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function DocumentDetailsHistory() {
  const { events, isLoading } = useDocumentDetails();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>Loading document history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>All document events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document History</CardTitle>
        <CardDescription>All document events and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0">
              <div className="p-2 rounded-full bg-muted">
                <EventIcon type={event.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getEventBadgeVariant(event.type)}>
                    {event.type.replace(/([A-Z])/g, ' $1').trim()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(Number(event.timestamp) * 1000), 'PPp')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground break-words">
                  {getEventDescription(event as DocumentEvent)}
                </p>
                {event.transactionHash && (
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    Tx: {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
