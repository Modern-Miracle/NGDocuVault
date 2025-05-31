// import { useQuery, UseQueryOptions } from '@tanstack/react-query';
// import { getSdk, GetVerifierQuery, GetVerifiersQuery } from '@docu/graphql-client-codegen';
// import { graphqlClient, DEFAULT_QUERY_OPTIONS, QUERY_KEYS, REFETCH_INTERVALS } from './config';

// const sdk = getSdk(graphqlClient);

// interface UseVerifiersOptions {
//   first?: number;
//   skip?: number;
//   verifierType?: string;
//   enabled?: boolean;
// }

// /**
//  * Hook to fetch all verifiers with pagination
//  */
// export function useVerifiers(
//   options: UseVerifiersOptions = {},
//   queryOptions?: Omit<UseQueryOptions<GetVerifiersQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { first = 20, skip = 0, enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.verifiers, { first, skip }],
//     queryFn: () => sdk.GetVerifiers({ first, skip }),
//     enabled,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to fetch a specific verifier by ID
//  */
// export function useVerifier(
//   id: string,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions<GetVerifierQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: QUERY_KEYS.verifier(id),
//     queryFn: () => sdk.GetVerifier({ id }),
//     enabled: enabled && !!id,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to fetch verifier by address (using Viem address format)
//  */
// export function useVerifierByAddress(
//   address: `0x${string}` | undefined,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions<GetVerifierQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: QUERY_KEYS.verifier(address || ''),
//     queryFn: () => sdk.GetVerifier({ id: address as string }),
//     enabled: enabled && !!address,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get verifiers by type (Age, FHIR, Hash)
//  */
// export function useVerifiersByType(
//   verifierType: string,
//   options: Omit<UseVerifiersOptions, 'verifierType'> = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { first = 20, skip = 0, enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.verifiers, 'type', verifierType, { first, skip }],
//     queryFn: async () => {
//       const result = await sdk.GetVerifiers({ first: first * 3, skip }); // Fetch more to filter by type
//       const filteredVerifiers = result.verifiers?.filter(
//         verifier => verifier.verifierType.toLowerCase() === verifierType.toLowerCase()
//       ) || [];

//       return {
//         ...result,
//         verifiers: filteredVerifiers.slice(0, first),
//       };
//     },
//     enabled: enabled && !!verifierType,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get verifier statistics and performance metrics
//  */
// export function useVerifierStats(
//   verifierId: string,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.verifier(verifierId), 'stats'],
//     queryFn: async () => {
//       const verifierData = await sdk.GetVerifier({ id: verifierId });
//       const verifier = verifierData.verifier;

//       if (!verifier) {
//         throw new Error('Verifier not found');
//       }

//       const verifications = verifier.verifications || [];
//       const successfulVerifications = verifications.filter(v => v.success);
//       const failedVerifications = verifications.filter(v => !v.success);

//       // Calculate time-based metrics
//       const now = Date.now();
//       const oneHourAgo = now - (60 * 60 * 1000);
//       const oneDayAgo = now - (24 * 60 * 60 * 1000);
//       const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
//       const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

//       const recentVerifications = {
//         lastHour: verifications.filter(v => parseInt(v.timestamp) * 1000 > oneHourAgo),
//         lastDay: verifications.filter(v => parseInt(v.timestamp) * 1000 > oneDayAgo),
//         lastWeek: verifications.filter(v => parseInt(v.timestamp) * 1000 > oneWeekAgo),
//         lastMonth: verifications.filter(v => parseInt(v.timestamp) * 1000 > oneMonthAgo),
//       };

//       // Success rates for different time periods
//       const successRates = {
//         overall: verifications.length > 0 ? (successfulVerifications.length / verifications.length) * 100 : 0,
//         lastDay: recentVerifications.lastDay.length > 0
//           ? (recentVerifications.lastDay.filter(v => v.success).length / recentVerifications.lastDay.length) * 100
//           : 0,
//         lastWeek: recentVerifications.lastWeek.length > 0
//           ? (recentVerifications.lastWeek.filter(v => v.success).length / recentVerifications.lastWeek.length) * 100
//           : 0,
//       };

//       // Performance metrics
//       const averageVerificationTime = verifications.length > 1
//         ? verifications.reduce((acc, curr, index) => {
//             if (index === 0) return 0;
//             const prev = verifications[index - 1];
//             return acc + (parseInt(curr.timestamp) - parseInt(prev.timestamp));
//           }, 0) / (verifications.length - 1)
//         : 0;

//       return {
//         verifier,
//         totalVerifications: verifications.length,
//         successfulVerifications: successfulVerifications.length,
//         failedVerifications: failedVerifications.length,
//         successRates,
//         recentActivity: {
//           lastHour: recentVerifications.lastHour.length,
//           lastDay: recentVerifications.lastDay.length,
//           lastWeek: recentVerifications.lastWeek.length,
//           lastMonth: recentVerifications.lastMonth.length,
//         },
//         performance: {
//           averageVerificationTime: averageVerificationTime,
//           uptime: successRates.overall,
//           reliability: successRates.lastWeek,
//         },
//         latestVerifications: verifications
//           .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
//           .slice(0, 10), // Latest 10 verifications
//       };
//     },
//     enabled: enabled && !!verifierId,
//     refetchInterval: REFETCH_INTERVALS.stats,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get all verifier types and their counts
//  */
// export function useVerifierTypes(
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.verifiers, 'types'],
//     queryFn: async () => {
//       const result = await sdk.GetVerifiers({ first: 1000, skip: 0 }); // Get all verifiers
//       const verifiers = result.verifiers || [];

//       const typeStats = verifiers.reduce((acc, verifier) => {
//         const type = verifier.verifierType;
//         if (!acc[type]) {
//           acc[type] = {
//             count: 0,
//             verifiers: [],
//           };
//         }
//         acc[type].count++;
//         acc[type].verifiers.push(verifier);
//         return acc;
//       }, {} as Record<string, { count: number; verifiers: typeof verifiers }>);

//       const types = Object.keys(typeStats);
//       const totalVerifiers = verifiers.length;

//       return {
//         types,
//         typeStats,
//         totalVerifiers,
//         mostCommonType: types.reduce((a, b) =>
//           typeStats[a].count > typeStats[b].count ? a : b, types[0]
//         ),
//         distribution: types.map(type => ({
//           type,
//           count: typeStats[type].count,
//           percentage: totalVerifiers > 0 ? (typeStats[type].count / totalVerifiers) * 100 : 0,
//         })),
//       };
//     },
//     enabled,
//     refetchInterval: REFETCH_INTERVALS.stats,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }
