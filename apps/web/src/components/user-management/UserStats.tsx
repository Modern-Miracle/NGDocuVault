import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Activity, Shield } from 'lucide-react';
import { useUserManagement } from './UserManagementProvider';

export const UserStats: React.FC = () => {
  const { stats } = useUserManagement();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-card-foreground">{stats.totalUsers}</p>
          </div>
          <Users className="h-8 w-8 text-primary" />
        </div>
      </Card>

      <Card className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold text-card-foreground">{stats.activeUsers}</p>
          </div>
          <Activity className="h-8 w-8 text-green-500" />
        </div>
      </Card>

      <Card className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
            <p className="text-2xl font-bold text-card-foreground">{stats.totalRoles}</p>
          </div>
          <Shield className="h-8 w-8 text-blue-500" />
        </div>
      </Card>
    </div>
  );
};