# @docu/graphql-client-codegen

GraphQL client with code generation for Docu platform.

## Overview

This package provides:

1. Generated TypeScript types for GraphQL operations
2. A GraphQL Request SDK for making GraphQL requests
3. React Query hooks for using GraphQL in React applications
4. Utility functions for working with GraphQL

## Installation

### Basic Installation

```bash
npm install @docu/graphql-client-codegen
# or
yarn add @docu/graphql-client-codegen
# or
pnpm add @docu/graphql-client-codegen
```

### With React Query Support

To use the React Query hooks, install the peer dependencies:

```bash
npm install @docu/graphql-client-codegen @tanstack/react-query
# or
yarn add @docu/graphql-client-codegen @tanstack/react-query
# or
pnpm add @docu/graphql-client-codegen @tanstack/react-query
```

## Usage

### Basic Usage with GraphQL Request

```typescript
import { getSdk, createGraphQLClient } from '@docu/graphql-client-codegen';

// Create a GraphQL client
const client = createGraphQLClient({
  endpoint: 'https://api.example.com/graphql',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get the SDK
const sdk = getSdk(client);

// Use the SDK to make requests
const { documents } = await sdk.GetDocuments({ first: 10, skip: 0 });
```

### Using with React Query

```tsx
import { useGetDocumentQuery, useGetDocumentsQuery } from '@docu/graphql-client-codegen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const client = createGraphQLClient({
  endpoint: 'https://api.example.com/graphql',
});

// Create a QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DocumentsList />
    </QueryClientProvider>
  );
}

function DocumentsList() {
  // Use the generated hook
  const { data, isLoading, error } = useGetDocumentsQuery(client, { first: 10, skip: 0 });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {data?.documents.map((doc) => (
        <li key={doc.id}>
          {doc.documentType}: {doc.documentId}
        </li>
      ))}
    </ul>
  );
}
```

### Using Generated Types

```typescript
import { Document, DocumentType } from '@docu/graphql-client-codegen';

// Use the generated types
const myDocument: Document = {
  id: '1',
  documentId: '123-456',
  documentType: DocumentType.IdCard,
  // ...other fields
};
```

## Available Operations

The following GraphQL operations are available:

- `GetDocuments` - Get all documents with pagination
- `GetDocumentsByHolder` - Get documents by holder
- `GetDocument` - Get a document by ID
- `GetIssuer` - Get issuer details
- `GetHolder` - Get holder details
- `GetDocumentsCount` - Get documents count
- `GetIssuers` - Get issuers with pagination

## Development

### Generate Types

After modifying the GraphQL schema or operations, regenerate the TypeScript types:

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

## License

MIT
