import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { Log } from 'viem';

interface EventLog extends Log {
  args?: {
    documentId?: string;
    issuer?: string;
    holder?: string;
    verifier?: string;
    requester?: string;
    timestamp?: bigint;
    status?: number;
    [key: string]: unknown;
  };
}

interface RecentActivityProps {
  events: EventLog[];
  maxDisplay?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ events, maxDisplay = 5 }) => {
  return (
    <Card className="bg-card rounded-xl shadow-sm overflow-hidden border-border">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="font-semibold text-lg text-card-foreground">Recent System Activity</h2>
      </div>
      <div className="divide-y divide-border max-h-64 overflow-y-auto">
        {events.slice(0, maxDisplay).map((event, index) => (
          <div key={index} className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Document Registered</p>
                <p className="text-xs text-muted-foreground">
                  by {event.args?.issuer?.slice(0, 6)}...{event.args?.issuer?.slice(-4)}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {format(new Date(Number(event.args?.timestamp || 0) * 1000), 'MMM d, h:mm a')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};