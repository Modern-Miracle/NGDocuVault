import { useMemo } from 'react';
import type { Log } from 'viem';

interface DocumentInfo {
  isVerified: boolean;
  contentHash?: `0x${string}`;
  documentId?: string;
  holder: `0x${string}`;
  issuer: `0x${string}`;
  documentType: bigint | number;
  issuanceTimestamp?: bigint;
  expirationTimestamp?: bigint;
}

interface EventLog extends Log {
  args?: {
    documentId?: string;
    issuer?: string;
    holder?: string;
    verifier?: string;
    requester?: string;
    timestamp?: bigint;
    status?: number;
    [key: string]: unknown;
  };
}

interface DashboardStats {
  // Holder stats
  totalDocuments: number;
  verifiedDocuments: number;
  pendingVerification: number;
  expiringDocuments: number;

  // Admin/System stats
  totalUsers: number;
  totalIssuers: number;
  recentActivity: number;
  pendingRequests: number;

  // Issuer stats
  documentsIssued: number;
  documentsVerified: number;
  verificationRequests: number;

  // Verifier stats
  documentsReviewed: number;
  shareRequests: number;
}

interface UseDashboardStatsParams {
  isHolder: boolean;
  isAdmin: boolean;
  isIssuer: boolean;
  isVerifier: boolean;
  address?: string;
  documentsInfo?: DocumentInfo[];
  registeredEvents?: Log[];
  verifiedEvents?: Log[];
  shareRequestEvents?: Log[];
  userRegisteredEvents?: Log[];
  issuerRegisteredEvents?: Log[];
}

export const useDashboardStats = ({
  isHolder,
  isAdmin,
  isIssuer,
  isVerifier,
  address,
  documentsInfo,
  registeredEvents,
  verifiedEvents,
  shareRequestEvents,
  userRegisteredEvents,
  issuerRegisteredEvents,
}: UseDashboardStatsParams): DashboardStats => {
  return useMemo(() => {
    const now = Date.now();
    const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const stats: DashboardStats = {
      totalDocuments: 0,
      verifiedDocuments: 0,
      pendingVerification: 0,
      expiringDocuments: 0,
      totalUsers: 0,
      totalIssuers: 0,
      recentActivity: 0,
      pendingRequests: 0,
      documentsIssued: 0,
      documentsVerified: 0,
      verificationRequests: 0,
      documentsReviewed: 0,
      shareRequests: 0,
    };

    // Holder statistics
    if (isHolder && documentsInfo && Array.isArray(documentsInfo)) {
      stats.totalDocuments = documentsInfo.length;
      stats.verifiedDocuments = documentsInfo.filter((info) => info.isVerified).length;
      stats.pendingVerification = documentsInfo.filter((info) => !info.isVerified).length;
      stats.expiringDocuments = documentsInfo.filter((info) => {
        const expirationTime = Number(info.expirationTimestamp || 0) * 1000;
        return expirationTime > now && expirationTime < thirtyDaysFromNow;
      }).length;
    }

    // Admin statistics
    if (isAdmin) {
      const recentActivityCount = [
        ...(registeredEvents || []),
        ...(verifiedEvents || []),
        ...(shareRequestEvents || []),
      ].filter((event) => {
        const eventWithArgs = event as EventLog;
        const timestamp = Number(eventWithArgs.args?.timestamp || 0) * 1000;
        return timestamp > twentyFourHoursAgo;
      }).length;

      stats.totalUsers = userRegisteredEvents?.length || 0;
      stats.totalIssuers = issuerRegisteredEvents?.length || 0;
      stats.recentActivity = recentActivityCount;
      stats.pendingRequests =
        shareRequestEvents?.filter(
          (e) => (e as EventLog).args?.status === 0 // Assuming 0 is pending status
        ).length || 0;
    }

    // Issuer statistics
    if (isIssuer && address) {
      const myIssuedDocs =
        registeredEvents?.filter((e) => {
          const eventWithArgs = e as EventLog;
          return eventWithArgs.args?.issuer?.toLowerCase() === address.toLowerCase();
        }) || [];

      const myVerifiedDocs =
        verifiedEvents?.filter((e) => {
          const eventWithArgs = e as EventLog;
          return eventWithArgs.args?.issuer?.toLowerCase() === address.toLowerCase();
        }) || [];

      stats.documentsIssued = myIssuedDocs.length;
      stats.documentsVerified = myVerifiedDocs.length;
      stats.verificationRequests = shareRequestEvents?.filter((e) => (e as EventLog).args?.status === 0).length || 0;
    }

    // Verifier statistics
    if (isVerifier) {
      stats.documentsReviewed = verifiedEvents?.length || 0;
      stats.shareRequests = shareRequestEvents?.length || 0;
    }

    return stats;
  }, [
    isHolder,
    isAdmin,
    isIssuer,
    isVerifier,
    address,
    documentsInfo,
    registeredEvents?.length,
    verifiedEvents?.length,
    shareRequestEvents?.length,
    userRegisteredEvents?.length,
    issuerRegisteredEvents?.length,
  ]);
};