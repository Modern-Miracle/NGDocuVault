import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSdk } from '@docu/graphql-client-codegen';
import { graphqlClient, DEFAULT_QUERY_OPTIONS, QUERY_KEYS, REFETCH_INTERVALS } from './config';

const sdk = getSdk(graphqlClient);

/**
 * Hook to fetch comprehensive dashboard statistics
 * Combines data from documents, holders, issuers, DIDs, and verifiers
 */
export function useDashboardStats(
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.documentsCount, 'dashboard'],
    queryFn: async () => {
      // Fetch all required data in parallel
      const [
        documentsCountData,
        documentsData,
        issuersData,
        holdersData,
        didsData,
        verifiersData,
      ] = await Promise.all([
        sdk.GetDocumentsCount(),
        sdk.GetDocuments({ first: 100, skip: 0 }), // Get recent documents for analysis
        sdk.GetIssuers({ first: 100, skip: 0 }),
        sdk.GetHolders({ first: 100, skip: 0 }),
        sdk.GetDIDs({ first: 100, skip: 0 }),
        sdk.GetVerifiers({ first: 100, skip: 0 }),
      ]);

      const documents = documentsData.documents || [];
      const issuers = issuersData.issuers || [];
      const holders = holdersData.holders || [];
      const dids = didsData.dids || [];
      const verifiers = verifiersData.verifiers || [];

      // Calculate document statistics
      const verifiedDocuments = documents.filter(doc => doc.isVerified);
      const unverifiedDocuments = documents.filter(doc => !doc.isVerified);
      
      // Calculate time-based metrics
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

      const recentDocuments = {
        lastDay: documents.filter(doc => parseInt(doc.registeredAt) * 1000 > oneDayAgo),
        lastWeek: documents.filter(doc => parseInt(doc.registeredAt) * 1000 > oneWeekAgo),
        lastMonth: documents.filter(doc => parseInt(doc.registeredAt) * 1000 > oneMonthAgo),
      };

      // Document type distribution
      const documentTypeStats = documents.reduce((acc, doc) => {
        acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Issuer statistics
      const activeIssuers = issuers.filter(issuer => issuer.isActive);
      const inactiveIssuers = issuers.filter(issuer => !issuer.isActive);

      // DID statistics
      const activeDids = dids.filter(did => did.active);
      const inactiveDids = dids.filter(did => !did.active);

      // Verifier type distribution
      const verifierTypeStats = verifiers.reduce((acc, verifier) => {
        acc[verifier.verifierType] = (acc[verifier.verifierType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Growth metrics (comparing current month to previous month)
      const twoMonthsAgo = now - (60 * 24 * 60 * 60 * 1000);
      const previousMonthDocuments = documents.filter(doc => {
        const registeredAt = parseInt(doc.registeredAt) * 1000;
        return registeredAt > twoMonthsAgo && registeredAt <= oneMonthAgo;
      });

      const growthMetrics = {
        documents: {
          current: recentDocuments.lastMonth.length,
          previous: previousMonthDocuments.length,
          growth: previousMonthDocuments.length > 0 
            ? ((recentDocuments.lastMonth.length - previousMonthDocuments.length) / previousMonthDocuments.length) * 100 
            : 0,
        },
      };

      // Verification rate
      const verificationRate = documents.length > 0 ? (verifiedDocuments.length / documents.length) * 100 : 0;

      // Network health score (simple metric based on various factors)
      const healthScore = Math.min(100, Math.max(0, 
        (verificationRate * 0.4) + 
        (activeIssuers.length / Math.max(1, issuers.length) * 100 * 0.3) +
        (activeDids.length / Math.max(1, dids.length) * 100 * 0.2) +
        (verifiers.length > 0 ? 100 : 0) * 0.1
      ));

      return {
        overview: {
          totalDocuments: documentsCountData.documentsCount || 0,
          verifiedDocuments: verifiedDocuments.length,
          unverifiedDocuments: unverifiedDocuments.length,
          verificationRate: Math.round(verificationRate),
          totalIssuers: issuers.length,
          activeIssuers: activeIssuers.length,
          totalHolders: holders.length,
          totalDids: dids.length,
          activeDids: activeDids.length,
          totalVerifiers: verifiers.length,
          healthScore: Math.round(healthScore),
        },
        
        activity: {
          recentDocuments,
          growthMetrics,
          dailyAverage: Math.round(recentDocuments.lastMonth.length / 30),
          weeklyAverage: Math.round(recentDocuments.lastMonth.length / 4),
        },

        distribution: {
          documentTypes: documentTypeStats,
          verifierTypes: verifierTypeStats,
          issuerActivity: {
            active: activeIssuers.length,
            inactive: inactiveIssuers.length,
          },
          didActivity: {
            active: activeDids.length,
            inactive: inactiveDids.length,
          },
        },

        trends: {
          documentsGrowth: growthMetrics.documents.growth,
          verificationTrend: verificationRate,
          networkExpansion: activeIssuers.length + holders.length + verifiers.length,
        },

        rawData: {
          recentDocuments: documents.slice(0, 10), // Latest 10 documents
          topIssuers: activeIssuers.slice(0, 5), // Top 5 active issuers
          recentDids: activeDids.slice(0, 5), // Recent 5 DIDs
        },
      };
    },
    enabled,
    refetchInterval: REFETCH_INTERVALS.stats,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook for real-time dashboard updates with shorter refresh intervals
 */
export function useDashboardStatsRealtime(
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useDashboardStats(
    options,
    {
      refetchInterval: REFETCH_INTERVALS.events, // More frequent updates
      refetchOnWindowFocus: true,
      ...queryOptions,
    }
  );
}

/**
 * Hook to get network activity over time
 */
export function useNetworkActivity(
  days: number = 30,
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.documents, 'activity', days],
    queryFn: async () => {
      // Get documents from the specified time period
      const documentsData = await sdk.GetDocuments({ first: 1000, skip: 0 });
      const documents = documentsData.documents || [];

      const now = Date.now();
      const startTime = now - (days * 24 * 60 * 60 * 1000);

      const relevantDocuments = documents.filter(doc => {
        const registeredAt = parseInt(doc.registeredAt) * 1000;
        return registeredAt > startTime;
      });

      // Group by day
      const dailyActivity = [];
      for (let i = 0; i < days; i++) {
        const dayStart = now - ((i + 1) * 24 * 60 * 60 * 1000);
        const dayEnd = now - (i * 24 * 60 * 60 * 1000);
        
        const dayDocuments = relevantDocuments.filter(doc => {
          const registeredAt = parseInt(doc.registeredAt) * 1000;
          return registeredAt > dayStart && registeredAt <= dayEnd;
        });

        const verified = dayDocuments.filter(doc => doc.isVerified).length;
        const unverified = dayDocuments.filter(doc => !doc.isVerified).length;

        dailyActivity.unshift({
          date: new Date(dayEnd).toISOString().split('T')[0],
          timestamp: dayEnd,
          total: dayDocuments.length,
          verified,
          unverified,
          verificationRate: dayDocuments.length > 0 ? (verified / dayDocuments.length) * 100 : 0,
        });
      }

      // Calculate trends
      const totalDocuments = dailyActivity.reduce((sum, day) => sum + day.total, 0);
      const averageDaily = totalDocuments / days;
      const recentAverage = dailyActivity.slice(-7).reduce((sum, day) => sum + day.total, 0) / 7;
      const trend = averageDaily > 0 ? ((recentAverage - averageDaily) / averageDaily) * 100 : 0;

      return {
        dailyActivity,
        summary: {
          totalDocuments,
          averageDaily: Math.round(averageDaily * 100) / 100,
          recentAverage: Math.round(recentAverage * 100) / 100,
          trend: Math.round(trend * 100) / 100,
          peakDay: dailyActivity.reduce((max, day) => day.total > max.total ? day : max, dailyActivity[0]),
        },
      };
    },
    enabled,
    refetchInterval: REFETCH_INTERVALS.stats,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}