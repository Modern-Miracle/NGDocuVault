import { Calendar, User, Building, FileText, Hash, FileCheck, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDocumentDetails } from '@/hooks/use-document-details';
import { useClipboard } from '@/hooks/use-clipboard';
import { DocumentType } from '@/lib/actions/docu-vault/types';

export function DocumentDetailsInfo() {
  const { documentId, documentInfo, ipfsData, isLoading } = useDocumentDetails();
  const { copy } = useClipboard();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
          <CardDescription>Loading document details...</CardDescription>
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

  if (!documentInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
          <CardDescription>Failed to load document information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    return DocumentType[type] || 'Unknown';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Information</CardTitle>
        <CardDescription>Detailed information about this document</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>

          {ipfsData?.name && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs">Title</Label>
                <p className="text-sm">{ipfsData.name as string}</p>
              </div>
            </div>
          )}

          {ipfsData?.description && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs">Description</Label>
                <p className="text-sm">{ipfsData.description as string}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Hash className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Document Type</Label>
              <p className="text-sm">{getDocumentTypeLabel(documentInfo.documentType)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Status</Label>
              <div className="flex items-center gap-2 mt-1">
                {documentInfo.isExpired ? (
                  <Badge variant="destructive">Expired</Badge>
                ) : documentInfo.isVerified ? (
                  <Badge variant="default">Verified</Badge>
                ) : (
                  <Badge variant="secondary">Unverified</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Hash className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Document Hash</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{formatAddress(documentId)}</p>
                <Button variant="ghost" size="sm" onClick={() => copy(documentId)}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Timeline</h3>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Issuance Date</Label>
              <p className="text-sm">{formatDate(documentInfo.issuanceDate)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Expiration Date</Label>
              <p className="text-sm">{formatDate(documentInfo.expirationDate)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Participants */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Participants</h3>

          <div className="flex items-start gap-3">
            <Building className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Issuer</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{formatAddress(documentInfo.issuer)}</p>
                <Button variant="ghost" size="sm" onClick={() => copy(documentInfo.issuer)}>
                  Copy
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-1 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs">Holder</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono">{formatAddress(documentInfo.holder)}</p>
                <Button variant="ghost" size="sm" onClick={() => copy(documentInfo.holder)}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* File Information */}
        {ipfsData?.document && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground">File Information</h3>

              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-xs">File Name</Label>
                  <p className="text-sm">{ipfsData.document.fileName as string}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileCheck className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-xs">File Type</Label>
                  <p className="text-sm">{ipfsData.document.contentType as string}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <Label className="text-xs">File Size</Label>
                  <p className="text-sm">
                    {ipfsData.document.fileSize
                      ? `${((ipfsData.document.fileSize as number) / 1024).toFixed(2)} KB`
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
