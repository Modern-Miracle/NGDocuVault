import { GraphQLClient } from 'graphql-request';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Add type declaration for RequestInit to fix missing type reference
type RequestInit = globalThis.RequestInit;

//import { RequestInit } from 'graphql-request/dist/types.dom';

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };

function fetcher<TData, TVariables extends { [key: string]: any }>(
  client: GraphQLClient,
  query: string,
  variables?: TVariables,
  requestHeaders?: RequestInit['headers']
) {
  return async (): Promise<TData> => client.request(query, variables, requestHeaders);

  return async (): Promise<TData> =>
    client.request({
      document: query,
      variables,
      requestHeaders,
    });
}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigInt: { input: string; output: string };
  Bytes: { input: string; output: string };
  DateTime: { input: Date; output: Date };
};

export type AgeVerification = Verification & {
  __typename?: 'AgeVerification';
  caller: Scalars['Bytes']['output'];
  documentId?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  pubSignals: Array<Scalars['BigInt']['output']>;
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type Authentication = {
  __typename?: 'Authentication';
  did: Did;
  id: Scalars['ID']['output'];
  role: Scalars['Bytes']['output'];
  successful: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
};

export enum ConsentStatus {
  Granted = 'GRANTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
}

export type Credential = {
  __typename?: 'Credential';
  credentialId: Scalars['Bytes']['output'];
  credentialType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  issuedAt: Scalars['BigInt']['output'];
  issuer: Scalars['Bytes']['output'];
  subject: Did;
  verified?: Maybe<Scalars['Boolean']['output']>;
  verifiedAt?: Maybe<Scalars['BigInt']['output']>;
};

export type Did = {
  __typename?: 'DID';
  active: Scalars['Boolean']['output'];
  controller: Scalars['Bytes']['output'];
  credentials: Array<Credential>;
  did: Scalars['String']['output'];
  document?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastUpdated: Scalars['BigInt']['output'];
  publicKey?: Maybe<Scalars['String']['output']>;
  roles: Array<Role>;
};

export type DidHolder = {
  __typename?: 'DidHolder';
  did: Did;
  holder: Holder;
  id: Scalars['ID']['output'];
};

export type Document = {
  __typename?: 'Document';
  documentId: Scalars['Bytes']['output'];
  documentType: DocumentType;
  expirationDate: Scalars['BigInt']['output'];
  holder: Holder;
  id: Scalars['ID']['output'];
  isExpired: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  issuanceDate: Scalars['BigInt']['output'];
  issuer: Issuer;
  previousVersion?: Maybe<Document>;
  registeredAt: Scalars['BigInt']['output'];
  shareRequests: Array<ShareRequest>;
  updates: Array<Document>;
  verificationRequests: Array<VerificationRequest>;
  verifiedAt?: Maybe<Scalars['BigInt']['output']>;
  verifiedBy?: Maybe<Scalars['Bytes']['output']>;
};

export type DocumentFilterInput = {
  documentType?: InputMaybe<DocumentType>;
  isVerified?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum DocumentType {
  BirthCertificate = 'BIRTH_CERTIFICATE',
  DeathCertificate = 'DEATH_CERTIFICATE',
  Generic = 'GENERIC',
  IdCard = 'ID_CARD',
  MarriageCertificate = 'MARRIAGE_CERTIFICATE',
  Other = 'OTHER',
  Passport = 'PASSPORT',
}

export type FhirVerification = Verification & {
  __typename?: 'FhirVerification';
  caller: Scalars['Bytes']['output'];
  documentId?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  pubSignals: Array<Scalars['BigInt']['output']>;
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type HashVerification = Verification & {
  __typename?: 'HashVerification';
  caller: Scalars['Bytes']['output'];
  documentId?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  pubSignals: Array<Scalars['BigInt']['output']>;
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type Holder = {
  __typename?: 'Holder';
  address: Scalars['Bytes']['output'];
  documents: Array<Document>;
  id: Scalars['ID']['output'];
  shareRequests: Array<ShareRequest>;
  verificationRequests: Array<VerificationRequest>;
};

export type HolderDocumentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type HolderShareRequestsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type HolderVerificationRequestsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type Issuer = {
  __typename?: 'Issuer';
  activatedAt?: Maybe<Scalars['BigInt']['output']>;
  address: Scalars['Bytes']['output'];
  deactivatedAt?: Maybe<Scalars['BigInt']['output']>;
  documents: Array<Document>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  registeredAt: Scalars['BigInt']['output'];
};

export type IssuerDocumentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  ping?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  did?: Maybe<Did>;
  dids?: Maybe<Array<Did>>;
  document?: Maybe<Document>;
  documents?: Maybe<Array<Document>>;
  documentsCount?: Maybe<Scalars['Int']['output']>;
  holder?: Maybe<Holder>;
  holders?: Maybe<Array<Holder>>;
  holdersCount?: Maybe<Scalars['Int']['output']>;
  issuer?: Maybe<Issuer>;
  issuers?: Maybe<Array<Issuer>>;
  issuersCount?: Maybe<Scalars['Int']['output']>;
  verifier?: Maybe<Verifier>;
  verifiers?: Maybe<Array<Verifier>>;
};

export type QueryDidArgs = {
  id: Scalars['ID']['input'];
};

export type QueryDidsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryDocumentArgs = {
  id: Scalars['ID']['input'];
};

export type QueryDocumentsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<DocumentFilterInput>;
};

export type QueryHolderArgs = {
  id: Scalars['ID']['input'];
};

export type QueryHoldersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryIssuerArgs = {
  id: Scalars['ID']['input'];
};

export type QueryIssuersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryVerifierArgs = {
  id: Scalars['ID']['input'];
};

export type QueryVerifiersArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
};

export type Role = {
  __typename?: 'Role';
  did: Did;
  granted: Scalars['Boolean']['output'];
  grantedAt: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  revokedAt?: Maybe<Scalars['BigInt']['output']>;
  role: Scalars['Bytes']['output'];
};

export type ShareRequest = {
  __typename?: 'ShareRequest';
  document: Document;
  grantedAt?: Maybe<Scalars['BigInt']['output']>;
  holder: Holder;
  id: Scalars['ID']['output'];
  requestedAt: Scalars['BigInt']['output'];
  requester: Scalars['Bytes']['output'];
  revokedAt?: Maybe<Scalars['BigInt']['output']>;
  status: ConsentStatus;
  validUntil?: Maybe<Scalars['BigInt']['output']>;
};

export type TrustedIssuer = {
  __typename?: 'TrustedIssuer';
  credentialType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  issuer: Scalars['Bytes']['output'];
  trusted: Scalars['Boolean']['output'];
  updatedAt: Scalars['BigInt']['output'];
};

export type Verification = {
  id: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type VerificationRequest = {
  __typename?: 'VerificationRequest';
  document: Document;
  holder: Holder;
  id: Scalars['ID']['output'];
  requestedAt: Scalars['BigInt']['output'];
  verified: Scalars['Boolean']['output'];
  verifiedAt?: Maybe<Scalars['BigInt']['output']>;
};

export type Verifier = {
  __typename?: 'Verifier';
  address: Scalars['Bytes']['output'];
  createdAt: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  verifications: Array<Verification>;
  verifierType: Scalars['String']['output'];
};

export type GetDocumentsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetDocumentsQuery = {
  __typename?: 'Query';
  documents?: Array<{
    __typename?: 'Document';
    id: string;
    documentId: string;
    documentType: DocumentType;
    issuanceDate: string;
    expirationDate: string;
    isVerified: boolean;
    issuer: { __typename?: 'Issuer'; id: string; address: string };
    holder: { __typename?: 'Holder'; id: string; address: string };
  }> | null;
};

export type GetDocumentsByHolderQueryVariables = Exact<{
  holderId: Scalars['ID']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetDocumentsByHolderQuery = {
  __typename?: 'Query';
  holder?: {
    __typename?: 'Holder';
    documents: Array<{
      __typename?: 'Document';
      id: string;
      documentId: string;
      documentType: DocumentType;
      issuanceDate: string;
      expirationDate: string;
      isVerified: boolean;
      isExpired: boolean;
      registeredAt: string;
      verifiedAt?: string | null;
      verifiedBy?: string | null;
      issuer: {
        __typename?: 'Issuer';
        id: string;
        address: string;
        isActive: boolean;
      };
    }>;
  } | null;
};

export type GetDocumentQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetDocumentQuery = {
  __typename?: 'Query';
  document?: {
    __typename?: 'Document';
    id: string;
    documentId: string;
    issuanceDate: string;
    expirationDate: string;
    isVerified: boolean;
    documentType: DocumentType;
    isExpired: boolean;
    registeredAt: string;
    verifiedAt?: string | null;
    verifiedBy?: string | null;
    issuer: {
      __typename?: 'Issuer';
      id: string;
      address: string;
      isActive: boolean;
    };
    holder: { __typename?: 'Holder'; id: string; address: string };
  } | null;
};

export type GetIssuerQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetIssuerQuery = {
  __typename?: 'Query';
  issuer?: {
    __typename?: 'Issuer';
    id: string;
    address: string;
    isActive: boolean;
    registeredAt: string;
    activatedAt?: string | null;
    deactivatedAt?: string | null;
    documents: Array<{
      __typename?: 'Document';
      id: string;
      documentId: string;
      documentType: DocumentType;
    }>;
  } | null;
};

export type GetHolderQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetHolderQuery = {
  __typename?: 'Query';
  holder?: {
    __typename?: 'Holder';
    id: string;
    address: string;
    documents: Array<{
      __typename?: 'Document';
      id: string;
      documentId: string;
      documentType: DocumentType;
    }>;
  } | null;
};

export type GetDocumentsCountQueryVariables = Exact<{ [key: string]: never }>;

export type GetDocumentsCountQuery = {
  __typename?: 'Query';
  documentsCount?: number | null;
};

export type GetIssuersQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetIssuersQuery = {
  __typename?: 'Query';
  issuers?: Array<{
    __typename?: 'Issuer';
    id: string;
    address: string;
    isActive: boolean;
    registeredAt: string;
  }> | null;
};

export const GetDocumentsDocument = `
    query GetDocuments($first: Int = 5, $skip: Int = 0) {
  documents(first: $first, skip: $skip) {
    id
    documentId
    documentType
    issuanceDate
    expirationDate
    isVerified
    issuer {
      id
      address
    }
    holder {
      id
      address
    }
  }
}
    `;

export const useGetDocumentsQuery = <TData = GetDocumentsQuery, TError = unknown>(
  client: GraphQLClient,
  variables?: GetDocumentsQueryVariables,
  options?: Omit<UseQueryOptions<GetDocumentsQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetDocumentsQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetDocumentsQuery, TError, TData>({
    queryKey: variables === undefined ? ['GetDocuments'] : ['GetDocuments', variables],
    queryFn: fetcher<GetDocumentsQuery, GetDocumentsQueryVariables>(client, GetDocumentsDocument, variables, headers),
    ...options,
  });
};

useGetDocumentsQuery.document = GetDocumentsDocument;

useGetDocumentsQuery.getKey = (variables?: GetDocumentsQueryVariables) =>
  variables === undefined ? ['GetDocuments'] : ['GetDocuments', variables];

useGetDocumentsQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetDocumentsQueryVariables,
  headers?: RequestInit['headers']
) => fetcher<GetDocumentsQuery, GetDocumentsQueryVariables>(client, GetDocumentsDocument, variables, headers);

export const GetDocumentsByHolderDocument = `
    query GetDocumentsByHolder($holderId: ID!, $first: Int = 5, $skip: Int = 0) {
  holder(id: $holderId) {
    documents(first: $first, skip: $skip) {
      id
      documentId
      documentType
      issuanceDate
      expirationDate
      isVerified
      isExpired
      registeredAt
      verifiedAt
      verifiedBy
      issuer {
        id
        address
        isActive
      }
    }
  }
}
    `;

export const useGetDocumentsByHolderQuery = <TData = GetDocumentsByHolderQuery, TError = unknown>(
  client: GraphQLClient,
  variables: GetDocumentsByHolderQueryVariables,
  options?: Omit<UseQueryOptions<GetDocumentsByHolderQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetDocumentsByHolderQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetDocumentsByHolderQuery, TError, TData>({
    queryKey: ['GetDocumentsByHolder', variables],
    queryFn: fetcher<GetDocumentsByHolderQuery, GetDocumentsByHolderQueryVariables>(
      client,
      GetDocumentsByHolderDocument,
      variables,
      headers
    ),
    ...options,
  });
};

useGetDocumentsByHolderQuery.document = GetDocumentsByHolderDocument;

useGetDocumentsByHolderQuery.getKey = (variables: GetDocumentsByHolderQueryVariables) => [
  'GetDocumentsByHolder',
  variables,
];

useGetDocumentsByHolderQuery.fetcher = (
  client: GraphQLClient,
  variables: GetDocumentsByHolderQueryVariables,
  headers?: RequestInit['headers']
) =>
  fetcher<GetDocumentsByHolderQuery, GetDocumentsByHolderQueryVariables>(
    client,
    GetDocumentsByHolderDocument,
    variables,
    headers
  );

export const GetDocumentDocument = `
    query GetDocument($id: ID!) {
  document(id: $id) {
    id
    documentId
    issuanceDate
    expirationDate
    isVerified
    documentType
    isExpired
    registeredAt
    verifiedAt
    verifiedBy
    issuer {
      id
      address
      isActive
    }
    holder {
      id
      address
    }
  }
}
    `;

export const useGetDocumentQuery = <TData = GetDocumentQuery, TError = unknown>(
  client: GraphQLClient,
  variables: GetDocumentQueryVariables,
  options?: Omit<UseQueryOptions<GetDocumentQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetDocumentQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetDocumentQuery, TError, TData>({
    queryKey: ['GetDocument', variables],
    queryFn: fetcher<GetDocumentQuery, GetDocumentQueryVariables>(client, GetDocumentDocument, variables, headers),
    ...options,
  });
};

useGetDocumentQuery.document = GetDocumentDocument;

useGetDocumentQuery.getKey = (variables: GetDocumentQueryVariables) => ['GetDocument', variables];

useGetDocumentQuery.fetcher = (
  client: GraphQLClient,
  variables: GetDocumentQueryVariables,
  headers?: RequestInit['headers']
) => fetcher<GetDocumentQuery, GetDocumentQueryVariables>(client, GetDocumentDocument, variables, headers);

export const GetIssuerDocument = `
    query GetIssuer($id: ID!) {
  issuer(id: $id) {
    id
    address
    isActive
    registeredAt
    activatedAt
    deactivatedAt
    documents(first: 5) {
      id
      documentId
      documentType
    }
  }
}
    `;

export const useGetIssuerQuery = <TData = GetIssuerQuery, TError = unknown>(
  client: GraphQLClient,
  variables: GetIssuerQueryVariables,
  options?: Omit<UseQueryOptions<GetIssuerQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetIssuerQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetIssuerQuery, TError, TData>({
    queryKey: ['GetIssuer', variables],
    queryFn: fetcher<GetIssuerQuery, GetIssuerQueryVariables>(client, GetIssuerDocument, variables, headers),
    ...options,
  });
};

useGetIssuerQuery.document = GetIssuerDocument;

useGetIssuerQuery.getKey = (variables: GetIssuerQueryVariables) => ['GetIssuer', variables];

useGetIssuerQuery.fetcher = (
  client: GraphQLClient,
  variables: GetIssuerQueryVariables,
  headers?: RequestInit['headers']
) => fetcher<GetIssuerQuery, GetIssuerQueryVariables>(client, GetIssuerDocument, variables, headers);

export const GetHolderDocument = `
    query GetHolder($id: ID!) {
  holder(id: $id) {
    id
    address
    documents(first: 5) {
      id
      documentId
      documentType
    }
  }
}
    `;

export const useGetHolderQuery = <TData = GetHolderQuery, TError = unknown>(
  client: GraphQLClient,
  variables: GetHolderQueryVariables,
  options?: Omit<UseQueryOptions<GetHolderQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetHolderQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetHolderQuery, TError, TData>({
    queryKey: ['GetHolder', variables],
    queryFn: fetcher<GetHolderQuery, GetHolderQueryVariables>(client, GetHolderDocument, variables, headers),
    ...options,
  });
};

useGetHolderQuery.document = GetHolderDocument;

useGetHolderQuery.getKey = (variables: GetHolderQueryVariables) => ['GetHolder', variables];

useGetHolderQuery.fetcher = (
  client: GraphQLClient,
  variables: GetHolderQueryVariables,
  headers?: RequestInit['headers']
) => fetcher<GetHolderQuery, GetHolderQueryVariables>(client, GetHolderDocument, variables, headers);

export const GetDocumentsCountDocument = `
    query GetDocumentsCount {
  documentsCount
}
    `;

export const useGetDocumentsCountQuery = <TData = GetDocumentsCountQuery, TError = unknown>(
  client: GraphQLClient,
  variables?: GetDocumentsCountQueryVariables,
  options?: Omit<UseQueryOptions<GetDocumentsCountQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetDocumentsCountQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetDocumentsCountQuery, TError, TData>({
    queryKey: variables === undefined ? ['GetDocumentsCount'] : ['GetDocumentsCount', variables],
    queryFn: fetcher<GetDocumentsCountQuery, GetDocumentsCountQueryVariables>(
      client,
      GetDocumentsCountDocument,
      variables,
      headers
    ),
    ...options,
  });
};

useGetDocumentsCountQuery.document = GetDocumentsCountDocument;

useGetDocumentsCountQuery.getKey = (variables?: GetDocumentsCountQueryVariables) =>
  variables === undefined ? ['GetDocumentsCount'] : ['GetDocumentsCount', variables];

useGetDocumentsCountQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetDocumentsCountQueryVariables,
  headers?: RequestInit['headers']
) =>
  fetcher<GetDocumentsCountQuery, GetDocumentsCountQueryVariables>(
    client,
    GetDocumentsCountDocument,
    variables,
    headers
  );

export const GetIssuersDocument = `
    query GetIssuers($first: Int = 10, $skip: Int = 0) {
  issuers(first: $first, skip: $skip) {
    id
    address
    isActive
    registeredAt
  }
}
    `;

export const useGetIssuersQuery = <TData = GetIssuersQuery, TError = unknown>(
  client: GraphQLClient,
  variables?: GetIssuersQueryVariables,
  options?: Omit<UseQueryOptions<GetIssuersQuery, TError, TData>, 'queryKey'> & {
    queryKey?: UseQueryOptions<GetIssuersQuery, TError, TData>['queryKey'];
  },
  headers?: RequestInit['headers']
) => {
  return useQuery<GetIssuersQuery, TError, TData>({
    queryKey: variables === undefined ? ['GetIssuers'] : ['GetIssuers', variables],
    queryFn: fetcher<GetIssuersQuery, GetIssuersQueryVariables>(client, GetIssuersDocument, variables, headers),
    ...options,
  });
};

useGetIssuersQuery.document = GetIssuersDocument;

useGetIssuersQuery.getKey = (variables?: GetIssuersQueryVariables) =>
  variables === undefined ? ['GetIssuers'] : ['GetIssuers', variables];

useGetIssuersQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetIssuersQueryVariables,
  headers?: RequestInit['headers']
) => fetcher<GetIssuersQuery, GetIssuersQueryVariables>(client, GetIssuersDocument, variables, headers);
