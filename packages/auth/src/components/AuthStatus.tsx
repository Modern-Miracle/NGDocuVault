
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Shield, Clock } from 'lucide-react';

export interface AuthStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function AuthStatus({ showDetails = true, className }: AuthStatusProps) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className={`border rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-500">
          <User className="h-4 w-4" />
          <span>Not authenticated</span>
        </div>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-2 w-2 bg-green-500 rounded-full" />
        <span className="text-sm text-gray-600">
          {user.address.slice(0, 6)}...{user.address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      <div className="p-4 border-b">
        <div className="text-base font-medium flex items-center justify-between">
          <span>Authentication Status</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Active
          </span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">Address</p>
            <p className="text-xs text-gray-500 font-mono">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
          </div>
        </div>

        {user.did && (
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">DID</p>
              <p className="text-xs text-gray-500 font-mono truncate">
                {user.did}
              </p>
            </div>
          </div>
        )}

        {user.role && (
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Role</p>
              <span className="text-xs border rounded px-2 py-1">
                {user.role}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Auth Method: <span className="font-medium">{user.authMethod || 'SIWE'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}