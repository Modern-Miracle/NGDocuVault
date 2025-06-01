# @docu/graphql-schema-codegen

GraphQL Schema with code generation for Docu using GraphQL Code Generator.

## Overview

This package provides:

1. A unified GraphQL schema definition for Docu platform
2. TypeScript types generated from the schema
3. Resolver types and interfaces
4. Base implementations for resolvers

## Installation

```bash
npm install @docu/graphql-schema-codegen
# or
yarn add @docu/graphql-schema-codegen
# or
pnpm add @docu/graphql-schema-codegen
```

## Usage

### Access Schema Types

```typescript
import { Document, Issuer, DocumentType } from '@docu/graphql-schema-codegen';

// Use the generated types
const document: Document = {
  id: '1',
  documentId: '123',
  documentType: DocumentType.IdCard,
  // ...other fields
};
```

### Access Resolver Types

```typescript
import { Resolvers } from '@docu/graphql-schema-codegen';

// Implement your own resolvers
const resolvers: Resolvers = {
  Query: {
    document: (_, { id }, context) => {
      return context.dataSources.documents.getDocumentById(id);
    },
  },
};
```

### Load Schema for Server Setup

```typescript
import { loadTypeDefs } from '@docu/graphql-schema-codegen';
import { ApolloServer } from '@apollo/server';
import { resolvers } from './resolvers';

// Create a new Apollo Server with the schema
const server = new ApolloServer({
  typeDefs: loadTypeDefs(),
  resolvers,
});
```

## Development

### Generate Types

After modifying the GraphQL schema files, regenerate the TypeScript types:

```bash
pnpm run generate
# or
npm run generate
# or
yarn generate
```

### Build

```bash
pnpm run build
# or
npm run build
# or
yarn build
```

## Structure

- `/graphql/` - GraphQL schema definition files
  - `schema.graphql` - Main entity definitions
  - `custom-scalars.graphql` - Custom scalar type definitions
  - `root-types.graphql` - Root Query and Mutation type definitions
  - `schema-extensions.graphql` - Extensions for pagination and filtering
- `/src/` - TypeScript source files
  - `/generated/` - Auto-generated files by GraphQL Code Generator
  - `index.ts` - Main export file
  - `resolvers.ts` - Base resolver implementations
  - `types.ts` - TypeScript interfaces for context and data sources

## License

MIT
