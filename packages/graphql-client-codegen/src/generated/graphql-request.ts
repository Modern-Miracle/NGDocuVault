import { GraphQLClient, RequestOptions } from "graphql-request";
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
type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];
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
export const GetDocumentsCountDocument = `
    query GetDocumentsCount {
  documentsCount
}
    `;
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

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    GetDocuments(
      variables?: GetDocumentsQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetDocumentsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDocumentsQuery>(GetDocumentsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetDocuments",
        "query",
        variables,
      );
    },
    GetDocumentsByHolder(
      variables: GetDocumentsByHolderQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetDocumentsByHolderQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDocumentsByHolderQuery>(
            GetDocumentsByHolderDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "GetDocumentsByHolder",
        "query",
        variables,
      );
    },
    GetDocument(
      variables: GetDocumentQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetDocumentQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDocumentQuery>(GetDocumentDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetDocument",
        "query",
        variables,
      );
    },
    GetIssuer(
      variables: GetIssuerQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetIssuerQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetIssuerQuery>(GetIssuerDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetIssuer",
        "query",
        variables,
      );
    },
    GetHolder(
      variables: GetHolderQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetHolderQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetHolderQuery>(GetHolderDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetHolder",
        "query",
        variables,
      );
    },
    GetDocumentsCount(
      variables?: GetDocumentsCountQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetDocumentsCountQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetDocumentsCountQuery>(
            GetDocumentsCountDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "GetDocumentsCount",
        "query",
        variables,
      );
    },
    GetIssuers(
      variables?: GetIssuersQueryVariables,
      requestHeaders?: GraphQLClientRequestHeaders,
    ): Promise<GetIssuersQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<GetIssuersQuery>(GetIssuersDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders,
          }),
        "GetIssuers",
        "query",
        variables,
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
