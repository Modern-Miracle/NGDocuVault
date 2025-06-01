import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Shield, FileText, AlertCircle, Loader2, LayoutGrid, List, Copy, CheckCheck } from 'lucide-react';
import { useDocuments } from './DocumentsProvider';
import { DocumentCard } from './DocumentCard';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { useClipboard } from '@/hooks/use-clipboard';
import type { DocumentInfo } from '@/hooks/use-documents-data';

type ViewMode = 'list' | 'card';

export const DocumentList: React.FC = () => {
  const { filteredDocuments, isLoading, error, viewDocument, requestVerification, verifyingDocumentId } =
    useDocuments();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="text-muted-foreground font-medium">Loading documents...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center h-48 gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error loading documents: {error.message}</span>
        </div>
      </Card>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <FileText className="h-16 w-16 text-muted-foreground/30" />
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">No documents found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Documents will appear here once they are registered</p>
          </div>
        </div>
      </Card>
    );
  }

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

  const ViewToggle = () => (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="h-8 px-3"
      >
        <List className="h-4 w-4 mr-1" />
        List
      </Button>
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('card')}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4 mr-1" />
        Cards
      </Button>
    </div>
  );

  const TableRowComponent = ({ doc }: { doc: DocumentInfo }) => {
    const { copied, copy } = useClipboard();

    const handleCopyId = (e: React.MouseEvent) => {
      e.stopPropagation();
      copy(doc.documentId);
    };

    return (
      <TableRow key={doc.documentId} className="group hover:bg-muted/30 transition-colors">
        <TableCell>
          <div className="flex items-center gap-3">
            <span className="text-xl">{getDocumentTypeIcon(doc.documentType)}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium font-mono text-sm">
                  {doc.documentId.slice(0, 8)}...{doc.documentId.slice(-6)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
                  onClick={handleCopyId}
                >
                  {copied ? <CheckCheck className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize font-medium">
            {getDocumentTypeString(doc.documentType)}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            variant={doc.isVerified ? 'default' : doc.isExpired ? 'destructive' : 'secondary'}
            className={cn(
              'capitalize font-medium',
              doc.isVerified && 'bg-green-100 text-green-800 border-green-200',
              !doc.isVerified && !doc.isExpired && 'bg-yellow-100 text-yellow-800 border-yellow-200',
              doc.isExpired && 'bg-red-100 text-red-800 border-red-200'
            )}
          >
            {doc.isExpired ? 'Expired' : doc.isVerified ? 'Verified' : 'Pending'}
          </Badge>
        </TableCell>
        <TableCell className="font-medium">
          {format(new Date(Number(doc.issuanceTimestamp) * 1000), 'MMM dd, yyyy')}
        </TableCell>
        <TableCell className="font-medium">
          {doc.expirationTimestamp && Number(doc.expirationTimestamp) > 0
            ? format(new Date(Number(doc.expirationTimestamp) * 1000), 'MMM dd, yyyy')
            : 'No expiration'}
        </TableCell>
        <TableCell>
          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
            {doc.holder.slice(0, 6)}...{doc.holder.slice(-4)}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => viewDocument(doc.documentId)}
              title="View document"
              className="h-8 w-8 text-primary hover:bg-primary/10 rounded hover:text-primary"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {!doc.isVerified && !doc.isExpired && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => requestVerification(doc.documentId)}
                disabled={verifyingDocumentId === doc.documentId}
                title="Request verification"
                className="h-8 w-8 hover:bg-primary/10"
              >
                {verifyingDocumentId === doc.documentId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'} found
          </p>
        </div>
        <ViewToggle />
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        <Card className="border-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-2">
                <TableHead className="font-semibold text-foreground">Document ID</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Issuance Date</TableHead>
                <TableHead className="font-semibold text-foreground">Expiration Date</TableHead>
                <TableHead className="font-semibold text-foreground">Holder</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRowComponent key={doc.documentId} doc={doc} />
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.documentId}
              document={doc}
              onView={viewDocument}
              onRequestVerification={requestVerification}
              isRequestingVerification={verifyingDocumentId === doc.documentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
