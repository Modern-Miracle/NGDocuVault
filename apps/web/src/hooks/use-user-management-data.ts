import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRoleGrantedEvents, useRoleRevokedEvents } from '@/hooks/events';
import { CONTRACTS } from '@/config/contract';
import { getRoleNameFromHash } from '@/lib/actions/did-auth/utils';
import type { Address } from 'viem';
import type { UserInfo, RoleEvent } from '@/components/user-management';

// Type for the blockchain events with proper args structure
interface RoleEventLog {
  args: {
    did: string;
    role: Address;
    timestamp?: bigint;
  };
  transactionHash: Address;
  blockNumber: bigint;
}

export interface UseUserManagementDataReturn {
  users: Map<string, UserInfo>;
  isLoading: boolean;
  refetch: () => Promise<void>;
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalRoles: number;
  };
}

export const useUserManagementData = (): UseUserManagementDataReturn => {
  const [users, setUsers] = useState<Map<string, UserInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Event listeners for role changes
  const { data: roleGrantedEvents, refetch: refetchGrantedEvents } = useRoleGrantedEvents({
    address: CONTRACTS.DidAuth as `0x${string}`,
    enabled: true,
  });

  const { data: roleRevokedEvents, refetch: refetchRevokedEvents } = useRoleRevokedEvents({
    address: CONTRACTS.DidAuth as `0x${string}`,
    enabled: true,
  });

  // Process events to build user data
  const processEvents = useCallback(() => {
    const userMap = new Map<string, UserInfo>();

    // Process role granted events
    if (roleGrantedEvents) {
      (roleGrantedEvents as unknown as RoleEventLog[]).forEach((event) => {
        const { did, role, timestamp } = event.args;
        const roleName = getRoleNameFromHash(role);
        const roleEvent: RoleEvent = {
          eventType: 'granted',
          role: roleName,
          timestamp: timestamp ? new Date(Number(timestamp) * 1000) : new Date(),
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber),
        };

        if (!userMap.has(did)) {
          userMap.set(did, {
            did,
            roles: [],
            active: true,
            roleHistory: [],
          });
        }

        const user = userMap.get(did)!;
        if (!user.roles.includes(roleName)) {
          user.roles.push(roleName);
        }
        user.roleHistory.push(roleEvent);
        user.lastActivity = roleEvent.timestamp;
      });
    }

    // Process role revoked events
    if (roleRevokedEvents) {
      (roleRevokedEvents as unknown as RoleEventLog[]).forEach((event) => {
        const { did, role, timestamp } = event.args;
        const roleName = getRoleNameFromHash(role);
        const roleEvent: RoleEvent = {
          eventType: 'revoked',
          role: roleName,
          timestamp: timestamp ? new Date(Number(timestamp) * 1000) : new Date(),
          transactionHash: event.transactionHash,
          blockNumber: Number(event.blockNumber),
        };

        if (!userMap.has(did)) {
          userMap.set(did, {
            did,
            roles: [],
            active: true,
            roleHistory: [],
          });
        }

        const user = userMap.get(did)!;
        user.roles = user.roles.filter((r) => r !== roleName);
        user.roleHistory.push(roleEvent);
        user.lastActivity = roleEvent.timestamp;

        // Mark user as inactive if they have no roles
        if (user.roles.length === 0) {
          user.active = false;
        }
      });
    }

    // Sort role history by timestamp (newest first)
    userMap.forEach((user) => {
      user.roleHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });

    setUsers(userMap);
    setIsLoading(false);
  }, [roleGrantedEvents, roleRevokedEvents]);

  useEffect(() => {
    processEvents();
  }, [processEvents]);

  // Calculate stats
  const stats = useMemo(() => {
    const userArray = Array.from(users.values());
    return {
      totalUsers: users.size,
      activeUsers: userArray.filter((u) => u.active && u.roles.length > 0).length,
      totalRoles: userArray.reduce((acc, user) => acc + user.roles.length, 0),
    };
  }, [users]);

  // Refetch function
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([refetchGrantedEvents(), refetchRevokedEvents()]);
  }, [refetchGrantedEvents, refetchRevokedEvents]);

  return {
    users,
    isLoading,
    refetch,
    stats,
  };
};