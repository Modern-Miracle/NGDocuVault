import { DocumentInfo } from '@/hooks/use-docu-vault';
import { DocumentCard } from './DocumentCard';
import { Skeleton } from '@/components/ui/skeleton';

type DocumentListProps = {
  documents?: DocumentInfo[];
  isLoading: boolean;
  onView?: (documentId: string) => void;
  onVerify?: (documentId: string) => void;
  onRequestVerification?: (documentId: string) => void;
  emptyMessage?: string;
};

export function DocumentList({
  documents = [],
  isLoading,
  onView,
  onVerify,
  onRequestVerification,
  emptyMessage = 'No documents found',
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 w-full border border-dashed rounded-lg">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.documentId}
          document={document}
          onView={onView}
          onVerify={onVerify}
          onRequestVerification={onRequestVerification}
        />
      ))}
    </div>
  );
}
