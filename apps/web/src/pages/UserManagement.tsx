import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Users, Shield } from 'lucide-react';
import { useAuth, useIsAdmin } from '@/hooks';
import {
  UserFiltersSection,
  AddUserForm,
  UserStats,
  UserTable,
  UserManagementProvider,
  useUserManagement,
} from '@/components/user-management';

// Main content component that uses the context
const UserManagementContent: React.FC = () => {
  const { filteredUsers, users, isLoading, refetch } = useUserManagement();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{filteredUsers.length} users</span>
          </div>
        </div>
        <button
          type="button"
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <UserStats />

      {/* Add New User */}
      <AddUserForm />

      {/* Filters */}
      <UserFiltersSection />

      {/* User List */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <h2 className="font-semibold text-lg text-card-foreground">User List</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>

        <UserTable />
      </div>
    </div>
  );
};

// Main component that handles authentication and provides context
const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin(address as `0x${string}`);

  // Show loading state while checking admin status
  if (isAdminLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8">
          <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Permission Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need Admin privileges to access user management. Please contact an administrator for access.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render the user management interface with provider
  return (
    <UserManagementProvider>
      <UserManagementContent />
    </UserManagementProvider>
  );
};

export default UserManagement;