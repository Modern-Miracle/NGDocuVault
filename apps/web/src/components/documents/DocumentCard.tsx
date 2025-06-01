import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentInfo } from '@/hooks/use-docu-vault';
import { useClipboard } from '@/hooks/use-clipboard';
import { CheckCheck, Copy } from 'lucide-react';

type DocumentCardProps = {
  document: DocumentInfo;
  onView?: (documentId: string) => void;
  onVerify?: (documentId: string) => void;
  onRequestVerification?: (documentId: string) => void;
  showActions?: boolean;
};

const getDocumentTypeName = (type: bigint) => {
  const typeNum = Number(type);
  switch (typeNum) {
    case 0:
      return 'Identity';
    case 1:
      return 'Medical';
    case 2:
      return 'Financial';
    case 3:
      return 'Education';
    case 4:
      return 'Legal';
    case 5:
      return 'Property';
    default:
      return 'Other';
  }
};

export function DocumentCard({
  document,
  onView,
  onVerify,
  onRequestVerification,
  showActions = true,
}: DocumentCardProps) {
  const { copied, copy } = useClipboard();

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(document.documentId);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold truncate">{getDocumentTypeName(document.documentType)} Document</h3>
            <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis">
              ID: {document.documentId.slice(0, 10)}...
              <Button variant="ghost" size="sm" className="h-6 p-0 ml-1" onClick={handleCopyId}>
                {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </p>
          </div>
          <Badge
            variant={document.isVerified ? 'default' : 'secondary'}
            className={document.isVerified ? 'bg-green-500' : ''}
          >
            {document.isVerified ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm">
          <div className="grid grid-cols-2 gap-1">
            <p className="text-muted-foreground">Issued:</p>
            <p>{format(new Date(Number(document.issuanceTimestamp) * 1000), 'MMM dd, yyyy')}</p>
            <p className="text-muted-foreground">Expires:</p>
            <p>{format(new Date(Number(document.expirationTimestamp) * 1000), 'MMM dd, yyyy')}</p>
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="pt-2">
          <div className="flex justify-between w-full gap-2">
            {onView && (
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(document.documentId)}>
                View
              </Button>
            )}
            {!document.isVerified && onRequestVerification && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => onRequestVerification(document.documentId)}
              >
                Request Verification
              </Button>
            )}
            {!document.isVerified && onVerify && (
              <Button variant="default" size="sm" className="flex-1" onClick={() => onVerify(document.documentId)}>
                Verify
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
