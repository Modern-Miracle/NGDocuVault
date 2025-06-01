import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import { DocumentType } from '@/lib/actions/docu-vault/types';

interface DocumentInfo {
  isVerified: boolean;
  contentHash?: `0x${string}`;
  documentId?: string;
  holder: `0x${string}`;
  issuer: `0x${string}`;
  documentType: bigint | number;
  issuanceTimestamp?: bigint;
  expirationTimestamp?: bigint;
}

interface RecentDocumentsProps {
  documents: DocumentInfo[];
  loading?: boolean;
  totalDocuments?: number;
  maxDisplay?: number;
}

const getDocumentTypeName = (type: bigint | number): string => {
  const typeNumber = typeof type === 'bigint' ? Number(type) : type;
  const types: Record<number, string> = {
    [DocumentType.IDENTITY]: 'Identity',
    [DocumentType.EDUCATION]: 'Educational',
    [DocumentType.FINANCIAL]: 'Financial',
    [DocumentType.MEDICAL]: 'Medical',
    [DocumentType.LEGAL]: 'Legal',
    [DocumentType.PROPERTY]: 'Property',
    [DocumentType.OTHER]: 'Other',
  };
  return types[typeNumber] || 'Unknown';
};

export const RecentDocuments: React.FC<RecentDocumentsProps> = ({
  documents,
  loading = false,
  totalDocuments = 0,
  maxDisplay = 5,
}) => {
  const recentDocs = [...documents]
    .sort((a, b) => {
      const aTime = Number(a.issuanceTimestamp || 0);
      const bTime = Number(b.issuanceTimestamp || 0);
      return bTime - aTime;
    })
    .slice(0, maxDisplay);

  return (
    <Card className="bg-card rounded-xl shadow-sm overflow-hidden border-border">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="font-semibold text-lg text-card-foreground">Recent Documents</h2>
      </div>

      {loading ? (
        <div className="p-6 text-center text-muted-foreground">Loading documents...</div>
      ) : recentDocs.length > 0 ? (
        <div className="divide-y divide-border">
          {recentDocs.map((doc) => (
            <Link
              key={String(doc.contentHash || doc.documentId || Math.random())}
              to={`/documents/${doc.contentHash || ''}`}
              className="px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">
                  Document ID: {String(doc.documentId || '').substring(0, 6)}...
                  {String(doc.contentHash || '').substring(String(doc.contentHash || '').length - 4)}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground mr-2">
                    {format(new Date(Number(doc.issuanceTimestamp || Date.now()) * 1000), 'MMM d, yyyy')}
                  </span>
                  <Badge variant={doc.isVerified ? 'default' : 'secondary'} className="text-xs">
                    {doc.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
              <div className="ml-2">
                <Badge variant="outline" className="text-xs">
                  {getDocumentTypeName(doc.documentType)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-muted-foreground">No documents available</div>
      )}

      {totalDocuments > maxDisplay && (
        <div className="px-6 py-3 bg-muted/25 border-t border-border text-right">
          <Link
            to="/documents"
            className="text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-end"
          >
            View all
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </Card>
  );
};
