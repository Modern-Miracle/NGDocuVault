import React from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useAccount } from 'wagmi';
import { useHolderDocuments, useMultipleDocumentInfo, useIsIssuerActive, useIsPaused } from '@/hooks/use-docu-vault';
import {
  useDocumentRegisteredEvents,
  useDocumentVerifiedEvents,
  useShareRequestedEvents,
  useUserRegisteredEvents,
  useIssuerRegisteredEvents,
} from '@/hooks/events/use-docu-events';
import { CONTRACTS } from '@/config/contract';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import {
  RoleStatus,
  AdminDashboard,
  IssuerDashboard,
  VerifierDashboard,
  HolderDashboard,
  RecentDocuments,
  RecentActivity,
} from '@/components/dashboard';
import type { Log } from 'viem';

// Type for document info
type DocumentInfoData = Array<{
  isVerified: boolean;
  contentHash?: `0x${string}`;
  documentId?: string;
  holder: `0x${string}`;
  issuer: `0x${string}`;
  documentType: bigint | number;
  issuanceTimestamp?: bigint;
  expirationTimestamp?: bigint;
  [key: string]: unknown;
}>;

const Dashboard: React.FC = () => {
  const { address } = useAccount();
  const { isAdmin, isIssuer, isVerifier, isHolder, roles } = useAuth();

  // Contract state
  const { data: pausedData } = useIsPaused();
  const isPaused = pausedData?.paused;
  const { data: isIssuerActive } = useIsIssuerActive(isIssuer ? address : undefined);

  // Document data for holders
  const validAddress = isHolder && address ? (address as `0x${string}`) : undefined;
  const { data: documentsData, isLoading: loadingDocuments } = useHolderDocuments(validAddress);
  const documentIds = documentsData?.documentIds || [];
  const { data: rawDocumentsInfo = [] } = useMultipleDocumentInfo(documentIds.length > 0 ? documentIds : undefined);
  const documentsInfo = rawDocumentsInfo as unknown as DocumentInfoData;

  // Event hooks for monitoring (primarily for admin/issuer/verifier)
  const { data: registeredEvents } = useDocumentRegisteredEvents({
    address: CONTRACTS.DocuVault as `0x${string}`,
    enabled: isAdmin || isIssuer,
  });

  const { data: verifiedEvents } = useDocumentVerifiedEvents({
    address: CONTRACTS.DocuVault as `0x${string}`,
    enabled: isAdmin || isVerifier,
  });

  const { data: shareRequestEvents } = useShareRequestedEvents({
    address: CONTRACTS.DocuVault as `0x${string}`,
    enabled: isAdmin || isVerifier,
  });

  const { data: userRegisteredEvents } = useUserRegisteredEvents({
    address: CONTRACTS.DocuVault as `0x${string}`,
    enabled: isAdmin,
  });

  const { data: issuerRegisteredEvents } = useIssuerRegisteredEvents({
    address: CONTRACTS.DocuVault as `0x${string}`,
    enabled: isAdmin,
  });

  // Use the custom hook for statistics calculation
  const stats = useDashboardStats({
    isHolder,
    isAdmin,
    isIssuer,
    isVerifier,
    address: address as string,
    documentsInfo,
    registeredEvents: registeredEvents as Log[],
    verifiedEvents: verifiedEvents as Log[],
    shareRequestEvents: shareRequestEvents as Log[],
    userRegisteredEvents: userRegisteredEvents as Log[],
    issuerRegisteredEvents: issuerRegisteredEvents as Log[],
  });

  // Render role-specific dashboard
  const renderDashboard = () => {
    // Admin Dashboard
    if (isAdmin) {
      return (
        <AdminDashboard
          isPaused={isPaused}
          stats={{
            totalUsers: stats.totalUsers,
            totalIssuers: stats.totalIssuers,
            recentActivity: stats.recentActivity,
            pendingRequests: stats.pendingRequests,
          }}
        />
      );
    }

    // Issuer Dashboard
    if (isIssuer) {
      return (
        <IssuerDashboard
          isIssuerActive={isIssuerActive?.active}
          stats={{
            documentsIssued: stats.documentsIssued,
            documentsVerified: stats.documentsVerified,
            verificationRequests: stats.verificationRequests,
          }}
        />
      );
    }

    // Verifier Dashboard
    if (isVerifier) {
      return (
        <VerifierDashboard
          stats={{
            documentsReviewed: stats.documentsReviewed,
            shareRequests: stats.shareRequests,
            verificationRequests: stats.verificationRequests,
          }}
        />
      );
    }

    // Default Holder Dashboard
    return (
      <HolderDashboard
        stats={{
          totalDocuments: stats.totalDocuments,
          verifiedDocuments: stats.verifiedDocuments,
          pendingVerification: stats.pendingVerification,
          expiringDocuments: stats.expiringDocuments,
        }}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'User'}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</div>
      </div>

      {/* Role Status */}
      <RoleStatus roles={roles} isAdmin={isAdmin} isIssuer={isIssuer} isVerifier={isVerifier} isHolder={isHolder} />

      {/* Role-specific dashboard content */}
      {renderDashboard()}

      {/* Recent Documents (for holders and issuers) */}
      {(isHolder || isIssuer) && documentsInfo.length > 0 && (
        <RecentDocuments documents={documentsInfo} loading={loadingDocuments} totalDocuments={documentIds.length} />
      )}

      {/* Recent Activity for Admins */}
      {isAdmin && registeredEvents && registeredEvents.length > 0 && <RecentActivity events={registeredEvents} />}
    </div>
  );
};

export default Dashboard;
