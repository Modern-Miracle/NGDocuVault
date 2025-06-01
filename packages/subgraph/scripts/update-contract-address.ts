import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Command line arguments
const contractAddress: string = process.argv[2] || '';
const startBlock: string = process.argv[3] || '1';

interface Source {
  address: string;
  startBlock: number;
  abi: string;
}

interface Mapping {
  kind: string;
  apiVersion: string;
  language: string;
  entities: string[];
  abis: Array<{ name: string; file: string }>;
  eventHandlers: Array<{ event: string; handler: string }>;
  file: string;
}

interface DataSource {
  kind: string;
  name: string;
  network: string;
  source: Source;
  mapping: Mapping;
}

interface SubgraphConfig {
  specVersion: string;
  schema: {
    file: string;
  };
  dataSources: DataSource[];
}

if (!contractAddress) {
  console.error('Error: Contract address is required.');
  console.log('Usage: ts-node update-contract-address.ts <contract-address> [start-block]');
  process.exit(1);
}

// Path to the subgraph.yaml file
const subgraphPath: string = path.join(__dirname, '..', 'subgraph.yaml');

try {
  // Read the existing subgraph.yaml
  const subgraphYaml = yaml.load(fs.readFileSync(subgraphPath, 'utf8')) as SubgraphConfig;

  if (!subgraphYaml || !subgraphYaml.dataSources || !subgraphYaml.dataSources[0]) {
    throw new Error('Subgraph configuration not found in subgraph.yaml');
  }

  // Update the contract address and start block
  subgraphYaml.dataSources[0].source.address = contractAddress;
  subgraphYaml.dataSources[0].source.startBlock = parseInt(startBlock);

  // Write the updated subgraph.yaml back to file
  fs.writeFileSync(subgraphPath, yaml.dump(subgraphYaml, { lineWidth: 120 }));

  console.log(
    `Successfully updated contract address to ${contractAddress} and start block to ${startBlock} in subgraph.yaml.`
  );
} catch (error) {
  console.error('Error updating subgraph.yaml:', error);
  process.exit(1);
}
