export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
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
  documents?:
    | Array<{
        __typename?: "Document";
        id: string;
        documentId: string;
        documentType: DocumentType;
        issuanceDate: string;
        expirationDate: string;
        isVerified: boolean;
        issuer: { __typename?: "Issuer"; id: string; address: string };
        holder: { __typename?: "Holder"; id: string; address: string };
      }>
    | null
    | undefined;
};

export type GetDocumentsByHolderQueryVariables = Exact<{
  holderId: Scalars["ID"]["input"];
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetDocumentsByHolderQuery = {
  __typename?: "Query";
  holder?:
    | {
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
          verifiedAt?: string | null | undefined;
          verifiedBy?: string | null | undefined;
          issuer: {
            __typename?: "Issuer";
            id: string;
            address: string;
            isActive: boolean;
          };
        }>;
      }
    | null
    | undefined;
};

export type GetDocumentQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetDocumentQuery = {
  __typename?: "Query";
  document?:
    | {
        __typename?: "Document";
        id: string;
        documentId: string;
        issuanceDate: string;
        expirationDate: string;
        isVerified: boolean;
        documentType: DocumentType;
        isExpired: boolean;
        registeredAt: string;
        verifiedAt?: string | null | undefined;
        verifiedBy?: string | null | undefined;
        issuer: {
          __typename?: "Issuer";
          id: string;
          address: string;
          isActive: boolean;
        };
        holder: { __typename?: "Holder"; id: string; address: string };
      }
    | null
    | undefined;
};

export type GetIssuerQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetIssuerQuery = {
  __typename?: "Query";
  issuer?:
    | {
        __typename?: "Issuer";
        id: string;
        address: string;
        isActive: boolean;
        registeredAt: string;
        activatedAt?: string | null | undefined;
        deactivatedAt?: string | null | undefined;
        documents: Array<{
          __typename?: "Document";
          id: string;
          documentId: string;
          documentType: DocumentType;
        }>;
      }
    | null
    | undefined;
};

export type GetHolderQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetHolderQuery = {
  __typename?: "Query";
  holder?:
    | {
        __typename?: "Holder";
        id: string;
        address: string;
        documents: Array<{
          __typename?: "Document";
          id: string;
          documentId: string;
          documentType: DocumentType;
        }>;
      }
    | null
    | undefined;
};

export type GetDocumentsCountQueryVariables = Exact<{ [key: string]: never }>;

export type GetDocumentsCountQuery = {
  __typename?: "Query";
  documentsCount?: number | null | undefined;
};

export type GetIssuersQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetIssuersQuery = {
  __typename?: "Query";
  issuers?:
    | Array<{
        __typename?: "Issuer";
        id: string;
        address: string;
        isActive: boolean;
        registeredAt: string;
      }>
    | null
    | undefined;
};

export type GetDidQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetDidQuery = {
  __typename?: "Query";
  did?:
    | {
        __typename?: "DID";
        id: string;
        did: string;
        active: boolean;
        controller: string;
        lastUpdated: string;
        publicKey?: string | null | undefined;
        document?: string | null | undefined;
        roles: Array<{
          __typename?: "Role";
          id: string;
          role: string;
          granted: boolean;
          grantedAt: string;
          revokedAt?: string | null | undefined;
        }>;
        credentials: Array<{
          __typename?: "Credential";
          id: string;
          credentialId: string;
          credentialType: string;
          issuer: string;
          issuedAt: string;
          verified?: boolean | null | undefined;
          verifiedAt?: string | null | undefined;
        }>;
      }
    | null
    | undefined;
};

export type GetDiDsQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetDiDsQuery = {
  __typename?: "Query";
  dids?:
    | Array<{
        __typename?: "DID";
        id: string;
        did: string;
        active: boolean;
        controller: string;
        lastUpdated: string;
        publicKey?: string | null | undefined;
        roles: Array<{
          __typename?: "Role";
          id: string;
          role: string;
          granted: boolean;
          grantedAt: string;
        }>;
      }>
    | null
    | undefined;
};

export type GetVerifierQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type GetVerifierQuery = {
  __typename?: "Query";
  verifier?:
    | {
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
      }
    | null
    | undefined;
};

export type GetVerifiersQueryVariables = Exact<{
  first?: InputMaybe<Scalars["Int"]["input"]>;
  skip?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type GetVerifiersQuery = {
  __typename?: "Query";
  verifiers?:
    | Array<{
        __typename?: "Verifier";
        id: string;
        address: string;
        verifierType: string;
        owner: string;
        createdAt: string;
      }>
    | null
    | undefined;
};
