import { Search } from 'lucide-react';

interface DocumentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export function DocumentSearch({
  searchTerm,
  onSearchChange,
  placeholder = 'Search by document ID, holder, or issuer...',
}: DocumentSearchProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm p-4 border border-border">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
        <input
          type="search"
          className="block w-full p-2 pl-10 text-sm text-foreground bg-muted rounded-lg border border-input focus:ring-primary focus:border-primary"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
