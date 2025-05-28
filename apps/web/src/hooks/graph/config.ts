import { createGraphQLClient } from '@docu/graphql-client-codegen';

// Configuration for the subgraph endpoint
export const SUBGRAPH_CONFIG = {
  endpoint: 'http://localhost:8000/subgraphs/name/docu/docu-subgraph',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create the GraphQL client instance
export const graphqlClient = createGraphQLClient(SUBGRAPH_CONFIG);

// Default query options for TanStack Query
export const DEFAULT_QUERY_OPTIONS = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Real-time update intervals
export const REFETCH_INTERVALS = {
  documents: 30000, // 30 seconds
  events: 10000, // 10 seconds
  stats: 60000, // 1 minute
  user: 120000, // 2 minutes
};

// Query keys for consistent caching
export const QUERY_KEYS = {
  documents: ['documents'] as const,
  document: (id: string) => ['document', id] as const,
  documentsByHolder: (holderId: string) => ['documents', 'holder', holderId] as const,
  issuer: (id: string) => ['issuer', id] as const,
  issuers: ['issuers'] as const,
  holder: (id: string) => ['holder', id] as const,
  holders: ['holders'] as const,
  documentsCount: ['documents', 'count'] as const,
  dids: ['dids'] as const,
  did: (id: string) => ['did', id] as const,
  verifiers: ['verifiers'] as const,
  verifier: (id: string) => ['verifier', id] as const,
} as const;