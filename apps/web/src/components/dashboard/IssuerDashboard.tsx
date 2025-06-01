import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, CheckCircle, FileSearch, TrendingUp, FilePlus, ShieldCheck } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { QuickActions } from './QuickActions';

interface IssuerDashboardProps {
  isIssuerActive?: boolean;
  stats: {
    documentsIssued: number;
    documentsVerified: number;
    verificationRequests: number;
  };
}

export const IssuerDashboard: React.FC<IssuerDashboardProps> = ({ isIssuerActive, stats }) => {
  const successRate =
    stats.documentsIssued > 0 ? Math.round((stats.documentsVerified / stats.documentsIssued) * 100) : 0;

  return (
    <div className="space-y-6">
      {!isIssuerActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your issuer status is inactive. Contact an admin to activate your account.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Documents Issued" value={stats.documentsIssued} icon={FileText} iconColor="primary" />

        <StatsCard title="Verified Documents" value={stats.documentsVerified} icon={CheckCircle} iconColor="chart-3" />

        <StatsCard
          title="Verification Requests"
          value={stats.verificationRequests}
          icon={FileSearch}
          iconColor="chart-4"
        />

        <StatsCard title="Success Rate" value={`${successRate}%`} icon={TrendingUp} iconColor="chart-2" />
      </div>

      <QuickActions
        title="Document Operations"
        columns={2}
        actions={[
          { to: '/register-document', icon: FilePlus, label: 'Issue New Document', variant: 'default' },
          { to: '/verify-document', icon: ShieldCheck, label: 'Verify Documents' },
        ]}
      />
    </div>
  );
};
