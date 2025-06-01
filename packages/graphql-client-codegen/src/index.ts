// Export generated GraphQL types - use specific re-export to avoid conflicts
import type {
  GetDocumentsQuery,
  GetDocumentsQueryVariables,
  GetDocumentQuery,
  GetDocumentQueryVariables,
  GetDocumentsByHolderQuery,
  GetDocumentsByHolderQueryVariables,
  GetIssuerQuery,
  GetIssuerQueryVariables,
  GetHolderQuery,
  GetHolderQueryVariables,
  GetDocumentsCountQuery,
  GetIssuersQuery,
  GetIssuersQueryVariables,
  DocumentType,
  ConsentStatus,
  Document,
  Issuer,
  Holder,
} from './generated/graphql';

// Re-export types
export type {
  GetDocumentsQuery,
  GetDocumentsQueryVariables,
  GetDocumentQuery,
  GetDocumentQueryVariables,
  GetDocumentsByHolderQuery,
  GetDocumentsByHolderQueryVariables,
  GetIssuerQuery,
  GetIssuerQueryVariables,
  GetHolderQuery,
  GetHolderQueryVariables,
  GetDocumentsCountQuery,
  GetIssuersQuery,
  GetIssuersQueryVariables,
  DocumentType,
  ConsentStatus,
  Document,
  Issuer,
  Holder,
};

// Export GraphQL Request SDK
export { getSdk } from './generated/graphql-request';

// Export utility functions
export * from './utils';

// Export constants
export const CACHE_KEY_PREFIX = 'graphql-query';

// Note about React Query hooks:
// The React Query hooks are exported from './generated/react-query'
// You can import them directly when React Query is installed:
// import { useGetDocumentQuery } from '@docu/graphql-client-codegen/dist/generated/react-query';
