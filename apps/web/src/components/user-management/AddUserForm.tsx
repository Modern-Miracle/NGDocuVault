import React, { useState } from 'react';
import { UserPlus, RefreshCw } from 'lucide-react';
import { CONFIRMED_ROLE_NAMES } from '@/utils/roles';
import { useUserManagement } from './UserManagementProvider';

export const AddUserForm: React.FC = () => {
  const { addUser, isGrantingRole } = useUserManagement();
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const roleOptions = CONFIRMED_ROLE_NAMES.map((role) => role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserAddress || !newUserRole) return;

    await addUser(newUserAddress, newUserRole);
    setNewUserAddress('');
    setNewUserRole('');
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center">
          <UserPlus className="h-5 w-5 text-primary mr-2" />
          <h2 className="font-semibold text-lg text-card-foreground">Add New User</h2>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-card-foreground mb-1">
              Ethereum Address or DID
            </label>
            <input
              type="text"
              id="address"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0x... or did:docuvault:..."
              value={newUserAddress}
              onChange={(e) => setNewUserAddress(e.target.value)}
              disabled={isGrantingRole}
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-card-foreground mb-1">
              Role
            </label>
            <select
              id="role"
              title="Select a role for the new user"
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              disabled={isGrantingRole}
              required
            >
              <option value="">Select a role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_ROLE', '').replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isGrantingRole || !newUserAddress || !newUserRole}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGrantingRole ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
