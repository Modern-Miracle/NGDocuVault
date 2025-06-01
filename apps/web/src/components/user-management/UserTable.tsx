import React from 'react';
import { format } from 'date-fns';
import {
  Clock,
  Copy,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Users,
  RefreshCw,
} from 'lucide-react';
import { CONFIRMED_ROLE_NAMES } from '@/utils/roles';
import { useUserManagement } from './UserManagementProvider';

const shortenDid = (did: string) => {
  if (!did || did.length <= 30) return did;
  if (did.startsWith('did:docuvault:')) {
    const address = did.replace('did:docuvault:', '');
    return `did:docuvault:${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  return `${did.substring(0, 10)}...${did.substring(did.length - 10)}`;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN_ROLE: 'bg-red-100 text-red-800 border-red-200',
    ISSUER_ROLE: 'bg-blue-100 text-blue-800 border-blue-200',
    VERIFIER_ROLE: 'bg-green-100 text-green-800 border-green-200',
    OPERATOR_ROLE: 'bg-purple-100 text-purple-800 border-purple-200',
    PRODUCER_ROLE: 'bg-orange-100 text-orange-800 border-orange-200',
    CONSUMER_ROLE: 'bg-teal-100 text-teal-800 border-teal-200',
    PROVIDER_ROLE: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    HOLDER_ROLE: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const formatTimestamp = (date: Date) => {
  return format(date, 'MMM d, yyyy h:mm a');
};

export const UserTable: React.FC = () => {
  const { 
    filteredUsers, 
    isLoading, 
    grantRole, 
    revokeRole, 
    copyToClipboard, 
    isGrantingRole, 
    isRevokingRole 
  } = useUserManagement();
  
  const roleOptions = CONFIRMED_ROLE_NAMES.map((role) => role);

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              DID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Roles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last Activity
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {filteredUsers.map((user) => (
            <tr key={user.did} className="hover:bg-muted/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-mono font-medium text-card-foreground">{shortenDid(user.did)}</div>
                  <button
                    onClick={() => copyToClipboard(user.did)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy DID"
                    type="button"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role}
                        className={`text-xs px-2.5 py-1 rounded-full border ${getRoleColor(role)}`}
                      >
                        {role.replace('_ROLE', '').replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No roles</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    user.active && user.roles.length > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.active && user.roles.length > 0 ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{user.lastActivity ? formatTimestamp(user.lastActivity) : 'No activity'}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end space-x-2">
                  <div className="relative group">
                    <button
                      type="button"
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      title="Role Management Options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>

                    <div className="absolute right-0 z-10 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-2 space-y-1">
                        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Role Management</div>
                        {roleOptions.map((role) => (
                          <div
                            key={role}
                            className="flex items-center justify-between p-2 hover:bg-accent rounded"
                          >
                            <span className="text-sm">{role.replace('_ROLE', '').replace('_', ' ')}</span>
                            {user.roles.includes(role) ? (
                              <button
                                type="button"
                                onClick={() => revokeRole(user.did, role)}
                                disabled={isRevokingRole}
                                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                title="Revoke Role"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => grantRole(user.did, role)}
                                disabled={isGrantingRole}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                title="Grant Role"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredUsers.length === 0 && !isLoading && (
        <div className="p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-1">No users found</h3>
          <p className="text-muted-foreground">No users match your current filters</p>
        </div>
      )}
    </div>
  );
};