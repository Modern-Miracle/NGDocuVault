import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Shield, ShieldOff, Share2, FileText, AlertCircle, Loader2, Clock } from 'lucide-react';
import { useSharedDocuments } from './SharedDocumentsProvider';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DocumentType, Consent } from '@/lib/actions/docu-vault/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export const SharedDocumentsList: React.FC = () => {
  const {
    filteredSharedWithMe,
    filteredSharedByMe,
    activeTab,
    isLoading,
    error,
    viewDocument,
    shareDocument,
    revokeConsent,
    processingDocumentId,
  } = useSharedDocuments();

  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; documentId: string; requester: string }>({
    open: false,
    documentId: '',
    requester: '',
  });

  const documents = activeTab === 'shared-with-me' ? filteredSharedWithMe : filteredSharedByMe;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div className="text-muted-foreground">Loading shared documents...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48 gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading documents: {error.message}</span>
        </div>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <Share2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            {activeTab === 'shared-with-me' 
              ? 'No documents have been shared with you' 
              : 'You haven\'t shared any documents yet'}
          </p>
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

  const getConsentStatusBadge = (status: Consent, validUntil: bigint) => {
    const isExpired = Number(validUntil) * 1000 < Date.now();
    
    if (status === Consent.GRANTED && !isExpired) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <Shield className="mr-1 h-3 w-3" />
          Granted
        </Badge>
      );
    } else if (status === Consent.GRANTED && isExpired) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Expired
        </Badge>
      );
    } else if (status === Consent.REJECTED) {
      return (
        <Badge variant="destructive">
          <ShieldOff className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    }
  };

  const handleRevokeConsent = async () => {
    if (revokeDialog.documentId && revokeDialog.requester) {
      await revokeConsent(revokeDialog.documentId, revokeDialog.requester);
      setRevokeDialog({ open: false, documentId: '', requester: '' });
    }
  };

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>{activeTab === 'shared-with-me' ? 'Owner' : 'Shared With'}</TableHead>
              <TableHead>Consent Status</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.documentId} className="group">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getDocumentTypeIcon(doc.documentType)}</span>
                    <div>
                      <p className="font-medium font-mono text-sm">
                        {doc.documentId.slice(0, 8)}...{doc.documentId.slice(-6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Issued: {format(new Date(Number(doc.issuanceTimestamp) * 1000), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {getDocumentTypeString(doc.documentType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">
                    {activeTab === 'shared-with-me' 
                      ? `${doc.holder.slice(0, 6)}...${doc.holder.slice(-4)}`
                      : `${doc.sharedWith.slice(0, 6)}...${doc.sharedWith.slice(-4)}`
                    }
                  </span>
                </TableCell>
                <TableCell>
                  {getConsentStatusBadge(doc.consentStatus, doc.consentValidUntil)}
                </TableCell>
                <TableCell>
                  {doc.consentValidUntil && Number(doc.consentValidUntil) > 0 
                    ? format(new Date(Number(doc.consentValidUntil) * 1000), 'MMM dd, yyyy')
                    : 'No expiration'
                  }
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={doc.isVerified ? "default" : "secondary"}
                    className={cn(
                      "capitalize",
                      doc.isVerified && "bg-green-100 text-green-800 border-green-200",
                      !doc.isVerified && "bg-yellow-100 text-yellow-800 border-yellow-200",
                      doc.isExpired && "bg-red-100 text-red-800 border-red-200"
                    )}
                  >
                    {doc.isExpired ? 'Expired' : doc.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewDocument(doc.documentId)}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {activeTab === 'shared-with-me' && doc.consentStatus === Consent.GRANTED && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => shareDocument(doc.documentId, doc.holder)}
                        disabled={processingDocumentId === doc.documentId}
                        title="Access shared document"
                      >
                        {processingDocumentId === doc.documentId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {activeTab === 'shared-by-me' && doc.consentStatus === Consent.GRANTED && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRevokeDialog({ 
                          open: true, 
                          documentId: doc.documentId, 
                          requester: doc.sharedWith 
                        })}
                        disabled={processingDocumentId === doc.documentId}
                        title="Revoke access"
                      >
                        {processingDocumentId === doc.documentId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldOff className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ ...revokeDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Document Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke access to this document? The user will no longer be able to view or access this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeConsent} className="bg-destructive text-destructive-foreground">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};