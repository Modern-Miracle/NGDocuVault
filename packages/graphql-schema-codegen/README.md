# @docu/graphql-schema-codegen

GraphQL schema types and resolvers for the Docu subgraph.

## Overview

This package provides:
- TypeScript types generated from the GraphQL schema
- Resolver interfaces for implementing GraphQL servers
- Schema loader utility for runtime schema access
- Full type safety for subgraph development

## Installation

```bash
npm install @docu/graphql-schema-codegen
# or
yarn add @docu/graphql-schema-codegen
# or
pnpm add @docu/graphql-schema-codegen
```

## Usage

### Import Generated Types

```typescript
import {
  Document,
  Holder,
  Issuer,
  DocumentType,
  ConsentStatus,
  Resolvers,
  GraphQLContext
} from '@docu/graphql-schema-codegen';

// Use the types in your application
const document: Document = {
  id: '1',
  documentId: '0xabc',
  documentType: DocumentType.Passport,
  isVerified: true,
  // ... other fields
};
```

### Implement Resolvers

```typescript
import { Resolvers, GraphQLContext } from '@docu/graphql-schema-codegen';

const resolvers: Resolvers<GraphQLContext> = {
  Query: {
    document: async (parent, { id }, context) => {
      return context.dataSources.documents.getDocumentById(id);
    },
    documents: async (parent, { first, skip, where }, context) => {
      return context.dataSources.documents.getDocuments({
        first,
        skip,
        where
      });
    }
  },
  
  Mutation: {
    // Add your mutations here
    ping: () => 'pong'
  },
  
  // Field resolvers
  Document: {
    issuer: async (parent, args, context) => {
      if (typeof parent.issuer === 'object') return parent.issuer;
      return context.dataSources.issuers.getIssuerById(parent.issuer);
    }
  }
};
```

### Load Schema at Runtime

```typescript
import { loadTypeDefs } from '@docu/graphql-schema-codegen';
import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = loadTypeDefs();
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});
```

## Available Types

### Core Entity Types
- `Document` - Document records on the blockchain
- `Holder` - Document holders
- `Issuer` - Document issuers
- `DID` - Decentralized identifiers
- `ShareRequest` - Document sharing requests
- `VerificationRequest` - Document verification requests
- `Verifier` - ZKP verifiers (Age, FHIR, Hash)

### Enums
```typescript
// Document types
enum DocumentType {
  Generic = "GENERIC",
  BirthCertificate = "BIRTH_CERTIFICATE",
  DeathCertificate = "DEATH_CERTIFICATE",
  MarriageCertificate = "MARRIAGE_CERTIFICATE",
  IdCard = "ID_CARD",
  Passport = "PASSPORT",
  Other = "OTHER"
}

// Consent status
enum ConsentStatus {
  Pending = "PENDING",
  Granted = "GRANTED", 
  Rejected = "REJECTED"
}
```

### Scalar Types
- `BigInt` - Large integers (as strings)
- `Bytes` - Ethereum addresses and hashes
- `DateTime` - ISO date strings

## Context Type

Define your GraphQL context to match your data sources:

```typescript
interface GraphQLContext {
  dataSources: {
    documents: {
      getDocumentById(id: string): Promise<Document | null>;
      getDocuments(args: DocumentsArgs): Promise<Document[]>;
      getDocumentsByHolder(holderId: string, first: number, skip: number): Promise<Document[]>;
      getDocumentsCount(): Promise<number>;
    };
    issuers: {
      getIssuerById(id: string): Promise<Issuer | null>;
      getIssuers(first?: number, skip?: number): Promise<Issuer[]>;
      getIssuersCount(): Promise<number>;
    };
    holders: {
      getHolderById(id: string): Promise<Holder | null>;
      getHolders(first?: number, skip?: number): Promise<Holder[]>;
      getHoldersCount(): Promise<number>;
    };
    dids: {
      getDIDById(id: string): Promise<DID | null>;
      getDIDs(first?: number, skip?: number): Promise<DID[]>;
    };
    verifiers: {
      getVerifierById(id: string): Promise<Verifier | null>;
      getVerifiers(first?: number, skip?: number): Promise<Verifier[]>;
    };
  };
}
```

## Development

### Generate Types

```bash
pnpm generate
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Schema Files

The GraphQL schema is split into multiple files for organization:
- `schema.graphql` - Main entity definitions
- `custom-scalars.graphql` - Custom scalar definitions
- `root-types.graphql` - Query and Mutation types
- `schema-extensions.graphql` - Type extensions

## Integration with The Graph

This schema is designed to work with The Graph Protocol. The types match the entities defined in the subgraph's AssemblyScript mappings.

### Example Subgraph Integration

```typescript
// In your subgraph mapping
import { Document } from "../generated/schema";
import { DocumentRegistered } from "../generated/DocuVault/DocuVault";

export function handleDocumentRegistered(event: DocumentRegistered): void {
  let document = new Document(event.params.documentId.toHex());
  document.documentId = event.params.documentId;
  document.holder = event.params.holder.toHex();
  document.issuer = event.params.issuer.toHex();
  document.documentType = "GENERIC";
  document.isVerified = false;
  document.save();
}
```

## Best Practices

1. **Type Safety**: Always use the generated types for consistency
2. **Null Handling**: Many fields can be null, use proper null checks
3. **ID Format**: IDs are typically hex strings from blockchain events
4. **BigInt Handling**: BigInt values are represented as strings
5. **Resolver Optimization**: Implement DataLoader for N+1 query prevention

## License

MIT