# Subgraph Package

This package is responsible for managing the Graph Protocol node integration, including:

- Subgraph manifests and configuration
- AssemblyScript entity mappings
- Deployment scripts
- Local development graph node setup

## Relationship with other packages

- **graphql-schema**: The canonical source for GraphQL schema definitions
- **graphql-client**: Client-side query functionality that consumes this subgraph

## Schema Management

The GraphQL schema for this subgraph is defined in the `@docu/graphql-schema` package. To keep the schema in sync:

```bash
# Sync schema from the graphql-schema package
yarn sync-schema
```

This should be run whenever the schema in `graphql-schema` package is updated.

# DocuVault Subgraph

This subgraph indexes events from the DocuVault smart contract, enabling efficient queries for documents, issuers, holders, verification status, and consent management.

## Setup

### Prerequisites

- Node.js and npm
- Docker and Docker Compose
- Hardhat development environment

### Installation

1. Install the dependencies:

```bash
cd contracts/graph
npm install
```

### Linux Users Important Note

If you're running on Linux, you need to run an additional setup script before starting Docker. This script fixes the `host.docker.internal` hostname that doesn't work natively in Linux:

```bash
# From the graph directory
./setup.sh
# Or use the npm script
npm run setup-linux
```

This will update the `docker-compose.yml` file with the correct IP address for your host machine.

## Step-by-Step Guide to Run the Subgraph

### 1. Start Local Hardhat Node

Before setting up the Graph Node, start your Hardhat node:

```bash
# From the contracts directory
npx hardhat node --hostname 0.0.0.0
```

This will start a local Ethereum node for development and testing. The `--hostname 0.0.0.0` parameter is important to make the node accessible from Docker containers.

### 2. Deploy the DocuVault Contract

Deploy your contract to the local Hardhat node:

```bash
# From the root directory
npx hardhat compile
npx hardhat run scripts/deploy.ts --network localhost
```

Take note of the contract address. In our case, it's `0x5FbDB2315678afecb367f032d93F642f64180aa3`.

### 3. Update Subgraph Configuration

Update the contract address in the subgraph.yaml file:

```bash
# From the graph directory
npm run update-address 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 4. Set Up Docker Compose for The Graph Node

Create a docker-compose.yml file with the following configuration:

```yaml
version: '3'
services:
  graph-node:
    container_name: docuvault-graph-node
    image: graphprotocol/graph-node:latest
    ports:
      - '8000:8000'
      - '8001:8001'
      - '8020:8020'
      - '8030:8030'
      - '8040:8040'
    depends_on:
      - ipfs
      - postgres
    extra_hosts:
      - host.docker.internal:host-gateway
    environment:
      postgres_host: postgres
      postgres_user: graph-node
      postgres_pass: let-me-in
      postgres_db: graph-node
      ipfs: 'ipfs:5001'
      ethereum: 'hardhat:http://host.docker.internal:8545'
      GRAPH_LOG: info
      ETHEREUM_POLLING_INTERVAL: 1000
      GRAPH_ALLOW_NON_DETERMINISTIC_IPFS: 'true'

  ipfs:
    container_name: docuvault-ipfs
    image: ipfs/go-ipfs:latest
    ports:
      - '5001:5001'
    volumes:
      - ./data/ipfs:/data/ipfs

  postgres:
    container_name: docuvault-graph-postgres
    image: postgres:14
    ports:
      - '5433:5432'
    command:
      - 'postgres'
      - '-cshared_preload_libraries=pg_stat_statements'
    environment:
      POSTGRES_USER: graph-node
      POSTGRES_PASSWORD: let-me-in
      POSTGRES_DB: graph-node
      # Set C locale required by Graph Node
      POSTGRES_INITDB_ARGS: --locale=C --encoding=UTF8
      LC_ALL: C.UTF-8
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

The crucial part is configuring `ethereum: 'hardhat:http://host.docker.internal:8545'` to connect to your local Hardhat node.

### 5. Update the Schema with Immutable Entity Flags

The Graph now requires specifying whether entities are immutable or not. Update your schema.graphql file:

```graphql
type Issuer @entity(immutable: false) {
  id: ID!
  address: Bytes!
  isActive: Boolean!
  registeredAt: BigInt!
  documents: [Document!]! @derivedFrom(field: "issuer")
  activatedAt: BigInt
  deactivatedAt: BigInt
}

# Repeat for other entity types...
```

### 6. Start the Local Graph Node

Start the Docker containers for The Graph Node:

```bash
mkdir -p data/ipfs data/postgres
docker compose up -d
```

This command starts three containers:

- docuvault-graph-node: The Graph Node itself
- docuvault-ipfs: IPFS node for storing subgraph manifests
- docuvault-graph-postgres: PostgreSQL database for storing indexed data

### 7. Generate Types from the Subgraph Schema

```bash
npm run codegen
```

This creates TypeScript types for your entities in the `generated/schema` directory.

### 8. Build the Subgraph

```bash
npm run build
```

This command compiles the AssemblyScript mappings and prepares the subgraph for deployment.

### 9. Create a Local Subgraph Instance

```bash
npm run create-local
```

This registers your subgraph name with the local Graph Node.

### 10. Deploy the Subgraph to Local Graph Node

```bash
npm run deploy-local
```

This command deploys the subgraph to your local Graph Node. You'll be asked to provide a version label (e.g., "v0.0.1").

### 11. Verify the Deployment

Check that your subgraph is running by making a GraphQL query:

```bash
curl -X POST -H "Content-Type: application/json" --data '{"query": "{ documents(first: 5) { id documentId issuanceDate isExpired } }"}' http://localhost:8000/subgraphs/name/docuvault
```

You should receive a proper JSON response, possibly without data if no events have been emitted yet:

```json
{ "data": { "documents": [] } }
```

You can also access the GraphiQL UI at:
http://localhost:8000/subgraphs/name/docuvault/graphql

## Troubleshooting

### Common Issues

#### 1. "Network not supported" Error

If you get an error like:

```
Failed to deploy to Graph node: network not supported by registrar: no network hardhat found on chain ethereum
```

Make sure:

- The `network` in subgraph.yaml is set to `hardhat`
- The `ethereum` environment variable in docker-compose.yml is correctly set to `'hardhat:http://host.docker.internal:8545'`

#### 2. PostgreSQL Locale Error

If you see this error:

```
Database does not use C locale. Please check the graph-node documentation for how to set up the database locale: database collation is `en_US.utf8` but must be `C`
```

Add these environment variables to the postgres service in docker-compose.yml:

```yaml
POSTGRES_INITDB_ARGS: --locale=C --encoding=UTF8
LC_ALL: C.UTF-8
```

#### 3. Connection Issues

If you see errors like:

```
WARN Trying again after eth_getBlockByNumber(latest) no txs RPC call failed (attempt #10) with result Err(Unknown(could not get latest block from Ethereum: failed to send request: error sending request for url (http://host.docker.internal:8545/)))
```

Make sure:

- Your Hardhat node is running with `--hostname 0.0.0.0`
- Docker has access to the host network

**Linux Users**: If you're on Linux, the `host.docker.internal` hostname doesn't work natively. Run the setup script to fix this:

```bash
./setup.sh
```

Or use the npm script:

```bash
npm run setup-linux
```

Then restart the Docker containers:

```bash
docker compose down && docker compose up -d
```

#### 4. Block Data Unavailable

If you see errors like:

```
ERRO Trying again after block polling failed: Block data unavailable, block was likely uncled (block hash = 0x0000000000000000000000000000000000000000000000000000000000000000)
```

This is normal when starting up. Once you begin adding transactions to your local blockchain, these errors should resolve.

## Querying the Subgraph

Once deployed, you can access the GraphQL API at:

- GraphQL Endpoint: http://localhost:8000/subgraphs/name/docuvault
- Subgraph UI: http://localhost:8000/subgraphs/name/docuvault/graphql

### Example Queries

#### Get Documents for a Holder

```graphql
{
  documents(where: { holder: "HOLDER_ADDRESS" }) {
    id
    documentId
    issuer {
      address
      isActive
    }
    issuanceDate
    expirationDate
    isVerified
    documentType
  }
}
```

#### Get Verification Requests

```graphql
{
  verificationRequests(orderBy: requestedAt, orderDirection: desc) {
    id
    document {
      id
      documentId
    }
    holder {
      address
    }
    requestedAt
    verified
  }
}
```

## Testing The Subgraph

### Using cURL From Command Line

You can test your subgraph using cURL from the command line:

```bash
# Get all issuers
curl -X POST -H "Content-Type: application/json" \
  --data '{"query": "{ issuers { id address isActive } }"}' \
  http://localhost:8000/subgraphs/name/docuvault

# Get all documents with their issuers and holders
curl -X POST -H "Content-Type: application/json" \
  --data '{"query": "{ documents { id documentType issuanceDate isVerified issuer { address } holder { address } } }"}' \
  http://localhost:8000/subgraphs/name/docuvault

# Get only verified documents
curl -X POST -H "Content-Type: application/json" \
  --data '{"query": "{ documents(where: { isVerified: true }) { id documentType issuer { address } } }"}' \
  http://localhost:8000/subgraphs/name/docuvault
```

### Using the GraphiQL Interface

1. Open your browser and go to: http://localhost:8000/subgraphs/name/docuvault/graphql
2. Use the interactive GraphiQL interface to build and execute queries
3. Experiment with filters, sorting, and querying related entities

### Using In Frontend Applications

The file `example-frontend.js` in this directory demonstrates how to query the subgraph from a frontend application. Key points:

1. Use a GraphQL client like Apollo Client or urql in production applications
2. For simple cases, you can use `fetch` API directly
3. Structure your queries to minimize the data returned to only what you need

Example using Apollo Client in a React application:

```jsx
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

// Setup Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:8000/subgraphs/name/docuvault',
  cache: new InMemoryCache(),
});

// Define your query
const GET_DOCUMENTS = gql`
  {
    documents {
      id
      documentType
      isVerified
    }
  }
`;

// Create a component that uses the query
function DocumentList() {
  const { loading, error, data } = useQuery(GET_DOCUMENTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Documents</h2>
      <ul>
        {data.documents.map((document) => (
          <li key={document.id}>
            {document.documentType} - Verified: {document.isVerified ? 'Yes' : 'No'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Next Steps

1. Interact with the DocuVault contract to generate events
2. Watch the Graph Node logs to see indexing in action
3. Query the subgraph for the indexed data
4. Integrate the subgraph into your frontend application

## References

- [The Graph Documentation](https://thegraph.com/docs/en/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [GraphQL Documentation](https://graphql.org/learn/)
