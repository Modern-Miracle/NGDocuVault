import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UsersRound, FileCheck, Shield, FileText } from 'lucide-react';

interface RoleStatusProps {
  roles: string[];
  isAdmin: boolean;
  isIssuer: boolean;
  isVerifier: boolean;
  isHolder: boolean;
}

export const RoleStatus: React.FC<RoleStatusProps> = ({
  roles,
  isAdmin,
  isIssuer,
  isVerifier,
  isHolder,
}) => {
  if (roles.length === 0) return null;

  return (
    <Card className="bg-card rounded-xl shadow-sm p-6 border-border">
      <h2 className="text-lg font-semibold text-card-foreground mb-2">Your Roles</h2>
      <div className="flex flex-wrap gap-2">
        {isAdmin && (
          <Badge variant="default" className="flex items-center gap-1">
            <UsersRound className="w-3 h-3" />
            Admin
          </Badge>
        )}
        {isIssuer && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileCheck className="w-3 h-3" />
            Issuer
          </Badge>
        )}
        {isVerifier && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Verifier
          </Badge>
        )}
        {isHolder && (
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Holder
          </Badge>
        )}
      </div>
    </Card>
  );
};