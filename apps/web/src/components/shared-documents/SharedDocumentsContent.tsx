import React from 'react';
import { Share2 } from 'lucide-react';
import { SharedDocumentsStats } from './SharedDocumentsStats';
import { SharedDocumentsFilter } from './SharedDocumentsFilter';
import { SharedDocumentsList } from './SharedDocumentsList';

export const SharedDocumentsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Share2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shared Documents</h1>
          <p className="text-muted-foreground">
            Manage documents that have been shared with you or by you
          </p>
        </div>
      </div>

      {/* Statistics */}
      <SharedDocumentsStats />

      {/* Filters */}
      <SharedDocumentsFilter />

      {/* Document List */}
      <SharedDocumentsList />
    </div>
  );
};