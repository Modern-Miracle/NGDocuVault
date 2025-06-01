import { FileText, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDocumentDetails } from '@/hooks/use-document-details';
import { DocumentType } from '@/lib/actions/docu-vault/types';

export function DocumentDetailsHeader() {
  const { documentId, documentInfo, ipfsData, isLoading, isHolder, isIssuer } = useDocumentDetails();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading document details...</div>
        </CardContent>
      </Card>
    );
  }

  if (!documentInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Document not found</div>
        </CardContent>
      </Card>
    );
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    return DocumentType[type] || 'Unknown';
  };

  const getStatusBadge = () => {
    if (!documentInfo) return null;

    if (documentInfo.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (documentInfo.isVerified) {
      return <Badge variant="default">Verified</Badge>;
    } else {
      return <Badge variant="secondary">Unverified</Badge>;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{(ipfsData?.name as string) || 'Document Details'}</h1>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {isHolder && <Badge variant="outline">Holder</Badge>}
            {isIssuer && <Badge variant="outline">Issuer</Badge>}
          </div>

          {documentInfo && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{getDocumentTypeLabel(documentInfo.documentType)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="font-medium">{new Date(documentInfo.issuanceDate * 1000).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {new Date(documentInfo.expirationDate * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-1">Document ID</div>
                <div className="font-mono text-sm break-all">{documentId}</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
