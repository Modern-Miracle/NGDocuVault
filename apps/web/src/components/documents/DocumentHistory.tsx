import { format } from 'date-fns';
import { Calendar, FileCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DocumentHistoryProps {
  issuanceTimestamp: number;
  isVerified: boolean;
  verificationTimestamp?: number;
}

export function DocumentHistory({ issuanceTimestamp, isVerified, verificationTimestamp }: DocumentHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div className="ml-4">
          <p className="font-medium">Document Registered</p>
          <p className="text-sm text-muted-foreground">{format(new Date(issuanceTimestamp * 1000), 'PPP pp')}</p>
        </div>
      </div>
      <Separator />
      {isVerified && verificationTimestamp && (
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <FileCheck className="w-6 h-6 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="font-medium">Document Verified</p>
            <p className="text-sm text-muted-foreground">{format(new Date(verificationTimestamp * 1000), 'PPP pp')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
