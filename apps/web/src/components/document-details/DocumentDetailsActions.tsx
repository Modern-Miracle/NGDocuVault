import { useState } from 'react';
import { Download, Eye, Share2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDocumentDetails } from '@/hooks/use-document-details';
import { useRequestVerification, useVerifyDocument } from '@/hooks/use-docu-vault';
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

export function DocumentDetailsActions() {
  const { documentInfo, ipfsData, isHolder, isIssuer, documentId, refetchAll } = useDocumentDetails();
  const { mutate: verifyDocument, isPending: isVerifying } = useVerifyDocument();
  const { mutate: requestVerification, isPending: isRequesting } = useRequestVerification();
  const { toast } = useToast();
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);

  const handleDownload = () => {
    if (!ipfsData?.document?.content) {
      toast.error('Document content not available');
      return;
    }

    try {
      // Decode base64 content
      const base64Content = ipfsData.document.content.split(',')[1] || ipfsData.document.content;
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create blob and download
      const blob = new Blob([bytes], { type: ipfsData.document.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ipfsData.document.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleRequestVerification = () => {
    requestVerification(
      { documentId },
      {
        onSuccess: () => {
          toast.success('Verification request sent successfully');
          refetchAll();
        },
        onError: (error) => {
          toast.error('Failed to request verification', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      }
    );
  };

  const handleVerifyDocument = () => {
    verifyDocument(
      { documentId },
      {
        onSuccess: () => {
          toast.success('Document verified successfully');
          setShowVerifyDialog(false);
          refetchAll();
        },
        onError: (error) => {
          toast.error('Failed to verify document', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      }
    );
  };

  const handleViewDocument = () => {
    if (!ipfsData?.document?.content) {
      toast.error('Document content not available');
      return;
    }

    try {
      const base64Content = ipfsData.document.content.split(',')[1] || ipfsData.document.content;
      const binaryString = window.atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: ipfsData.document.contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Clean up after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('View error:', error);
      toast.error('Failed to view document');
    }
  };

  if (!documentInfo) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Available actions for this document</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Download/View Actions */}
          {ipfsData?.document && (
            <>
              <Button variant="outline" className="w-full justify-start" onClick={handleViewDocument}>
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download Document
              </Button>
            </>
          )}

          {/* Verification Actions */}
          {isHolder && !documentInfo.isVerified && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleRequestVerification}
              disabled={isRequesting}
            >
              <Shield className="w-4 h-4 mr-2" />
              {isRequesting ? 'Requesting...' : 'Request Verification'}
            </Button>
          )}

          {isIssuer && !documentInfo.isVerified && (
            <Button variant="default" className="w-full justify-start" onClick={() => setShowVerifyDialog(true)}>
              <Shield className="w-4 h-4 mr-2" />
              Verify Document
            </Button>
          )}

          {/* Share Action - Will be handled in DocumentDetailsSharing */}
          <Button variant="outline" className="w-full justify-start" disabled>
            <Share2 className="w-4 h-4 mr-2" />
            Share Document (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      {/* Verify Confirmation Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleVerifyDocument} disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Verify'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
