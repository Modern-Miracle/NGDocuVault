import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Share2, FileCheck, FileWarning, ExternalLink, MoreHorizontal, User } from 'lucide-react';
import { DocumentType } from '@/lib/actions/docu-vault/types';

export interface SharedDocument {
  documentId: string;
  contentHash: string;
  cid?: string;
  holder: string;
  issuer: string;
  documentType: DocumentType;
  issuanceTimestamp: number;
  expirationTimestamp: number;
  isVerified: boolean;
  verifier?: string;
  verificationTimestamp?: number;
  consentExpiration?: number;
}

interface SharedDocumentsTableProps {
  documents: SharedDocument[];
  isLoading: boolean;
  searchTerm: string;
}

export function SharedDocumentsTable({ documents, isLoading, searchTerm }: SharedDocumentsTableProps) {
  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy');
  };

  const isAccessExpired = (expirationTime?: number): boolean => {
    if (!expirationTime) return true;
    return Date.now() > expirationTime * 1000;
  };

  const getDocumentTypeName = (type: DocumentType): string => {
    switch (type) {
      case DocumentType.IDENTITY:
        return 'Identity';
      case DocumentType.EDUCATION:
        return 'Educational';
      case DocumentType.FINANCIAL:
        return 'Financial';
      case DocumentType.MEDICAL:
        return 'Medical';
      case DocumentType.LEGAL:
        return 'Legal';
      case DocumentType.PROPERTY:
        return 'Property';
      default:
        return 'Other';
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.issuer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading shared documents...</p>
      </div>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <div className="p-8 text-center">
        <Share2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-1">No shared documents</h3>
        <p className="text-muted-foreground">
          {searchTerm ? 'No documents match your search' : 'No documents have been shared with you yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Document ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Issuer
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Type
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Issued
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Access
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {filteredDocuments.map((doc) => {
            const docExpired = doc.expirationTimestamp < Date.now() / 1000;
            const accessExpired = isAccessExpired(doc.consentExpiration);

            return (
              <tr key={doc.documentId} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-primary">
                    <Link to={`/documents/${doc.documentId}`}>{shortenAddress(doc.documentId)}</Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-muted-foreground mr-1.5" />
                    <span className="text-sm text-muted-foreground">{shortenAddress(doc.issuer)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {getDocumentTypeName(doc.documentType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{formatTimestamp(doc.issuanceTimestamp)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    {accessExpired ? (
                      <span className="text-destructive">Expired</span>
                    ) : (
                      <>
                        {doc.consentExpiration && (
                          <>Expires {format(new Date(doc.consentExpiration * 1000), 'MMM d, yyyy')}</>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {doc.isVerified ? (
                      <>
                        <FileCheck className="w-4 h-4 text-chart-3 mr-1.5" />
                        <span className="text-sm text-chart-3">Verified</span>
                      </>
                    ) : (
                      <>
                        <FileWarning className="w-4 h-4 text-chart-4 mr-1.5" />
                        <span className="text-sm text-chart-4">Unverified</span>
                      </>
                    )}
                    {docExpired && <span className="ml-2 text-xs font-medium text-destructive">(Expired)</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                  {doc.cid && (
                    <a
                      href={
                        doc.cid.startsWith('ipfs://')
                          ? `https://ipfs.io/ipfs/${doc.cid.replace('ipfs://', '')}`
                          : doc.cid
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                      title="View on IPFS"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  <Link to={`/documents/${doc.documentId}`} className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
