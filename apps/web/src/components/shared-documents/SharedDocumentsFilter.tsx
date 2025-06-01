import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSharedDocuments } from './SharedDocumentsProvider';

export const SharedDocumentsFilter: React.FC = () => {
  const { searchTerm, setSearchTerm, activeTab, setActiveTab } = useSharedDocuments();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Tab Selection */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'shared-with-me' | 'shared-by-me')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
              <TabsTrigger value="shared-by-me">Shared By Me</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              className="pl-10"
              placeholder="Search by document ID, holder, or issuer address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};