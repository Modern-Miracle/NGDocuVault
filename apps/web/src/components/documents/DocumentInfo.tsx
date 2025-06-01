import { format } from 'date-fns';
import { User, Shield, FileText, Calendar, Clock, FileCheck } from 'lucide-react';
import { CardContent } from '@/components/ui/card';

interface DocumentInfoProps {
  holder: string;
  issuer: string;
  cid?: string;
  issuanceTimestamp: number;
  expirationTimestamp: number;
  isVerified: boolean;
  verifier?: string;
  verificationTimestamp?: number;
}

export function DocumentInfo({
  holder,
  issuer,
  cid,
  issuanceTimestamp,
  expirationTimestamp,
  isVerified,
  verifier,
  verificationTimestamp,
}: DocumentInfoProps) {
  return (
    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column - Basic Info */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Document Holder</h3>
          <div className="flex items-center bg-muted/50 p-3 rounded-lg">
            <User className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="font-mono text-card-foreground">{holder}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Issuer</h3>
          <div className="flex items-center bg-muted/50 p-3 rounded-lg">
            <Shield className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="font-mono text-card-foreground">{issuer}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Content ID (CID)</h3>
          <div className="flex items-center bg-muted/50 p-3 rounded-lg">
            <FileText className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="font-mono text-card-foreground">{cid || 'No CID available'}</span>
          </div>
        </div>
      </div>

      {/* Right Column - Dates and Status */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Issuance Date</h3>
          <div className="flex items-center bg-muted/50 p-3 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-card-foreground">{format(new Date(issuanceTimestamp * 1000), 'PPP')}</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Expiration Date</h3>
          <div className="flex items-center bg-muted/50 p-3 rounded-lg">
            <Clock className="h-5 w-5 text-muted-foreground mr-2" />
            <span className="text-card-foreground">
              {expirationTimestamp > 0 ? format(new Date(expirationTimestamp * 1000), 'PPP') : 'No expiration date'}
            </span>
          </div>
        </div>

        {isVerified && verifier && verificationTimestamp && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Verification</h3>
            <div className="flex items-center bg-muted/50 p-3 rounded-lg">
              <FileCheck className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-card-foreground">
                <div>Verified by: {verifier}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  on {format(new Date(verificationTimestamp * 1000), 'PPP')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  );
}
