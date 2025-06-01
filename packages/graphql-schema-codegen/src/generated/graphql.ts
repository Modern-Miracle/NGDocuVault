import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import {
  DocumentModel,
  IssuerModel,
  HolderModel,
  ShareRequestModel,
  VerificationRequestModel,
  DIDModel,
  VerifierModel,
  GraphQLContext,
} from '../types';
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
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
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
  caller: Scalars['Bytes']['output'];
  documentId?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  pubSignals: Array<Scalars['BigInt']['output']>;
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type Authentication = {
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
  did: Did;
  holder: Holder;
  id: Scalars['ID']['output'];
};

export type Document = {
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
  caller: Scalars['Bytes']['output'];
  documentId?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  pubSignals: Array<Scalars['BigInt']['output']>;
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type HashVerification = Verification & {
  caller: Scalars['Bytes']['output'];
  documentId?: Maybe<Scalars['Bytes']['output']>;
  id: Scalars['ID']['output'];
  pubSignals: Array<Scalars['BigInt']['output']>;
  success: Scalars['Boolean']['output'];
  timestamp: Scalars['BigInt']['output'];
  verifier: Verifier;
};

export type Holder = {
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
  ping?: Maybe<Scalars['String']['output']>;
};

export type Query = {
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
  did: Did;
  granted: Scalars['Boolean']['output'];
  grantedAt: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  revokedAt?: Maybe<Scalars['BigInt']['output']>;
  role: Scalars['Bytes']['output'];
};

export type ShareRequest = {
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
  document: Document;
  holder: Holder;
  id: Scalars['ID']['output'];
  requestedAt: Scalars['BigInt']['output'];
  verified: Scalars['Boolean']['output'];
  verifiedAt?: Maybe<Scalars['BigInt']['output']>;
};

export type Verifier = {
  address: Scalars['Bytes']['output'];
  createdAt: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  owner: Scalars['Bytes']['output'];
  verifications: Array<Verification>;
  verifierType: Scalars['String']['output'];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  Verification:
    | (Omit<AgeVerification, 'verifier'> & { verifier: _RefType['Verifier'] })
    | (Omit<FhirVerification, 'verifier'> & {
        verifier: _RefType['Verifier'];
      })
    | (Omit<HashVerification, 'verifier'> & {
        verifier: _RefType['Verifier'];
      });
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AgeVerification: ResolverTypeWrapper<Omit<AgeVerification, 'verifier'> & { verifier: ResolversTypes['Verifier'] }>;
  Authentication: ResolverTypeWrapper<Omit<Authentication, 'did'> & { did: ResolversTypes['DID'] }>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']['output']>;
  ConsentStatus: ConsentStatus;
  Credential: ResolverTypeWrapper<Omit<Credential, 'subject'> & { subject: ResolversTypes['DID'] }>;
  DID: ResolverTypeWrapper<DIDModel>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DidHolder: ResolverTypeWrapper<
    Omit<DidHolder, 'did' | 'holder'> & {
      did: ResolversTypes['DID'];
      holder: ResolversTypes['Holder'];
    }
  >;
  Document: ResolverTypeWrapper<DocumentModel>;
  DocumentFilterInput: DocumentFilterInput;
  DocumentType: DocumentType;
  FhirVerification: ResolverTypeWrapper<
    Omit<FhirVerification, 'verifier'> & {
      verifier: ResolversTypes['Verifier'];
    }
  >;
  HashVerification: ResolverTypeWrapper<
    Omit<HashVerification, 'verifier'> & {
      verifier: ResolversTypes['Verifier'];
    }
  >;
  Holder: ResolverTypeWrapper<HolderModel>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Issuer: ResolverTypeWrapper<IssuerModel>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  Role: ResolverTypeWrapper<Omit<Role, 'did'> & { did: ResolversTypes['DID'] }>;
  ShareRequest: ResolverTypeWrapper<ShareRequestModel>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TrustedIssuer: ResolverTypeWrapper<TrustedIssuer>;
  Verification: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Verification']>;
  VerificationRequest: ResolverTypeWrapper<VerificationRequestModel>;
  Verifier: ResolverTypeWrapper<VerifierModel>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AgeVerification: Omit<AgeVerification, 'verifier'> & {
    verifier: ResolversParentTypes['Verifier'];
  };
  Authentication: Omit<Authentication, 'did'> & {
    did: ResolversParentTypes['DID'];
  };
  BigInt: Scalars['BigInt']['output'];
  Boolean: Scalars['Boolean']['output'];
  Bytes: Scalars['Bytes']['output'];
  Credential: Omit<Credential, 'subject'> & {
    subject: ResolversParentTypes['DID'];
  };
  DID: DIDModel;
  DateTime: Scalars['DateTime']['output'];
  DidHolder: Omit<DidHolder, 'did' | 'holder'> & {
    did: ResolversParentTypes['DID'];
    holder: ResolversParentTypes['Holder'];
  };
  Document: DocumentModel;
  DocumentFilterInput: DocumentFilterInput;
  FhirVerification: Omit<FhirVerification, 'verifier'> & {
    verifier: ResolversParentTypes['Verifier'];
  };
  HashVerification: Omit<HashVerification, 'verifier'> & {
    verifier: ResolversParentTypes['Verifier'];
  };
  Holder: HolderModel;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Issuer: IssuerModel;
  Mutation: {};
  Query: {};
  Role: Omit<Role, 'did'> & { did: ResolversParentTypes['DID'] };
  ShareRequest: ShareRequestModel;
  String: Scalars['String']['output'];
  TrustedIssuer: TrustedIssuer;
  Verification: ResolversInterfaceTypes<ResolversParentTypes>['Verification'];
  VerificationRequest: VerificationRequestModel;
  Verifier: VerifierModel;
};

export type AgeVerificationResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes['AgeVerification'],
> = {
  caller?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  documentId?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pubSignals?: Resolver<Array<ResolversTypes['BigInt']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verifier?: Resolver<ResolversTypes['Verifier'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthenticationResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes['Authentication'],
> = {
  did?: Resolver<ResolversTypes['DID'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  successful?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type CredentialResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Credential']> = {
  credentialId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  credentialType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  issuedAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['DID'], ParentType, ContextType>;
  verified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  verifiedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DidResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['DID']> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  controller?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  credentials?: Resolver<Array<ResolversTypes['Credential']>, ParentType, ContextType>;
  did?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  document?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdated?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  publicKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DidHolderResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['DidHolder']> = {
  did?: Resolver<ResolversTypes['DID'], ParentType, ContextType>;
  holder?: Resolver<ResolversTypes['Holder'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Document']> = {
  documentId?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  documentType?: Resolver<ResolversTypes['DocumentType'], ParentType, ContextType>;
  expirationDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  holder?: Resolver<ResolversTypes['Holder'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isExpired?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isVerified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  issuanceDate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['Issuer'], ParentType, ContextType>;
  previousVersion?: Resolver<Maybe<ResolversTypes['Document']>, ParentType, ContextType>;
  registeredAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  shareRequests?: Resolver<Array<ResolversTypes['ShareRequest']>, ParentType, ContextType>;
  updates?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType>;
  verificationRequests?: Resolver<Array<ResolversTypes['VerificationRequest']>, ParentType, ContextType>;
  verifiedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  verifiedBy?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FhirVerificationResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes['FhirVerification'],
> = {
  caller?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  documentId?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pubSignals?: Resolver<Array<ResolversTypes['BigInt']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verifier?: Resolver<ResolversTypes['Verifier'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HashVerificationResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes['HashVerification'],
> = {
  caller?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  documentId?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pubSignals?: Resolver<Array<ResolversTypes['BigInt']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verifier?: Resolver<ResolversTypes['Verifier'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HolderResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Holder']> = {
  address?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  documents?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType, Partial<HolderDocumentsArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  shareRequests?: Resolver<
    Array<ResolversTypes['ShareRequest']>,
    ParentType,
    ContextType,
    Partial<HolderShareRequestsArgs>
  >;
  verificationRequests?: Resolver<
    Array<ResolversTypes['VerificationRequest']>,
    ParentType,
    ContextType,
    Partial<HolderVerificationRequestsArgs>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IssuerResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Issuer']> = {
  activatedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  address?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  deactivatedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  documents?: Resolver<Array<ResolversTypes['Document']>, ParentType, ContextType, Partial<IssuerDocumentsArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  registeredAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Mutation']> = {
  ping?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Query']> = {
  did?: Resolver<Maybe<ResolversTypes['DID']>, ParentType, ContextType, RequireFields<QueryDidArgs, 'id'>>;
  dids?: Resolver<Maybe<Array<ResolversTypes['DID']>>, ParentType, ContextType, Partial<QueryDidsArgs>>;
  document?: Resolver<
    Maybe<ResolversTypes['Document']>,
    ParentType,
    ContextType,
    RequireFields<QueryDocumentArgs, 'id'>
  >;
  documents?: Resolver<Maybe<Array<ResolversTypes['Document']>>, ParentType, ContextType, Partial<QueryDocumentsArgs>>;
  documentsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  holder?: Resolver<Maybe<ResolversTypes['Holder']>, ParentType, ContextType, RequireFields<QueryHolderArgs, 'id'>>;
  holders?: Resolver<Maybe<Array<ResolversTypes['Holder']>>, ParentType, ContextType, Partial<QueryHoldersArgs>>;
  holdersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  issuer?: Resolver<Maybe<ResolversTypes['Issuer']>, ParentType, ContextType, RequireFields<QueryIssuerArgs, 'id'>>;
  issuers?: Resolver<Maybe<Array<ResolversTypes['Issuer']>>, ParentType, ContextType, Partial<QueryIssuersArgs>>;
  issuersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  verifier?: Resolver<
    Maybe<ResolversTypes['Verifier']>,
    ParentType,
    ContextType,
    RequireFields<QueryVerifierArgs, 'id'>
  >;
  verifiers?: Resolver<Maybe<Array<ResolversTypes['Verifier']>>, ParentType, ContextType, Partial<QueryVerifiersArgs>>;
};

export type RoleResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Role']> = {
  did?: Resolver<ResolversTypes['DID'], ParentType, ContextType>;
  granted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  grantedAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  revokedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareRequestResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['ShareRequest']> = {
  document?: Resolver<ResolversTypes['Document'], ParentType, ContextType>;
  grantedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  holder?: Resolver<ResolversTypes['Holder'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  requestedAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  requester?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  revokedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ConsentStatus'], ParentType, ContextType>;
  validUntil?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TrustedIssuerResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['TrustedIssuer']> = {
  credentialType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  issuer?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  trusted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VerificationResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Verification']> = {
  __resolveType: TypeResolveFn<'AgeVerification' | 'FhirVerification' | 'HashVerification', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verifier?: Resolver<ResolversTypes['Verifier'], ParentType, ContextType>;
};

export type VerificationRequestResolvers<
  ContextType = GraphQLContext,
  ParentType = ResolversParentTypes['VerificationRequest'],
> = {
  document?: Resolver<ResolversTypes['Document'], ParentType, ContextType>;
  holder?: Resolver<ResolversTypes['Holder'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  requestedAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  verified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  verifiedAt?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VerifierResolvers<ContextType = GraphQLContext, ParentType = ResolversParentTypes['Verifier']> = {
  address?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  verifications?: Resolver<Array<ResolversTypes['Verification']>, ParentType, ContextType>;
  verifierType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AgeVerification?: AgeVerificationResolvers<ContextType>;
  Authentication?: AuthenticationResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  Credential?: CredentialResolvers<ContextType>;
  DID?: DidResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DidHolder?: DidHolderResolvers<ContextType>;
  Document?: DocumentResolvers<ContextType>;
  FhirVerification?: FhirVerificationResolvers<ContextType>;
  HashVerification?: HashVerificationResolvers<ContextType>;
  Holder?: HolderResolvers<ContextType>;
  Issuer?: IssuerResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  ShareRequest?: ShareRequestResolvers<ContextType>;
  TrustedIssuer?: TrustedIssuerResolvers<ContextType>;
  Verification?: VerificationResolvers<ContextType>;
  VerificationRequest?: VerificationRequestResolvers<ContextType>;
  Verifier?: VerifierResolvers<ContextType>;
};
