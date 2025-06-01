import { Resolvers, InputMaybe } from './generated/graphql';
import { VerifierModel, HolderModel, IssuerModel } from './types';

/**
 * Convert InputMaybe<T> to T | undefined (remove null)
 * This helps handle GraphQL nullable types in TypeScript
 */
function nonNull<T>(value: InputMaybe<T>): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Resolvers implementation
 * These are the actual implementations of the GraphQL resolvers
 * They will be used by the GraphQL server to resolve queries and mutations
 */
export const resolvers: Resolvers = {
  Query: {
    // Document queries
    document: async (_, { id }, { dataSources }) => {
      return dataSources.documents.getDocumentById(id);
    },
    documents: async (_, { first, skip, where }, { dataSources }) => {
      return dataSources.documents.getDocuments({
        first: nonNull(first),
        skip: nonNull(skip),
        where: nonNull(where) as any,
      });
    },

    // Issuer queries
    issuer: async (_, { id }, { dataSources }) => {
      return dataSources.issuers.getIssuerById(id);
    },
    issuers: async (_, { first, skip }, { dataSources }) => {
      return dataSources.issuers.getIssuers(nonNull(first), nonNull(skip));
    },

    // Holder queries
    holder: async (_, { id }, { dataSources }) => {
      return dataSources.holders.getHolderById(id);
    },
    holders: async (_, { first, skip }, { dataSources }) => {
      return dataSources.holders.getHolders(nonNull(first), nonNull(skip));
    },

    // DID queries
    did: async (_, { id }, { dataSources }) => {
      return dataSources.dids.getDIDById(id);
    },
    dids: async (_, { first, skip }, { dataSources }) => {
      return dataSources.dids.getDIDs(nonNull(first), nonNull(skip));
    },

    // Verifier queries
    verifier: async (_, { id }, { dataSources }) => {
      // Return as-is and let GraphQL handle the type conversion
      return dataSources.verifiers.getVerifierById(id) as any;
    },
    verifiers: async (_, { first, skip }, { dataSources }) => {
      // Return as-is and let GraphQL handle the type conversion
      return dataSources.verifiers.getVerifiers(nonNull(first), nonNull(skip)) as any;
    },

    // Aggregation queries
    documentsCount: async (_, __, { dataSources }) => {
      return dataSources.documents.getDocumentsCount();
    },
    issuersCount: async (_, __, { dataSources }) => {
      return dataSources.issuers.getIssuersCount();
    },
    holdersCount: async (_, __, { dataSources }) => {
      return dataSources.holders.getHoldersCount();
    },
  },

  // Field resolvers
  Document: {
    // Resolve related fields if they're not already loaded
    issuer: (parent, _, { dataSources }) => {
      if (parent.issuer) return parent.issuer as IssuerModel;
      // Cast to handle the case where issuer is an ID
      return dataSources.issuers.getIssuerById(parent.issuer as unknown as string) as Promise<IssuerModel>;
    },
    holder: (parent, _, { dataSources }) => {
      if (parent.holder) return parent.holder as HolderModel;
      // Cast to handle the case where holder is an ID
      return dataSources.holders.getHolderById(parent.holder as unknown as string) as Promise<HolderModel>;
    },
  },

  Holder: {
    // Resolve documents with pagination
    documents: async (parent, { first, skip }, { dataSources }) => {
      return dataSources.documents.getDocumentsByHolder(parent.id, nonNull(first) || 10, nonNull(skip) || 0);
    },
  },

  Mutation: {
    // Placeholder implementation
    ping: () => 'pong',
  },
};
