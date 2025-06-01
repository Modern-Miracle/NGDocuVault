import {
  DocumentDetailsProvider,
  DocumentDetailsHeader,
  DocumentDetailsInfo,
  DocumentDetailsActions,
  DocumentDetailsSharing,
  DocumentDetailsHistory,
} from '@/components/document-details';

export default function DocumentDetails() {
  return (
    <DocumentDetailsProvider>
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <DocumentDetailsHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <DocumentDetailsInfo />
            <DocumentDetailsHistory />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DocumentDetailsActions />
            <DocumentDetailsSharing />
          </div>
        </div>
      </div>
    </DocumentDetailsProvider>
  );
}