import { FileCheck, FileWarning } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardHeader } from '@/components/ui/card';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { VerifyDocumentButton } from './VerifyDocumentButton';
import { RequestVerificationButton } from './RequestVerificationButton';

interface DocumentHeaderProps {
  documentId: string;
  isVerified: boolean;
  documentType: DocumentType;
  expirationTimestamp: number;
  isHolder: boolean;
  isVerifier: boolean;
  onSuccess?: () => void;
}

export function DocumentHeader({
  documentId,
  isVerified,
  documentType,
  expirationTimestamp,
  isHolder,
  isVerifier,
  onSuccess,
}: DocumentHeaderProps) {
  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getDocumentTypeName = (type: DocumentType) => {
    switch (type) {
      case DocumentType.IDENTITY:
        return 'Identity';
      case DocumentType.MEDICAL:
        return 'Medical';
      case DocumentType.FINANCIAL:
        return 'Financial';
      case DocumentType.EDUCATION:
        return 'Education';
      case DocumentType.LEGAL:
        return 'Legal';
      case DocumentType.PROPERTY:
        return 'Property';
      default:
        return 'Other';
    }
  };

  return (
    <CardHeader className="p-6 border-b border-border flex flex-row justify-between items-center">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {isVerified ? (
            <div className="bg-green-500/20 p-3 rounded-full">
              <FileCheck className="h-6 w-6 text-green-500" />
            </div>
          ) : (
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <FileWarning className="h-6 w-6 text-yellow-500" />
            </div>
          )}
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-semibold text-card-foreground">Document ID: {shortenAddress(documentId)}</h2>
          <div className="flex items-center mt-1">
            <Badge variant={isVerified ? 'default' : 'secondary'} className={isVerified ? 'bg-green-500' : ''}>
              {isVerified ? 'Verified' : 'Unverified'}
            </Badge>
            <Badge variant="outline" className="ml-2 font-medium text-muted-foreground bg-muted">
              {getDocumentTypeName(documentType)}
            </Badge>
            {expirationTimestamp > 0 && expirationTimestamp * 1000 < Date.now() && (
              <Badge variant="destructive" className="ml-2">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {isHolder && !isVerified && <RequestVerificationButton documentId={documentId} onSuccess={onSuccess} />}
        {isVerifier && !isVerified && <VerifyDocumentButton documentId={documentId} onSuccess={onSuccess} />}
      </div>
    </CardHeader>
  );
}
