export interface RoleEvent {
  eventType: 'granted' | 'revoked';
  role: string;
  timestamp: Date;
  transactionHash: `0x${string}`;
  blockNumber: number;
}

export interface UserInfo {
  did: string;
  address?: string;
  roles: string[];
  active: boolean;
  lastActivity?: Date;
  roleHistory: RoleEvent[];
}

export interface UserFilters {
  role: string;
  status: 'all' | 'active' | 'inactive';
  search: string;
}