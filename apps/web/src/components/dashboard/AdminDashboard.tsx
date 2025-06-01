import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users, ShieldCheck, Activity, Clock, UserPlus, FilePlus } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatsCard } from './StatsCard';
import { QuickActions } from './QuickActions';

interface AdminDashboardProps {
  isPaused?: boolean;
  stats: {
    totalUsers: number;
    totalIssuers: number;
    recentActivity: number;
    pendingRequests: number;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isPaused, stats }) => {
  return (
    <div className="space-y-6">
      {isPaused && (
        <Alert className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>System is currently paused. Only admins can perform operations.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          iconColor="primary"
          action={
            <Link to="/users-management" className="text-sm text-primary hover:text-primary/80 flex items-center">
              Manage users
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          }
        />

        <StatsCard
          title="Active Issuers"
          value={stats.totalIssuers}
          icon={ShieldCheck}
          iconColor="chart-1"
          description="Authorized to issue documents"
        />

        <StatsCard
          title="Recent Activity"
          value={stats.recentActivity}
          icon={Activity}
          iconColor="chart-2"
          description="Last 24 hours"
        />

        <StatsCard
          title="Pending Requests"
          value={stats.pendingRequests}
          icon={Clock}
          iconColor="chart-4"
          description="Awaiting approval"
        />
      </div>

      <QuickActions
        title="Quick Actions"
        actions={[
          { to: '/users-management', icon: UserPlus, label: 'Manage Users' },
          { to: '/register-document', icon: FilePlus, label: 'Register Document' },
          { to: '/verify-document', icon: ShieldCheck, label: 'Verify Documents' },
        ]}
      />
    </div>
  );
};
