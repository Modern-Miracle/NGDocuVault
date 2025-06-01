import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DocumentStats } from './DocumentStats';
import { DocumentsFilter } from './DocumentsFilter';
import { DocumentList } from './DocumentList';

export const DocumentsContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and verify your documents on the blockchain
          </p>
        </div>
        <Button onClick={() => navigate('/register-document')}>
          <Plus className="mr-2 h-4 w-4" />
          Register Document
        </Button>
      </div>

      {/* Statistics */}
      <DocumentStats />

      {/* Filters */}
      <DocumentsFilter />

      {/* Document List */}
      <DocumentList />
    </div>
  );
};