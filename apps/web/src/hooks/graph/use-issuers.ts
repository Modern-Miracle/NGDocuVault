// import { useQuery, UseQueryOptions } from '@tanstack/react-query';
// import { getSdk, GetIssuerQuery, GetIssuersQuery } from '@docu/graphql-client-codegen';
// import { graphqlClient, DEFAULT_QUERY_OPTIONS, QUERY_KEYS, REFETCH_INTERVALS } from './config';

// const sdk = getSdk(graphqlClient);

// interface UseIssuersOptions {
//   first?: number;
//   skip?: number;
//   enabled?: boolean;
// }

// /**
//  * Hook to fetch all issuers with pagination
//  */
// export function useIssuers(
//   options: UseIssuersOptions = {},
//   queryOptions?: Omit<UseQueryOptions<GetIssuersQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { first = 20, skip = 0, enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.issuers, { first, skip }],
//     queryFn: () => sdk.GetIssuers({ first, skip }),
//     enabled,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to fetch a specific issuer by ID
//  */
// export function useIssuer(
//   id: string,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions<GetIssuerQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: QUERY_KEYS.issuer(id),
//     queryFn: () => sdk.GetIssuer({ id }),
//     enabled: enabled && !!id,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to fetch issuer by address (using Viem address format)
//  */
// export function useIssuerByAddress(
//   address: `0x${string}` | undefined,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions<GetIssuerQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: QUERY_KEYS.issuer(address || ''),
//     queryFn: () => sdk.GetIssuer({ id: address as string }),
//     enabled: enabled && !!address,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get active issuers only
//  */
// export function useActiveIssuers(
//   options: UseIssuersOptions = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { first = 20, skip = 0, enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.issuers, 'active', { first, skip }],
//     queryFn: async () => {
//       const result = await sdk.GetIssuers({ first: first * 2, skip }); // Fetch more to filter active ones
//       const activeIssuers = result.issuers?.filter(issuer => issuer.isActive) || [];

//       return {
//         ...result,
//         issuers: activeIssuers.slice(0, first), // Return only the requested amount
//       };
//     },
//     enabled,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get issuer statistics and performance metrics
//  */
// export function useIssuerStats(
//   issuerId: string,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.issuer(issuerId), 'stats'],
//     queryFn: async () => {
//       const issuerData = await sdk.GetIssuer({ id: issuerId });
//       const issuer = issuerData.issuer;

//       if (!issuer) {
//         throw new Error('Issuer not found');
//       }

//       const documents = issuer.documents || [];
//       const verifiedDocuments = documents.filter(doc => doc.isVerified);
//       const unverifiedDocuments = documents.filter(doc => !doc.isVerified);

//       // Calculate activity metrics
//       const now = Date.now();
//       const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
//       const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

//       const recentDocuments = documents.filter(doc => {
//         const registeredAt = parseInt(doc.registeredAt) * 1000;
//         return registeredAt > oneMonthAgo;
//       });

//       const weeklyDocuments = documents.filter(doc => {
//         const registeredAt = parseInt(doc.registeredAt) * 1000;
//         return registeredAt > oneWeekAgo;
//       });

//       return {
//         issuer,
//         totalDocuments: documents.length,
//         verifiedDocuments: verifiedDocuments.length,
//         unverifiedDocuments: unverifiedDocuments.length,
//         verificationRate: documents.length > 0 ? (verifiedDocuments.length / documents.length) * 100 : 0,
//         monthlyActivity: recentDocuments.length,
//         weeklyActivity: weeklyDocuments.length,
//         documentTypes: documents.reduce((acc, doc) => {
//           acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
//           return acc;
//         }, {} as Record<string, number>),
//         latestDocuments: documents.slice(0, 5), // Latest 5 documents
//       };
//     },
//     enabled: enabled && !!issuerId,
//     refetchInterval: REFETCH_INTERVALS.stats,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }
