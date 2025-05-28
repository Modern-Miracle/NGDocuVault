# @docu/graphql-client-codegen

GraphQL client SDK with TypeScript code generation for the Docu platform.

## Overview

This package provides:
- Type-safe GraphQL client SDK using graphql-request
- Generated TypeScript types for all GraphQL operations
- React Query hooks for React applications (optional)
- Utility functions for GraphQL client configuration

## Installation

### Basic Installation

```bash
npm install @docu/graphql-client-codegen graphql-request graphql
# or
yarn add @docu/graphql-client-codegen graphql-request graphql
# or
pnpm add @docu/graphql-client-codegen graphql-request graphql
```

### With React Query Support

```bash
npm install @docu/graphql-client-codegen @tanstack/react-query react
# or
yarn add @docu/graphql-client-codegen @tanstack/react-query react
# or
pnpm add @docu/graphql-client-codegen @tanstack/react-query react
```

## Usage

### Basic Usage with GraphQL Request SDK

```typescript
import { getSdk, createGraphQLClient } from '@docu/graphql-client-codegen';

// Create a GraphQL client
const client = createGraphQLClient({
  endpoint: 'http://localhost:8000/subgraphs/name/docu/docu-subgraph',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  timeout: 30000 // 30 seconds
});

// Get the SDK
const sdk = getSdk(client);

// Make type-safe queries
async function fetchDocuments() {
  const { documents } = await sdk.GetDocuments({ 
    first: 10, 
    skip: 0 
  });
  
  return documents;
}

// Fetch specific document
async function fetchDocument(id: string) {
  const { document } = await sdk.GetDocument({ id });
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  return document;
}
```

### Using with React Query

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetDocumentsQuery, useGetDocumentQuery } from '@docu/graphql-client-codegen/dist/generated/react-query';
import { createGraphQLClient } from '@docu/graphql-client-codegen';

// Create clients
const graphqlClient = createGraphQLClient({
  endpoint: 'http://localhost:8000/subgraphs/name/docu/docu-subgraph'
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  }
});

// App component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DocumentsList />
    </QueryClientProvider>
  );
}

// Component using the generated hook
function DocumentsList() {
  const { data, isLoading, error } = useGetDocumentsQuery(
    graphqlClient,
    { first: 10, skip: 0 },
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      onSuccess: (data) => {
        console.log(`Fetched ${data.documents?.length} documents`);
      }
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.documents?.map((doc) => (
        <li key={doc.id}>
          {doc.documentType}: {doc.documentId}
          {doc.isVerified && <span>✓ Verified</span>}
        </li>
      ))}
    </ul>
  );
}
```

### Using Generated Types

```typescript
import { 
  Document, 
  DocumentType, 
  ConsentStatus,
  GetDocumentsQuery,
  GetDocumentsQueryVariables 
} from '@docu/graphql-client-codegen';

// Use enums
const docType: DocumentType = DocumentType.Passport;
const status: ConsentStatus = ConsentStatus.Granted;

// Type your functions
function processDocuments(data: GetDocumentsQuery): Document[] {
  return data.documents || [];
}

// Type your variables
const variables: GetDocumentsQueryVariables = {
  first: 20,
  skip: 0,
  where: {
    documentType: DocumentType.IdCard,
    isVerified: true
  }
};
```

## Available Operations

### Queries

- **GetDocuments** - Fetch documents with pagination
  ```typescript
  const { documents } = await sdk.GetDocuments({ 
    first: 10, 
    skip: 0 
  });
  ```

- **GetDocument** - Fetch a single document by ID
  ```typescript
  const { document } = await sdk.GetDocument({ 
    id: "0x123..." 
  });
  ```

- **GetDocumentsByHolder** - Fetch documents for a specific holder
  ```typescript
  const { holder } = await sdk.GetDocumentsByHolder({ 
    holderId: "0x456...",
    first: 5,
    skip: 0 
  });
  ```

- **GetIssuer** - Fetch issuer details
  ```typescript
  const { issuer } = await sdk.GetIssuer({ 
    id: "0x789..." 
  });
  ```

- **GetHolder** - Fetch holder details
  ```typescript
  const { holder } = await sdk.GetHolder({ 
    id: "0xabc..." 
  });
  ```

- **GetDocumentsCount** - Get total document count
  ```typescript
  const { documentsCount } = await sdk.GetDocumentsCount();
  ```

- **GetIssuers** - Fetch issuers with pagination
  ```typescript
  const { issuers } = await sdk.GetIssuers({ 
    first: 10, 
    skip: 0 
  });
  ```

## Utility Functions

### createGraphQLClient

Creates a configured GraphQL client instance:

```typescript
const client = createGraphQLClient({
  endpoint: 'https://api.example.com/graphql',
  headers: {
    'Authorization': 'Bearer token',
    'X-Custom-Header': 'value'
  },
  timeout: 30000 // Optional timeout in milliseconds
});
```

### formatCacheKey

Formats cache keys for GraphQL queries:

```typescript
import { formatCacheKey } from '@docu/graphql-client-codegen';

const key = formatCacheKey('GetDocuments', { 
  first: 10, 
  skip: 0 
});
// Returns: "graphql-query:GetDocuments:{"first":10,"skip":0}"
```

## Error Handling

```typescript
try {
  const { document } = await sdk.GetDocument({ id: 'invalid-id' });
} catch (error) {
  if (error instanceof ClientError) {
    console.error('GraphQL Error:', error.response.errors);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

## Best Practices

1. **Client Reuse**: Create a single GraphQL client instance and reuse it
2. **Error Boundaries**: Use React error boundaries when using hooks
3. **Loading States**: Always handle loading states in your UI
4. **Type Safety**: Leverage the generated types for better type safety
5. **Caching**: Configure React Query cache times based on your data freshness needs

## Development

### Generate Types and SDK

After modifying GraphQL operations in `graphql/operations.graphql`:

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

## File Structure

```
graphql/
  ├── operations.graphql    # GraphQL operations
  ├── schema.graphql       # Schema from subgraph
  └── ...
src/
  ├── generated/           # Auto-generated files
  │   ├── graphql.ts      # Types
  │   ├── graphql-request.ts # SDK
  │   └── react-query.ts  # React Query hooks
  ├── index.ts            # Main exports
  └── utils.ts            # Utility functions
```

## License

MIT