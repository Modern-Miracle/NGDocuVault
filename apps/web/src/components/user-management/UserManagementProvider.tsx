import React, { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGrantDidRole, useRevokeDidRole } from '@/hooks';
import { addressToDID } from '@/lib/actions/did-registry/query';
import { getRoleHash } from '@/lib/actions/did-auth/utils';
import { useUserManagementData } from '@/hooks/use-user-management-data';
import type { Address } from 'viem';
import type { UserInfo, UserFilters } from './types';

interface UserManagementContextValue {
  // Data
  users: UserInfo[];
  filteredUsers: UserInfo[];
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
  };
  isLoading: boolean;

  // Filters
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;

  // Actions
  addUser: (address: string, role: string) => Promise<void>;
  grantRole: (did: string, role: string) => Promise<void>;
  revokeRole: (did: string, role: string) => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
  refetch: () => Promise<void>;

  // Loading states
  isGrantingRole: boolean;
  isRevokingRole: boolean;
}

const UserManagementContext = createContext<UserManagementContextValue | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
};

interface UserManagementProviderProps {
  children: ReactNode;
}

export const UserManagementProvider: React.FC<UserManagementProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const { users: userMap, isLoading, refetch, stats } = useUserManagementData();
  const { mutateAsync: grantRoleMutation, isPending: isGrantingRole } = useGrantDidRole();
  const { mutateAsync: revokeRoleMutation, isPending: isRevokingRole } = useRevokeDidRole();

  // Filter state
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    search: '',
  });

  // Convert Map to Array for easier filtering
  const users = useMemo(() => Array.from(userMap.values()), [userMap]);

  // Filtered users based on current filters
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (filters.search && !user.did.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Role filter
      if (filters.role !== 'all' && !user.roles.includes(filters.role)) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const isActive = user.active && user.roles.length > 0;
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      return true;
    });
  }, [users, filters]);

  // Handle adding new user
  const addUser = async (newUserAddress: string, newUserRole: string) => {
    if (!newUserAddress) {
      toast.error('Please enter a valid address');
      return;
    }

    try {
      let did: string;

      // Validate address format
      if (!newUserAddress.startsWith('did:') && !newUserAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        toast.error('Invalid address format', {
          description: 'Please enter a valid Ethereum address (0x...) or DID (did:docuvault:...)',
        });
        return;
      }

      // If it's already a DID, use it directly
      if (newUserAddress.startsWith('did:')) {
        did = newUserAddress;
      } else {
        // It's an Ethereum address, fetch the DID from the registry
        try {
          did = await addressToDID(newUserAddress as Address);

          // If no DID exists for this address
          if (!did || did === '') {
            toast.error('No DID found for this address', {
              description: 'User must register a DID first through the signup process.',
            });
            return;
          }
        } catch (error) {
          toast.error('Failed to lookup DID for address', {
            description: error instanceof Error ? error.message : 'User may need to register a DID first',
          });
          return;
        }
      }

      // Check if user already has roles
      const existingUser = users.find((u) => u.did === did);
      if (existingUser && existingUser.roles.includes(newUserRole)) {
        toast.error('User already has this role');
        return;
      }

      // Convert role name to bytes32 hash
      const roleHash = getRoleHash(newUserRole);

      // Grant the role
      await grantRoleMutation({ did, role: roleHash });

      toast.success(`Role ${newUserRole.replace('_ROLE', '').replace('_', ' ')} granted to user`);

      // Refresh events
      await refetch();
    } catch (error) {
      toast.error('Failed to add user', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  // Handle granting role
  const grantRole = async (did: string, role: string) => {
    try {
      const roleHash = getRoleHash(role);
      await grantRoleMutation({ did, role: roleHash });
      toast.success(`Role ${role.replace('_ROLE', '').replace('_', ' ')} granted`);
      await refetch();
    } catch (error) {
      toast.error('Failed to grant role', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  // Handle revoking role
  const revokeRole = async (did: string, role: string) => {
    try {
      const roleHash = getRoleHash(role);
      await revokeRoleMutation({ did, role: roleHash });
      toast.success(`Role ${role.replace('_ROLE', '').replace('_', ' ')} revoked`);
      await refetch();
    } catch (error) {
      toast.error('Failed to revoke role', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const value: UserManagementContextValue = {
    users,
    filteredUsers,
    stats,
    isLoading,
    filters,
    setFilters,
    addUser,
    grantRole,
    revokeRole,
    copyToClipboard,
    refetch,
    isGrantingRole,
    isRevokingRole,
  };

  return <UserManagementContext.Provider value={value}>{children}</UserManagementContext.Provider>;
};