import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSdk, GetHolderQuery, GetHoldersQuery } from '@docu/graphql-client-codegen';
import { graphqlClient, DEFAULT_QUERY_OPTIONS, QUERY_KEYS, REFETCH_INTERVALS } from './config';

const sdk = getSdk(graphqlClient);

interface UseHoldersOptions {
  first?: number;
  skip?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch all holders with pagination
 */
export function useHolders(
  options: UseHoldersOptions = {},
  queryOptions?: Omit<UseQueryOptions<GetHoldersQuery>, 'queryKey' | 'queryFn'>
) {
  const { first = 20, skip = 0, enabled = true } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.holders, { first, skip }],
    queryFn: () => sdk.GetHolders({ first, skip }),
    enabled,
    refetchInterval: REFETCH_INTERVALS.user,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook to fetch a specific holder by ID
 */
export function useHolder(
  id: string,
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions<GetHolderQuery>, 'queryKey' | 'queryFn'>
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.holder(id),
    queryFn: () => sdk.GetHolder({ id }),
    enabled: enabled && !!id,
    refetchInterval: REFETCH_INTERVALS.user,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook to fetch holder by address (using Viem address format)
 */
export function useHolderByAddress(
  address: `0x${string}` | undefined,
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions<GetHolderQuery>, 'queryKey' | 'queryFn'>
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.holder(address || ''),
    queryFn: () => sdk.GetHolder({ id: address as string }),
    enabled: enabled && !!address,
    refetchInterval: REFETCH_INTERVALS.user,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook to get holder statistics
 */
export function useHolderStats(
  holderId: string,
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.holder(holderId), 'stats'],
    queryFn: async () => {
      const [holderData, documentsData] = await Promise.all([
        sdk.GetHolder({ id: holderId }),
        sdk.GetDocumentsByHolder({ holderId, first: 1000, skip: 0 })
      ]);

      const holder = holderData.holder;
      const documents = documentsData.holder?.documents || [];

      if (!holder) {
        throw new Error('Holder not found');
      }

      const verifiedDocuments = documents.filter(doc => doc.isVerified);
      const unverifiedDocuments = documents.filter(doc => !doc.isVerified);
      const expiredDocuments = documents.filter(doc => doc.isExpired);

      return {
        holder,
        totalDocuments: documents.length,
        verifiedDocuments: verifiedDocuments.length,
        unverifiedDocuments: unverifiedDocuments.length,
        expiredDocuments: expiredDocuments.length,
        documentTypes: documents.reduce((acc, doc) => {
          acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        documents: documents.slice(0, 10), // Latest 10 documents
      };
    },
    enabled: enabled && !!holderId,
    refetchInterval: REFETCH_INTERVALS.stats,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}