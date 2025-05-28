import { GraphQLClient } from "graphql-request";
// RequestInit type is defined inline
type RequestInit = { headers?: Record<string, string> };
import {
  useQuery,
  useInfiniteQuery,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";
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
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };

function fetcher<TData, TVariables extends { [key: string]: any }>(
  client: GraphQLClient,
  query: string,
  variables?: TVariables,
  requestHeaders?: RequestInit["headers"],
) {
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
  __typename?: "AgeVerification";
  caller: Scalars["Bytes"]["output"];
  documentId?: Maybe<Scalars["Bytes"]["output"]>;
  id: Scalars["ID"]["output"];
  pubSignals: Array<Scalars["BigInt"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp: Scalars["BigInt"]["output"];
  verifier: Verifier;
};

export type Authentication = {
  __typename?: "Authentication";
  did: Did;
  id: Scalars["ID"]["output"];
  role: Scalars["Bytes"]["output"];
  successful: Scalars["Boolean"]["output"];
  timestamp: Scalars["BigInt"]["output"];
};

export enum ConsentStatus {
  Granted = "GRANTED",
  Pending = "PENDING",
  Rejected = "REJECTED",
}

export type Credential = {
  __typename?: "Credential";
  credentialId: Scalars["Bytes"]["output"];
  credentialType: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  issuedAt: Scalars["BigInt"]["output"];
  issuer: Scalars["Bytes"]["output"];
  subject: Did;
  verified?: Maybe<Scalars["Boolean"]["output"]>;
  verifiedAt?: Maybe<Scalars["BigInt"]["output"]>;
};

export type Did = {
  __typename?: "DID";
  active: Scalars["Boolean"]["output"];
  controller: Scalars["Bytes"]["output"];
  credentials: Array<Credential>;
  did: Scalars["String"]["output"];
  document?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  lastUpdated: Scalars["BigInt"]["output"];
  publicKey?: Maybe<Scalars["String"]["output"]>;
  roles: Array<Role>;
};

export type DidHolder = {
  __typename?: "DidHolder";
  did: Did;
  holder: Holder;
  id: Scalars["ID"]["output"];
};

export type Document = {
  __typename?: "Document";
  documentId: Scalars["Bytes"]["output"];
  documentType: DocumentType;
  expirationDate: Scalars["BigInt"]["output"];
  holder: Holder;
  id: Scalars["ID"]["output"];
  isExpired: Scalars["Boolean"]["output"];
  isVerified: Scalars["Boolean"]["output"];
  issuanceDate: Scalars["BigInt"]["output"];
  issuer: Issuer;
  previousVersion?: Maybe<Document>;
  registeredAt: Scalars["BigInt"]["output"];
  shareRequests: Array<ShareRequest>;
  updates: Array<Document>;
  verificationRequests: Array<VerificationRequest>;
  verifiedAt?: Maybe<Scalars["BigInt"]["output"]>;
  verifiedBy?: Maybe<Scalars["Bytes"]["output"]>;
};

export type DocumentFilterInput = {
  documentType?: InputMaybe<DocumentType>;
  isVerified?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export enum DocumentType {
  BirthCertificate = "BIRTH_CERTIFICATE",
  DeathCertificate = "DEATH_CERTIFICATE",
  Generic = "GENERIC",
  IdCard = "ID_CARD",
  MarriageCertificate = "MARRIAGE_CERTIFICATE",
  Other = "OTHER",
  Passport = "PASSPORT",
}

export type FhirVerification = Verification & {
  __typename?: "FhirVerification";
  caller: Scalars["Bytes"]["output"];
  documentId?: Maybe<Scalars["Bytes"]["output"]>;
  id: Scalars["ID"]["output"];
  pubSignals: Array<Scalars["BigInt"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp: Scalars["BigInt"]["output"];
  verifier: Verifier;
};

export type HashVerification = Verification & {
  __typename?: "HashVerification";
  caller: Scalars["Bytes"]["output"];
  documentId?: Maybe<Scalars["Bytes"]["output"]>;
  id: Scalars["ID"]["output"];
  pubSignals: Array<Scalars["BigInt"]["output"]>;
  success: Scalars["Boolean"]["output"];
  timestamp: Scalars["BigInt"]["output"];
  verifier: Verifier;
};

export type Holder = {
  __typename?: "Holder";
  address: Scalars["Bytes"]["output"];
  documents: Array<Document>;
  id: Scalars["ID"]["output"];
  shareRequests: Array<ShareRequest>;
  verificationRequests: Array<VerificationRequest>;
};

export type HolderDocumentsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type HolderShareRequestsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type HolderVerificationRequestsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Issuer = {
  __typename?: "Issuer";
  activatedAt?: Maybe<Scalars["BigInt"]["output"]>;
  address: Scalars["Bytes"]["output"];
  deactivatedAt?: Maybe<Scalars["BigInt"]["output"]>;
  documents: Array<Document>;
  id: Scalars["ID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  registeredAt: Scalars["BigInt"]["output"];
};

export type IssuerDocumentsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  ping?: Maybe<Scalars["String"]["output"]>;
};

export type Query = {
  __typename?: "Query";
  did?: Maybe<Did>;
  dids?: Maybe<Array<Did>>;
  document?: Maybe<Document>;
  documents?: Maybe<Array<Document>>;
  documentsCount?: Maybe<Scalars["Int"]["output"]>;
  holder?: Maybe<Holder>;
  holders?: Maybe<Array<Holder>>;
  holdersCount?: Maybe<Scalars["Int"]["output"]>;
  issuer?: Maybe<Issuer>;
  issuers?: Maybe<Array<Issuer>>;
  issuersCount?: Maybe<Scalars["Int"]["output"]>;
  verifier?: Maybe<Verifier>;
  verifiers?: Maybe<Array<Verifier>>;
};

export type QueryDidArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDidsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryDocumentArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryDocumentsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
  where?: InputMaybe<DocumentFilterInput>;
};

export type QueryHolderArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryHoldersArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryIssuerArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryIssuersArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type QueryVerifierArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryVerifiersArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Role = {
  __typename?: "Role";
  did: Did;
  granted: Scalars["Boolean"]["output"];
  grantedAt: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  revokedAt?: Maybe<Scalars["BigInt"]["output"]>;
  role: Scalars["Bytes"]["output"];
};

export type ShareRequest = {
  __typename?: "ShareRequest";
  document: Document;
  grantedAt?: Maybe<Scalars["BigInt"]["output"]>;
  holder: Holder;
  id: Scalars["ID"]["output"];
  requestedAt: Scalars["BigInt"]["output"];
  requester: Scalars["Bytes"]["output"];
  revokedAt?: Maybe<Scalars["BigInt"]["output"]>;
  status: ConsentStatus;
  validUntil?: Maybe<Scalars["BigInt"]["output"]>;
};

export type TrustedIssuer = {
  __typename?: "TrustedIssuer";
  credentialType: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  issuer: Scalars["Bytes"]["output"];
  trusted: Scalars["Boolean"]["output"];
  updatedAt: Scalars["BigInt"]["output"];
};

export type Verification = {
  id: Scalars["ID"]["output"];
  success: Scalars["Boolean"]["output"];
  timestamp: Scalars["BigInt"]["output"];
  verifier: Verifier;
};

export type VerificationRequest = {
  __typename?: "VerificationRequest";
  document: Document;
  holder: Holder;
  id: Scalars["ID"]["output"];
  requestedAt: Scalars["BigInt"]["output"];
  verified: Scalars["Boolean"]["output"];
  verifiedAt?: Maybe<Scalars["BigInt"]["output"]>;
};

export type Verifier = {
  __typename?: "Verifier";
  address: Scalars["Bytes"]["output"];
  createdAt: Scalars["BigInt"]["output"];
  id: Scalars["ID"]["output"];
  owner: Scalars["Bytes"]["output"];
  verifications: Array<Verification>;
  verifierType: Scalars["String"]["output"];
};

export type GetDocumentsQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetDocumentsQuery = {
  __typename?: "Query";
  documents?: Array<{
    __typename?: "Document";
    id: string;
    documentId: string;
    documentType: DocumentType;
    issuanceDate: string;
    expirationDate: string;
    isVerified: boolean;
    issuer: { __typename?: "Issuer"; id: string; address: string };
    holder: { __typename?: "Holder"; id: string; address: string };
  }> | null;
};

export type GetDocumentsByHolderQueryVariables = Exact<{
  holderId: Scalars["ID"]["input"];
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetDocumentsByHolderQuery = {
  __typename?: "Query";
  holder?: {
    __typename?: "Holder";
    documents: Array<{
      __typename?: "Document";
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
        __typename?: "Issuer";
        id: string;
        address: string;
        isActive: boolean;
      };
    }>;
  } | null;
};

export type GetDocumentQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetDocumentQuery = {
  __typename?: "Query";
  document?: {
    __typename?: "Document";
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
      __typename?: "Issuer";
      id: string;
      address: string;
      isActive: boolean;
    };
    holder: { __typename?: "Holder"; id: string; address: string };
  } | null;
};

export type GetIssuerQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetIssuerQuery = {
  __typename?: "Query";
  issuer?: {
    __typename?: "Issuer";
    id: string;
    address: string;
    isActive: boolean;
    registeredAt: string;
    activatedAt?: string | null;
    deactivatedAt?: string | null;
    documents: Array<{
      __typename?: "Document";
      id: string;
      documentId: string;
      documentType: DocumentType;
    }>;
  } | null;
};

export type GetHolderQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetHolderQuery = {
  __typename?: "Query";
  holder?: {
    __typename?: "Holder";
    id: string;
    address: string;
    documents: Array<{
      __typename?: "Document";
      id: string;
      documentId: string;
      documentType: DocumentType;
    }>;
  } | null;
};

export type GetDocumentsCountQueryVariables = Exact<{ [key: string]: never }>;

export type GetDocumentsCountQuery = {
  __typename?: "Query";
  documentsCount?: number | null;
};

export type GetIssuersQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetIssuersQuery = {
  __typename?: "Query";
  issuers?: Array<{
    __typename?: "Issuer";
    id: string;
    address: string;
    isActive: boolean;
    registeredAt: string;
  }> | null;
};

export type GetDidQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetDidQuery = {
  __typename?: "Query";
  did?: {
    __typename?: "DID";
    id: string;
    did: string;
    active: boolean;
    controller: string;
    lastUpdated: string;
    publicKey?: string | null;
    document?: string | null;
    roles: Array<{
      __typename?: "Role";
      id: string;
      role: string;
      granted: boolean;
      grantedAt: string;
      revokedAt?: string | null;
    }>;
    credentials: Array<{
      __typename?: "Credential";
      id: string;
      credentialId: string;
      credentialType: string;
      issuer: string;
      issuedAt: string;
      verified?: boolean | null;
      verifiedAt?: string | null;
    }>;
  } | null;
};

export type GetDiDsQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetDiDsQuery = {
  __typename?: "Query";
  dids?: Array<{
    __typename?: "DID";
    id: string;
    did: string;
    active: boolean;
    controller: string;
    lastUpdated: string;
    publicKey?: string | null;
    roles: Array<{
      __typename?: "Role";
      id: string;
      role: string;
      granted: boolean;
      grantedAt: string;
    }>;
  }> | null;
};

export type GetVerifierQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetVerifierQuery = {
  __typename?: "Query";
  verifier?: {
    __typename?: "Verifier";
    id: string;
    address: string;
    verifierType: string;
    owner: string;
    createdAt: string;
    verifications: Array<
      | {
          __typename?: "AgeVerification";
          id: string;
          timestamp: string;
          success: boolean;
        }
      | {
          __typename?: "FhirVerification";
          id: string;
          timestamp: string;
          success: boolean;
        }
      | {
          __typename?: "HashVerification";
          id: string;
          timestamp: string;
          success: boolean;
        }
    >;
  } | null;
};

export type GetVerifiersQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetVerifiersQuery = {
  __typename?: "Query";
  verifiers?: Array<{
    __typename?: "Verifier";
    id: string;
    address: string;
    verifierType: string;
    owner: string;
    createdAt: string;
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

export const useGetDocumentsQuery = <
  TData = GetDocumentsQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables?: GetDocumentsQueryVariables,
  options?: Omit<
    UseQueryOptions<GetDocumentsQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetDocumentsQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetDocumentsQuery, TError, TData>({
    queryKey:
      variables === undefined ? ["GetDocuments"] : ["GetDocuments", variables],
    queryFn: fetcher<GetDocumentsQuery, GetDocumentsQueryVariables>(
      client,
      GetDocumentsDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetDocumentsQuery.document = GetDocumentsDocument;

useGetDocumentsQuery.getKey = (variables?: GetDocumentsQueryVariables) =>
  variables === undefined ? ["GetDocuments"] : ["GetDocuments", variables];

export const useInfiniteGetDocumentsQuery = <
  TData = InfiniteData<GetDocumentsQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDocumentsQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetDocumentsQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetDocumentsQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetDocumentsQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey:
          (optionsQueryKey ?? variables === undefined)
            ? ["GetDocuments.infinite"]
            : ["GetDocuments.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetDocumentsQuery, GetDocumentsQueryVariables>(
            client,
            GetDocumentsDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetDocumentsQuery.getKey = (
  variables?: GetDocumentsQueryVariables,
) =>
  variables === undefined
    ? ["GetDocuments.infinite"]
    : ["GetDocuments.infinite", variables];

useGetDocumentsQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetDocumentsQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetDocumentsQuery, GetDocumentsQueryVariables>(
    client,
    GetDocumentsDocument,
    variables,
    headers,
  );

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

export const useGetDocumentsByHolderQuery = <
  TData = GetDocumentsByHolderQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDocumentsByHolderQueryVariables,
  options?: Omit<
    UseQueryOptions<GetDocumentsByHolderQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetDocumentsByHolderQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetDocumentsByHolderQuery, TError, TData>({
    queryKey: ["GetDocumentsByHolder", variables],
    queryFn: fetcher<
      GetDocumentsByHolderQuery,
      GetDocumentsByHolderQueryVariables
    >(client, GetDocumentsByHolderDocument, variables, headers),
    ...options,
  });
};

useGetDocumentsByHolderQuery.document = GetDocumentsByHolderDocument;

useGetDocumentsByHolderQuery.getKey = (
  variables: GetDocumentsByHolderQueryVariables,
) => ["GetDocumentsByHolder", variables];

export const useInfiniteGetDocumentsByHolderQuery = <
  TData = InfiniteData<GetDocumentsByHolderQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDocumentsByHolderQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetDocumentsByHolderQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetDocumentsByHolderQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetDocumentsByHolderQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey: optionsQueryKey ?? [
          "GetDocumentsByHolder.infinite",
          variables,
        ],
        queryFn: (metaData) =>
          fetcher<
            GetDocumentsByHolderQuery,
            GetDocumentsByHolderQueryVariables
          >(
            client,
            GetDocumentsByHolderDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetDocumentsByHolderQuery.getKey = (
  variables: GetDocumentsByHolderQueryVariables,
) => ["GetDocumentsByHolder.infinite", variables];

useGetDocumentsByHolderQuery.fetcher = (
  client: GraphQLClient,
  variables: GetDocumentsByHolderQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<
    GetDocumentsByHolderQuery,
    GetDocumentsByHolderQueryVariables
  >(client, GetDocumentsByHolderDocument, variables, headers);

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

export const useGetDocumentQuery = <
  TData = GetDocumentQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDocumentQueryVariables,
  options?: Omit<
    UseQueryOptions<GetDocumentQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetDocumentQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetDocumentQuery, TError, TData>({
    queryKey: ["GetDocument", variables],
    queryFn: fetcher<GetDocumentQuery, GetDocumentQueryVariables>(
      client,
      GetDocumentDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetDocumentQuery.document = GetDocumentDocument;

useGetDocumentQuery.getKey = (variables: GetDocumentQueryVariables) => [
  "GetDocument",
  variables,
];

export const useInfiniteGetDocumentQuery = <
  TData = InfiniteData<GetDocumentQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDocumentQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetDocumentQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetDocumentQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetDocumentQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey: optionsQueryKey ?? ["GetDocument.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetDocumentQuery, GetDocumentQueryVariables>(
            client,
            GetDocumentDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetDocumentQuery.getKey = (
  variables: GetDocumentQueryVariables,
) => ["GetDocument.infinite", variables];

useGetDocumentQuery.fetcher = (
  client: GraphQLClient,
  variables: GetDocumentQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetDocumentQuery, GetDocumentQueryVariables>(
    client,
    GetDocumentDocument,
    variables,
    headers,
  );

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

export const useGetIssuerQuery = <TData = GetIssuerQuery, TError = Error>(
  client: GraphQLClient,
  variables: GetIssuerQueryVariables,
  options?: Omit<
    UseQueryOptions<GetIssuerQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<GetIssuerQuery, TError, TData>["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetIssuerQuery, TError, TData>({
    queryKey: ["GetIssuer", variables],
    queryFn: fetcher<GetIssuerQuery, GetIssuerQueryVariables>(
      client,
      GetIssuerDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetIssuerQuery.document = GetIssuerDocument;

useGetIssuerQuery.getKey = (variables: GetIssuerQueryVariables) => [
  "GetIssuer",
  variables,
];

export const useInfiniteGetIssuerQuery = <
  TData = InfiniteData<GetIssuerQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetIssuerQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetIssuerQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetIssuerQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetIssuerQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey: optionsQueryKey ?? ["GetIssuer.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetIssuerQuery, GetIssuerQueryVariables>(
            client,
            GetIssuerDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetIssuerQuery.getKey = (
  variables: GetIssuerQueryVariables,
) => ["GetIssuer.infinite", variables];

useGetIssuerQuery.fetcher = (
  client: GraphQLClient,
  variables: GetIssuerQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetIssuerQuery, GetIssuerQueryVariables>(
    client,
    GetIssuerDocument,
    variables,
    headers,
  );

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

export const useGetHolderQuery = <TData = GetHolderQuery, TError = Error>(
  client: GraphQLClient,
  variables: GetHolderQueryVariables,
  options?: Omit<
    UseQueryOptions<GetHolderQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<GetHolderQuery, TError, TData>["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetHolderQuery, TError, TData>({
    queryKey: ["GetHolder", variables],
    queryFn: fetcher<GetHolderQuery, GetHolderQueryVariables>(
      client,
      GetHolderDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetHolderQuery.document = GetHolderDocument;

useGetHolderQuery.getKey = (variables: GetHolderQueryVariables) => [
  "GetHolder",
  variables,
];

export const useInfiniteGetHolderQuery = <
  TData = InfiniteData<GetHolderQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetHolderQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetHolderQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetHolderQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetHolderQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey: optionsQueryKey ?? ["GetHolder.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetHolderQuery, GetHolderQueryVariables>(
            client,
            GetHolderDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetHolderQuery.getKey = (
  variables: GetHolderQueryVariables,
) => ["GetHolder.infinite", variables];

useGetHolderQuery.fetcher = (
  client: GraphQLClient,
  variables: GetHolderQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetHolderQuery, GetHolderQueryVariables>(
    client,
    GetHolderDocument,
    variables,
    headers,
  );

export const GetDocumentsCountDocument = `
    query GetDocumentsCount {
  documentsCount
}
    `;

export const useGetDocumentsCountQuery = <
  TData = GetDocumentsCountQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables?: GetDocumentsCountQueryVariables,
  options?: Omit<
    UseQueryOptions<GetDocumentsCountQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetDocumentsCountQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetDocumentsCountQuery, TError, TData>({
    queryKey:
      variables === undefined
        ? ["GetDocumentsCount"]
        : ["GetDocumentsCount", variables],
    queryFn: fetcher<
      GetDocumentsCountQuery,
      GetDocumentsCountQueryVariables
    >(client, GetDocumentsCountDocument, variables, headers),
    ...options,
  });
};

useGetDocumentsCountQuery.document = GetDocumentsCountDocument;

useGetDocumentsCountQuery.getKey = (
  variables?: GetDocumentsCountQueryVariables,
) =>
  variables === undefined
    ? ["GetDocumentsCount"]
    : ["GetDocumentsCount", variables];

export const useInfiniteGetDocumentsCountQuery = <
  TData = InfiniteData<GetDocumentsCountQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDocumentsCountQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetDocumentsCountQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetDocumentsCountQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetDocumentsCountQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey:
          (optionsQueryKey ?? variables === undefined)
            ? ["GetDocumentsCount.infinite"]
            : ["GetDocumentsCount.infinite", variables],
        queryFn: (metaData) =>
          fetcher<
            GetDocumentsCountQuery,
            GetDocumentsCountQueryVariables
          >(
            client,
            GetDocumentsCountDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetDocumentsCountQuery.getKey = (
  variables?: GetDocumentsCountQueryVariables,
) =>
  variables === undefined
    ? ["GetDocumentsCount.infinite"]
    : ["GetDocumentsCount.infinite", variables];

useGetDocumentsCountQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetDocumentsCountQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetDocumentsCountQuery, GetDocumentsCountQueryVariables>(
    client,
    GetDocumentsCountDocument,
    variables,
    headers,
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

export const useGetIssuersQuery = <
  TData = GetIssuersQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables?: GetIssuersQueryVariables,
  options?: Omit<
    UseQueryOptions<GetIssuersQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetIssuersQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetIssuersQuery, TError, TData>({
    queryKey:
      variables === undefined ? ["GetIssuers"] : ["GetIssuers", variables],
    queryFn: fetcher<GetIssuersQuery, GetIssuersQueryVariables>(
      client,
      GetIssuersDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetIssuersQuery.document = GetIssuersDocument;

useGetIssuersQuery.getKey = (variables?: GetIssuersQueryVariables) =>
  variables === undefined ? ["GetIssuers"] : ["GetIssuers", variables];

export const useInfiniteGetIssuersQuery = <
  TData = InfiniteData<GetIssuersQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetIssuersQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetIssuersQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetIssuersQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetIssuersQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey:
          (optionsQueryKey ?? variables === undefined)
            ? ["GetIssuers.infinite"]
            : ["GetIssuers.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetIssuersQuery, GetIssuersQueryVariables>(
            client,
            GetIssuersDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetIssuersQuery.getKey = (
  variables?: GetIssuersQueryVariables,
) =>
  variables === undefined
    ? ["GetIssuers.infinite"]
    : ["GetIssuers.infinite", variables];

useGetIssuersQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetIssuersQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetIssuersQuery, GetIssuersQueryVariables>(
    client,
    GetIssuersDocument,
    variables,
    headers,
  );

export const GetDidDocument = `
    query GetDID($id: ID!) {
  did(id: $id) {
    id
    did
    active
    controller
    lastUpdated
    publicKey
    document
    roles {
      id
      role
      granted
      grantedAt
      revokedAt
    }
    credentials {
      id
      credentialId
      credentialType
      issuer
      issuedAt
      verified
      verifiedAt
    }
  }
}
    `;

export const useGetDidQuery = <TData = GetDidQuery, TError = Error>(
  client: GraphQLClient,
  variables: GetDidQueryVariables,
  options?: Omit<
    UseQueryOptions<GetDidQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<GetDidQuery, TError, TData>["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetDidQuery, TError, TData>({
    queryKey: ["GetDID", variables],
    queryFn: fetcher<GetDidQuery, GetDidQueryVariables>(
      client,
      GetDidDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetDidQuery.document = GetDidDocument;

useGetDidQuery.getKey = (variables: GetDidQueryVariables) => [
  "GetDID",
  variables,
];

export const useInfiniteGetDidQuery = <
  TData = InfiniteData<GetDidQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDidQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetDidQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetDidQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetDidQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey: optionsQueryKey ?? ["GetDID.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetDidQuery, GetDidQueryVariables>(
            client,
            GetDidDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetDidQuery.getKey = (variables: GetDidQueryVariables) => [
  "GetDID.infinite",
  variables,
];

useGetDidQuery.fetcher = (
  client: GraphQLClient,
  variables: GetDidQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetDidQuery, GetDidQueryVariables>(
    client,
    GetDidDocument,
    variables,
    headers,
  );

export const GetDiDsDocument = `
    query GetDIDs($first: Int = 10, $skip: Int = 0) {
  dids(first: $first, skip: $skip) {
    id
    did
    active
    controller
    lastUpdated
    publicKey
    roles {
      id
      role
      granted
      grantedAt
    }
  }
}
    `;

export const useGetDiDsQuery = <TData = GetDiDsQuery, TError = Error>(
  client: GraphQLClient,
  variables?: GetDiDsQueryVariables,
  options?: Omit<
    UseQueryOptions<GetDiDsQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<GetDiDsQuery, TError, TData>["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetDiDsQuery, TError, TData>({
    queryKey: variables === undefined ? ["GetDIDs"] : ["GetDIDs", variables],
    queryFn: fetcher<GetDiDsQuery, GetDiDsQueryVariables>(
      client,
      GetDiDsDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetDiDsQuery.document = GetDiDsDocument;

useGetDiDsQuery.getKey = (variables?: GetDiDsQueryVariables) =>
  variables === undefined ? ["GetDIDs"] : ["GetDIDs", variables];

export const useInfiniteGetDiDsQuery = <
  TData = InfiniteData<GetDiDsQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetDiDsQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetDiDsQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetDiDsQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetDiDsQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey:
          (optionsQueryKey ?? variables === undefined)
            ? ["GetDIDs.infinite"]
            : ["GetDIDs.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetDiDsQuery, GetDiDsQueryVariables>(
            client,
            GetDiDsDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetDiDsQuery.getKey = (variables?: GetDiDsQueryVariables) =>
  variables === undefined
    ? ["GetDIDs.infinite"]
    : ["GetDIDs.infinite", variables];

useGetDiDsQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetDiDsQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetDiDsQuery, GetDiDsQueryVariables>(
    client,
    GetDiDsDocument,
    variables,
    headers,
  );

export const GetVerifierDocument = `
    query GetVerifier($id: ID!) {
  verifier(id: $id) {
    id
    address
    verifierType
    owner
    createdAt
    verifications {
      id
      timestamp
      success
    }
  }
}
    `;

export const useGetVerifierQuery = <
  TData = GetVerifierQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetVerifierQueryVariables,
  options?: Omit<
    UseQueryOptions<GetVerifierQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetVerifierQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetVerifierQuery, TError, TData>({
    queryKey: ["GetVerifier", variables],
    queryFn: fetcher<GetVerifierQuery, GetVerifierQueryVariables>(
      client,
      GetVerifierDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetVerifierQuery.document = GetVerifierDocument;

useGetVerifierQuery.getKey = (variables: GetVerifierQueryVariables) => [
  "GetVerifier",
  variables,
];

export const useInfiniteGetVerifierQuery = <
  TData = InfiniteData<GetVerifierQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetVerifierQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetVerifierQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetVerifierQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetVerifierQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey: optionsQueryKey ?? ["GetVerifier.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetVerifierQuery, GetVerifierQueryVariables>(
            client,
            GetVerifierDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetVerifierQuery.getKey = (
  variables: GetVerifierQueryVariables,
) => ["GetVerifier.infinite", variables];

useGetVerifierQuery.fetcher = (
  client: GraphQLClient,
  variables: GetVerifierQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetVerifierQuery, GetVerifierQueryVariables>(
    client,
    GetVerifierDocument,
    variables,
    headers,
  );

export const GetVerifiersDocument = `
    query GetVerifiers($first: Int = 10, $skip: Int = 0) {
  verifiers(first: $first, skip: $skip) {
    id
    address
    verifierType
    owner
    createdAt
  }
}
    `;

export const useGetVerifiersQuery = <
  TData = GetVerifiersQuery,
  TError = Error,
>(
  client: GraphQLClient,
  variables?: GetVerifiersQueryVariables,
  options?: Omit<
    UseQueryOptions<GetVerifiersQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseQueryOptions<
      GetVerifiersQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useQuery<GetVerifiersQuery, TError, TData>({
    queryKey:
      variables === undefined ? ["GetVerifiers"] : ["GetVerifiers", variables],
    queryFn: fetcher<GetVerifiersQuery, GetVerifiersQueryVariables>(
      client,
      GetVerifiersDocument,
      variables,
      headers,
    ),
    ...options,
  });
};

useGetVerifiersQuery.document = GetVerifiersDocument;

useGetVerifiersQuery.getKey = (variables?: GetVerifiersQueryVariables) =>
  variables === undefined ? ["GetVerifiers"] : ["GetVerifiers", variables];

export const useInfiniteGetVerifiersQuery = <
  TData = InfiniteData<GetVerifiersQuery>,
  TError = Error,
>(
  client: GraphQLClient,
  variables: GetVerifiersQueryVariables,
  options: Omit<
    UseInfiniteQueryOptions<GetVerifiersQuery, TError, TData>,
    "queryKey"
  > & {
    queryKey?: UseInfiniteQueryOptions<
      GetVerifiersQuery,
      TError,
      TData
    >["queryKey"];
  },
  headers?: RequestInit["headers"],
) => {
  return useInfiniteQuery<GetVerifiersQuery, TError, TData>(
    (() => {
      const { queryKey: optionsQueryKey, ...restOptions } = options;
      return {
        queryKey:
          (optionsQueryKey ?? variables === undefined)
            ? ["GetVerifiers.infinite"]
            : ["GetVerifiers.infinite", variables],
        queryFn: (metaData) =>
          fetcher<GetVerifiersQuery, GetVerifiersQueryVariables>(
            client,
            GetVerifiersDocument,
            { ...variables, ...(metaData.pageParam ?? {}) },
            headers,
          )(),
        ...restOptions,
      };
    })(),
  );
};

useInfiniteGetVerifiersQuery.getKey = (
  variables?: GetVerifiersQueryVariables,
) =>
  variables === undefined
    ? ["GetVerifiers.infinite"]
    : ["GetVerifiers.infinite", variables];

useGetVerifiersQuery.fetcher = (
  client: GraphQLClient,
  variables?: GetVerifiersQueryVariables,
  headers?: RequestInit["headers"],
) =>
  fetcher<GetVerifiersQuery, GetVerifiersQueryVariables>(
    client,
    GetVerifiersDocument,
    variables,
    headers,
  );
