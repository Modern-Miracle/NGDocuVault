import React from 'react';
import { FileSearch, Shield, Clock, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StatsCard } from './StatsCard';
import { QuickActions } from './QuickActions';

interface VerifierDashboardProps {
  stats: {
    documentsReviewed: number;
    shareRequests: number;
    verificationRequests: number;
  };
}

export const VerifierDashboard: React.FC<VerifierDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Documents Reviewed" value={stats.documentsReviewed} icon={FileSearch} iconColor="primary" />

        <StatsCard title="Access Requests" value={stats.shareRequests} icon={Shield} iconColor="chart-1" />

        <StatsCard title="Pending Reviews" value={stats.verificationRequests} icon={Clock} iconColor="chart-4" />

        <StatsCard
          title="Verification Tools"
          value=""
          icon={BarChart3}
          iconColor="chart-3"
          description={
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">Active</Badge>
            </div>
          }
        />
      </div>

      <QuickActions
        title="Verification Tools"
        columns={2}
        actions={[
          { to: '/verify-document', icon: FileSearch, label: 'Verify Document', variant: 'default' },
          { to: '/shared', icon: Shield, label: 'Shared Documents' },
        ]}
      />
    </div>
  );
};
