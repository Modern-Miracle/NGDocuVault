import React from 'react';
import { FileCheck, Clock, FileWarning, FilePlus, FileText, Shield } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard } from './StatsCard';
import { QuickActions } from './QuickActions';

interface HolderDashboardProps {
  stats: {
    totalDocuments: number;
    verifiedDocuments: number;
    pendingVerification: number;
    expiringDocuments: number;
  };
}

export const HolderDashboard: React.FC<HolderDashboardProps> = ({ stats }) => {
  const verificationPercentage = Math.round((stats.verifiedDocuments / (stats.totalDocuments || 1)) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Documents"
          value={stats.totalDocuments}
          icon={FileCheck}
          iconColor="primary"
          action={
            <Link to="/documents" className="text-sm text-primary hover:text-primary/80 flex items-center">
              View all documents
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          }
        />

        <StatsCard
          title="Verified Documents"
          value={stats.verifiedDocuments}
          icon={FileCheck}
          iconColor="chart-3"
          description={`${verificationPercentage}% of total`}
        />

        <StatsCard
          title="Pending Verification"
          value={stats.pendingVerification}
          icon={Clock}
          iconColor="chart-4"
          action={
            <Link to="/verify" className="text-sm text-chart-4 hover:text-chart-4/80 flex items-center">
              Request verification
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          }
        />

        <StatsCard
          title="Expiring Soon"
          value={stats.expiringDocuments}
          icon={FileWarning}
          iconColor="destructive"
          description="Within next 30 days"
        />
      </div>

      <QuickActions
        title="Quick Actions"
        actions={[
          { to: '/register-document', icon: FilePlus, label: 'Register Document', variant: 'default' },
          { to: '/documents', icon: FileText, label: 'My Documents' },
          { to: '/shared', icon: Shield, label: 'Shared Access' },
        ]}
      />
    </div>
  );
};
