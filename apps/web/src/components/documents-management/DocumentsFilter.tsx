import React from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { useDocuments } from './DocumentsProvider';

export const DocumentsFilter: React.FC = () => {
  const { searchTerm, setSearchTerm, filters, setFilters } = useDocuments();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <Input
              type="search"
              className="pl-10"
              placeholder="Search by document ID, holder, or issuer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.verified === null ? 'all' : filters.verified ? 'verified' : 'unverified'}
              onValueChange={(value) => {
                setFilters({
                  ...filters,
                  verified: value === 'all' ? null : value === 'verified',
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.documentType === null ? 'all' : String(filters.documentType)}
              onValueChange={(value) => {
                setFilters({
                  ...filters,
                  documentType: value === 'all' ? null : (Number(value) as DocumentType),
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={String(DocumentType.IDENTITY)}>Identity</SelectItem>
                <SelectItem value={String(DocumentType.EDUCATION)}>Educational</SelectItem>
                <SelectItem value={String(DocumentType.FINANCIAL)}>Financial</SelectItem>
                <SelectItem value={String(DocumentType.MEDICAL)}>Medical</SelectItem>
                <SelectItem value={String(DocumentType.LEGAL)}>Legal</SelectItem>
                <SelectItem value={String(DocumentType.PROPERTY)}>Property</SelectItem>
                <SelectItem value={String(DocumentType.OTHER)}>Other</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy}-${filters.sortDirection}`}
              onValueChange={(value) => {
                const [sortBy, sortDirection] = value.split('-') as [
                  'issuanceTimestamp' | 'expirationTimestamp',
                  'asc' | 'desc'
                ];
                setFilters({
                  ...filters,
                  sortBy,
                  sortDirection,
                });
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issuanceTimestamp-desc">Newest First</SelectItem>
                <SelectItem value="issuanceTimestamp-asc">Oldest First</SelectItem>
                <SelectItem value="expirationTimestamp-desc">Expiring Last</SelectItem>
                <SelectItem value="expirationTimestamp-asc">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};