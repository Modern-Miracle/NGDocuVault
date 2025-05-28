# Subgraph Query Examples

This guide provides practical GraphQL query examples for the DocuVault subgraph.

## Basic Queries

### Get All Documents

```graphql
{
  documents {
    id
    documentId
    documentType
    isVerified
    registeredAt
    holder {
      address
    }
    issuer {
      address
      isActive
    }
  }
}
```

### Get Documents with Pagination

```graphql
{
  documents(first: 10, skip: 20, orderBy: registeredAt, orderDirection: desc) {
    id
    documentType
    registeredAt
  }
}
```

## Filtering Queries

### Get Verified Documents

```graphql
{
  documents(where: { isVerified: true }) {
    id
    documentType
    verifiedAt
    verifiedBy
    holder {
      address
    }
  }
}
```

### Get Documents by Holder

```graphql
{
  documents(where: { holder: "0x742d35Cc6634C0532925a3b844Bc9e7595f5b4E1" }) {
    id
    documentType
    isVerified
    issuer {
      address
    }
  }
}
```

### Get Documents by Type

```graphql
{
  documents(where: { documentType: BIRTH_CERTIFICATE }) {
    id
    holder {
      address
    }
    issuer {
      address
    }
    registeredAt
  }
}
```

### Complex Filtering

```graphql
{
  documents(
    where: {
      documentType: PASSPORT
      isVerified: true
      registeredAt_gte: "1609459200"  # Unix timestamp for 2021-01-01
    }
    orderBy: registeredAt
    orderDirection: desc
  ) {
    id
    documentType
    holder {
      address
    }
  }
}
```

## Relationship Queries

### Get Holder with All Documents

```graphql
{
  holder(id: "0x742d35cc6634c0532925a3b844bc9e7595f5b4e1") {
    id
    address
    documents {
      id
      documentType
      isVerified
      issuer {
        address
      }
    }
  }
}
```

### Get Issuer Details

```graphql
{
  issuer(id: "0x5b0951234567890abcdef1234567890abcdef123") {
    id
    address
    isActive
    registeredAt
    documents {
      id
      documentType
      holder {
        address
      }
    }
  }
}
```

## DID Queries

### Get All Active DIDs

```graphql
{
  dids(where: { active: true }) {
    id
    did
    controller
    lastUpdated
    roles {
      role
      granted
      grantedAt
    }
  }
}
```

### Get DID with Credentials

```graphql
{
  did(id: "did:docu:ethereum:0x123...") {
    id
    controller
    active
    credentials {
      id
      credentialType
      issuer
      issuedAt
      verified
    }
  }
}
```

## Share Request Queries

### Get Pending Share Requests

```graphql
{
  shareRequests(where: { status: PENDING }) {
    id
    document {
      id
      documentType
    }
    requester
    holder {
      address
    }
    requestedAt
  }
}
```

### Get Share Requests for a Document

```graphql
{
  shareRequests(where: { document: "0x123..." }) {
    id
    requester
    status
    requestedAt
    grantedAt
    validUntil
  }
}
```

## Verification Queries

### Get Recent Verifications

```graphql
{
  verificationRequests(
    first: 10
    orderBy: requestedAt
    orderDirection: desc
  ) {
    id
    document {
      documentType
    }
    holder {
      address
    }
    requestedAt
    verified
  }
}
```

## Role-Based Queries

### Get All Users with Specific Role

```graphql
{
  roles(where: { role: "0x1234...ADMIN_ROLE_HASH", granted: true }) {
    id
    did {
      did
      controller
    }
    grantedAt
  }
}
```

### Get User's Roles

```graphql
{
  roles(where: { did: "did:docu:ethereum:0x123..." }) {
    id
    role
    granted
    grantedAt
    revokedAt
  }
}
```

## Authentication History

### Get Recent Authentication Events

```graphql
{
  authentications(
    first: 20
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    did {
      did
    }
    role
    successful
    timestamp
  }
}
```

## Aggregation Queries

### Count Documents by Type

```graphql
{
  birthCertificates: documents(where: { documentType: BIRTH_CERTIFICATE }) {
    id
  }
  passports: documents(where: { documentType: PASSPORT }) {
    id
  }
  idCards: documents(where: { documentType: ID_CARD }) {
    id
  }
}
```

### Get Statistics

```graphql
{
  _meta {
    block {
      number
    }
  }
  totalDocuments: documents {
    id
  }
  verifiedDocuments: documents(where: { isVerified: true }) {
    id
  }
  activeIssuers: issuers(where: { isActive: true }) {
    id
  }
}
```

## Time-Based Queries

### Documents Registered Today

```graphql
{
  documents(
    where: { 
      registeredAt_gte: "1698796800"  # Today's start timestamp
      registeredAt_lt: "1698883200"   # Tomorrow's start timestamp
    }
  ) {
    id
    documentType
    registeredAt
  }
}
```

### Recent Updates

```graphql
{
  documents(
    first: 10
    orderBy: registeredAt
    orderDirection: desc
    where: {
      registeredAt_gte: "1698710400"  # Last 24 hours
    }
  ) {
    id
    documentType
    holder {
      address
    }
  }
}
```

## Advanced Queries

### Documents with Multiple Conditions

```graphql
{
  documents(
    where: {
      and: [
        { isVerified: true }
        { documentType_in: [PASSPORT, ID_CARD] }
        { registeredAt_gte: "1609459200" }
      ]
    }
  ) {
    id
    documentType
    holder {
      address
    }
  }
}
```

### Search with Text (if implemented)

```graphql
{
  documentSearch(text: "birth certificate") {
    id
    documentType
    holder {
      address
    }
  }
}
```

## Query Variables

Using GraphQL variables for reusable queries:

```graphql
query GetDocumentsByHolder($holderAddress: String!) {
  documents(where: { holder: $holderAddress }) {
    id
    documentType
    isVerified
  }
}
```

Variables:
```json
{
  "holderAddress": "0x742d35cc6634c0532925a3b844bc9e7595f5b4e1"
}
```

## Performance Tips

1. **Use Pagination**: Always use `first` and `skip` for large datasets
2. **Select Only Needed Fields**: Don't query fields you don't need
3. **Use Indexed Fields**: Filter by indexed fields when possible
4. **Batch Queries**: Combine multiple queries in one request

## Error Handling

Check for indexing errors:

```graphql
{
  _meta {
    hasIndexingErrors
  }
}
```

## WebSocket Subscriptions

For real-time updates (if enabled):

```graphql
subscription {
  documents(where: { isVerified: true }) {
    id
    documentType
    verifiedAt
  }
}
```