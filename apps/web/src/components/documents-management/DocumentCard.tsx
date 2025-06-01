import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Shield, Copy, CheckCheck, Loader2 } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard';
import { cn } from '@/lib/utils';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import type { DocumentInfo } from '@/hooks/use-documents-data';

interface DocumentCardProps {
  document: DocumentInfo;
  onView?: (documentId: string) => void;
  onRequestVerification?: (documentId: string) => void;
  isRequestingVerification?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onRequestVerification,
  isRequestingVerification = false,
}) => {
  const { copied, copy } = useClipboard();

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    copy(document.documentId);
  };

  const getDocumentTypeString = (type: DocumentType): string => {
    const typeMap: Record<DocumentType, string> = {
      [DocumentType.IDENTITY]: 'Identity',
      [DocumentType.MEDICAL]: 'Medical',
      [DocumentType.FINANCIAL]: 'Financial',
      [DocumentType.EDUCATION]: 'Education',
      [DocumentType.LEGAL]: 'Legal',
      [DocumentType.PROPERTY]: 'Property',
      [DocumentType.OTHER]: 'Other',
    };
    return typeMap[type] || 'Unknown';
  };

  const getDocumentTypeIcon = (type: DocumentType): string => {
    const iconMap: Record<DocumentType, string> = {
      [DocumentType.IDENTITY]: '🆔',
      [DocumentType.MEDICAL]: '🏥',
      [DocumentType.FINANCIAL]: '💰',
      [DocumentType.EDUCATION]: '🎓',
      [DocumentType.LEGAL]: '⚖️',
      [DocumentType.PROPERTY]: '🏠',
      [DocumentType.OTHER]: '📎',
    };
    return iconMap[type] || '📄';
  };

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getDocumentTypeIcon(document.documentType)}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-foreground">
                {getDocumentTypeString(document.documentType)} Document
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-muted-foreground">
                  {document.documentId.slice(0, 8)}...{document.documentId.slice(-6)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                  onClick={handleCopyId}
                >
                  {copied ? <CheckCheck className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
          <Badge
            variant={document.isVerified ? 'default' : document.isExpired ? 'destructive' : 'secondary'}
            className={cn(
              'capitalize font-medium',
              document.isVerified && 'bg-green-100 text-green-800 border-green-200',
              !document.isVerified && !document.isExpired && 'bg-yellow-100 text-yellow-800 border-yellow-200',
              document.isExpired && 'bg-red-100 text-red-800 border-red-200'
            )}
          >
            {document.isExpired ? 'Expired' : document.isVerified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div>
              <p className="text-muted-foreground font-medium">Issued</p>
              <p className="text-foreground">
                {format(new Date(Number(document.issuanceTimestamp) * 1000), 'MMM dd, yyyy')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Holder</p>
              <p className="font-mono text-xs text-foreground">
                {document.holder.slice(0, 6)}...{document.holder.slice(-4)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-muted-foreground font-medium">Expires</p>
              <p className="text-foreground">
                {document.expirationTimestamp && Number(document.expirationTimestamp) > 0
                  ? format(new Date(Number(document.expirationTimestamp) * 1000), 'MMM dd, yyyy')
                  : 'No expiration'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">Status</p>
              <p
                className={cn(
                  'text-sm font-medium',
                  document.isVerified && 'text-green-600',
                  !document.isVerified && !document.isExpired && 'text-yellow-600',
                  document.isExpired && 'text-red-600'
                )}
              >
                {document.isExpired
                  ? 'Document Expired'
                  : document.isVerified
                    ? 'Fully Verified'
                    : 'Awaiting Verification'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView?.(document.documentId)}
            className="flex-1 group-hover:border-primary/30 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>

          {!document.isVerified && !document.isExpired && onRequestVerification && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onRequestVerification(document.documentId)}
              disabled={isRequestingVerification}
              className="flex-1"
            >
              {isRequestingVerification ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {isRequestingVerification ? 'Requesting...' : 'Request Verification'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
