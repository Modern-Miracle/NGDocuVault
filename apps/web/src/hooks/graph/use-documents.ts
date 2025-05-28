import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions } from '@tanstack/react-query';
import { getSdk, DocumentType, GetDocumentsQuery, GetDocumentsQueryVariables } from '@docu/graphql-client-codegen';
import { graphqlClient, DEFAULT_QUERY_OPTIONS, QUERY_KEYS, REFETCH_INTERVALS } from './config';

const sdk = getSdk(graphqlClient);

interface UseDocumentsOptions {
  first?: number;
  skip?: number;
  where?: {
    documentType?: DocumentType;
    isVerified?: boolean;
  };
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * Hook to fetch documents with pagination and filtering
 */
export function useDocuments(
  options: UseDocumentsOptions = {},
  queryOptions?: Omit<UseQueryOptions<GetDocumentsQuery>, 'queryKey' | 'queryFn'>
) {
  const { first = 20, skip = 0, where, enabled = true, refetchInterval } = options;

  const variables: GetDocumentsQueryVariables = {
    first,
    skip,
    ...(where && { where })
  };

  return useQuery({
    queryKey: [...QUERY_KEYS.documents, variables],
    queryFn: () => sdk.GetDocuments(variables),
    enabled,
    refetchInterval: refetchInterval ?? REFETCH_INTERVALS.documents,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook for infinite scrolling documents
 */
export function useInfiniteDocuments(
  options: Omit<UseDocumentsOptions, 'skip'> = {},
  queryOptions?: Omit<UseInfiniteQueryOptions<GetDocumentsQuery>, 'queryKey' | 'queryFn' | 'getNextPageParam'>
) {
  const { first = 20, where, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.documents, 'infinite', { first, where }],
    queryFn: ({ pageParam = 0 }) => {
      const variables: GetDocumentsQueryVariables = {
        first,
        skip: pageParam,
        ...(where && { where })
      };
      return sdk.GetDocuments(variables);
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedCount = allPages.length * first;
      const hasMore = lastPage.documents && lastPage.documents.length === first;
      return hasMore ? loadedCount : undefined;
    },
    enabled,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook to fetch documents count
 */
export function useDocumentsCount(
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: QUERY_KEYS.documentsCount,
    queryFn: () => sdk.GetDocumentsCount(),
    refetchInterval: REFETCH_INTERVALS.stats,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook to fetch a single document by ID
 */
export function useDocument(
  id: string,
  options: { enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEYS.document(id),
    queryFn: () => sdk.GetDocument({ id }),
    enabled: enabled && !!id,
    refetchInterval: REFETCH_INTERVALS.documents,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook to fetch documents by holder with pagination
 */
export function useDocumentsByHolder(
  holderId: string,
  options: { first?: number; skip?: number; enabled?: boolean } = {},
  queryOptions?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const { first = 10, skip = 0, enabled = true } = options;

  return useQuery({
    queryKey: [...QUERY_KEYS.documentsByHolder(holderId), { first, skip }],
    queryFn: () => sdk.GetDocumentsByHolder({ holderId, first, skip }),
    enabled: enabled && !!holderId,
    refetchInterval: REFETCH_INTERVALS.documents,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}

/**
 * Hook for real-time document updates
 */
export function useDocumentsRealtime(
  options: UseDocumentsOptions = {},
  queryOptions?: Omit<UseQueryOptions<GetDocumentsQuery>, 'queryKey' | 'queryFn'>
) {
  return useDocuments(
    {
      ...options,
      refetchInterval: REFETCH_INTERVALS.events, // More frequent updates
    },
    {
      refetchOnWindowFocus: true,
      ...queryOptions,
    }
  );
}