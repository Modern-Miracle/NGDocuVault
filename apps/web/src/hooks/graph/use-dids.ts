// import { useQuery, UseQueryOptions } from '@tanstack/react-query';
// import { getSdk, GetDidQuery, GetDiDsQuery } from '@docu/graphql-client-codegen';
// import { graphqlClient, DEFAULT_QUERY_OPTIONS, QUERY_KEYS, REFETCH_INTERVALS } from './config';

// const sdk = getSdk(graphqlClient);

// interface UseDidsOptions {
//   first?: number;
//   skip?: number;
//   enabled?: boolean;
// }

// /**
//  * Hook to fetch all DIDs with pagination
//  */
// export function useDids(
//   options: UseDidsOptions = {},
//   queryOptions?: Omit<UseQueryOptions<GetDiDsQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { first = 20, skip = 0, enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.dids, { first, skip }],
//     queryFn: () => sdk.GetDIDs({ first, skip }),
//     enabled,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to fetch a specific DID by ID
//  */
// export function useDid(
//   id: string,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions<GetDidQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: QUERY_KEYS.did(id),
//     queryFn: () => sdk.GetDID({ id }),
//     enabled: enabled && !!id,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to fetch DID by address (using Viem address format)
//  */
// export function useDidByAddress(
//   address: `0x${string}` | undefined,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions<GetDidQuery>, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: QUERY_KEYS.did(address || ''),
//     queryFn: () => sdk.GetDID({ id: address as string }),
//     enabled: enabled && !!address,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get active DIDs only
//  */
// export function useActiveDids(
//   options: UseDidsOptions = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { first = 20, skip = 0, enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.dids, 'active', { first, skip }],
//     queryFn: async () => {
//       const result = await sdk.GetDIDs({ first: first * 2, skip }); // Fetch more to filter active ones
//       const activeDids = result.dids?.filter(did => did.active) || [];

//       return {
//         ...result,
//         dids: activeDids.slice(0, first), // Return only the requested amount
//       };
//     },
//     enabled,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to get DID statistics and role information
//  */
// export function useDidStats(
//   didId: string,
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.did(didId), 'stats'],
//     queryFn: async () => {
//       const didData = await sdk.GetDID({ id: didId });
//       const did = didData.did;

//       if (!did) {
//         throw new Error('DID not found');
//       }

//       const activeRoles = did.roles.filter(role => role.granted && !role.revokedAt);
//       const revokedRoles = did.roles.filter(role => role.revokedAt);
//       const verifiedCredentials = did.credentials.filter(cred => cred.verified);
//       const pendingCredentials = did.credentials.filter(cred => !cred.verified);

//       // Calculate time-based metrics
//       const now = Date.now();
//       const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

//       const recentCredentials = did.credentials.filter(cred => {
//         const issuedAt = parseInt(cred.issuedAt) * 1000;
//         return issuedAt > oneMonthAgo;
//       });

//       const recentRoles = did.roles.filter(role => {
//         const grantedAt = parseInt(role.grantedAt) * 1000;
//         return grantedAt > oneMonthAgo;
//       });

//       return {
//         did,
//         totalCredentials: did.credentials.length,
//         verifiedCredentials: verifiedCredentials.length,
//         pendingCredentials: pendingCredentials.length,
//         totalRoles: did.roles.length,
//         activeRoles: activeRoles.length,
//         revokedRoles: revokedRoles.length,
//         credentialTypes: did.credentials.reduce((acc, cred) => {
//           acc[cred.credentialType] = (acc[cred.credentialType] || 0) + 1;
//           return acc;
//         }, {} as Record<string, number>),
//         roleTypes: activeRoles.reduce((acc, role) => {
//           const roleType = role.role;
//           acc[roleType] = (acc[roleType] || 0) + 1;
//           return acc;
//         }, {} as Record<string, number>),
//         recentActivity: {
//           credentials: recentCredentials.length,
//           roles: recentRoles.length,
//         },
//         lastUpdate: parseInt(did.lastUpdated) * 1000,
//       };
//     },
//     enabled: enabled && !!didId,
//     refetchInterval: REFETCH_INTERVALS.stats,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }

// /**
//  * Hook to check if a DID has specific roles
//  */
// export function useDidRoles(
//   didId: string,
//   targetRoles: string[] = [],
//   options: { enabled?: boolean } = {},
//   queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
// ) {
//   const { enabled = true } = options;

//   return useQuery({
//     queryKey: [...QUERY_KEYS.did(didId), 'roles', targetRoles],
//     queryFn: async () => {
//       const didData = await sdk.GetDID({ id: didId });
//       const did = didData.did;

//       if (!did) {
//         throw new Error('DID not found');
//       }

//       const activeRoles = did.roles.filter(role => role.granted && !role.revokedAt);
//       const hasRoles = targetRoles.reduce((acc, targetRole) => {
//         acc[targetRole] = activeRoles.some(role => role.role === targetRole);
//         return acc;
//       }, {} as Record<string, boolean>);

//       return {
//         did,
//         hasRoles,
//         activeRoles: activeRoles.map(role => role.role),
//         hasAnyRole: targetRoles.length === 0 || targetRoles.some(role => hasRoles[role]),
//         hasAllRoles: targetRoles.length > 0 && targetRoles.every(role => hasRoles[role]),
//       };
//     },
//     enabled: enabled && !!didId,
//     refetchInterval: REFETCH_INTERVALS.user,
//     ...DEFAULT_QUERY_OPTIONS,
//     ...queryOptions,
//   });
// }
