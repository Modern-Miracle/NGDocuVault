// Export generated GraphQL types and enums
export {
  DocumentType,
  ConsentStatus
} from './generated/graphql';

// Export type-only imports
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
  Document,
  Issuer,
  Holder,
  ShareRequest,
  VerificationRequest,
  Did,
  Credential,
  Role,
  TrustedIssuer,
  Verifier,
  Verification,
  AgeVerification,
  FhirVerification,
  HashVerification
} from './generated/graphql';

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