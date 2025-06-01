import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Set the base directories
const ROOT_DIR: string = path.join(__dirname, '../../..');
const GRAPH_DIR: string = path.join(__dirname, '..');

/**
 * Main deployment function
 */
async function main(): Promise<void> {
  console.log('Starting DocuVault deployment and subgraph setup...');

  try {
    // 1. Compile the contracts (if not already compiled)
    console.log('\n1. Compiling contracts...');
    execSync('npx hardhat compile', { stdio: 'inherit', cwd: ROOT_DIR });

    // 2. Deploy the contract to local Hardhat node
    console.log('\n2. Deploying DocuVault contract...');
    console.log('Make sure your local Hardhat node is running (npx hardhat node)');

    // Run the deploy script and capture the output to get the contract address
    const deployOutput: string = execSync('npx hardhat run scripts/deploy-docuvault.ts --network localhost', {
      stdio: ['inherit', 'pipe', 'inherit'],
      cwd: ROOT_DIR,
    }).toString();

    // Extract the contract address from the output
    const addressMatch = deployOutput.match(/Contract deployed to: (0x[a-fA-F0-9]{40})/);
    if (!addressMatch || !addressMatch[1]) {
      throw new Error('Could not extract contract address from deployment output');
    }

    const contractAddress: string = addressMatch[1];
    console.log(`Deployed DocuVault to address: ${contractAddress}`);

    // 3. Start the local Graph node if not already running
    console.log('\n3. Setting up local Graph node...');
    try {
      execSync('docker ps | grep docuvault-graph-node', { stdio: 'inherit', cwd: GRAPH_DIR });
      console.log('Graph node is already running.');
    } catch (error) {
      console.log('Starting Graph node, IPFS, and PostgreSQL...');
      execSync('npm run start-local', { stdio: 'inherit', cwd: GRAPH_DIR });

      // Wait for services to be up
      console.log('Waiting for services to start...');
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }

    // 4. Update the subgraph.yaml with the contract address
    console.log('\n4. Updating subgraph manifest with contract address...');
    execSync(`npx ts-node scripts/update-contract-address.ts ${contractAddress}`, {
      stdio: 'inherit',
      cwd: GRAPH_DIR,
    });

    // 5. Generate types and build the subgraph
    console.log('\n5. Generating types and building subgraph...');
    execSync('npm run codegen && npm run build', { stdio: 'inherit', cwd: GRAPH_DIR });

    // 6. Create and deploy the subgraph
    console.log('\n6. Creating and deploying subgraph...');
    try {
      execSync('npm run create-local', { stdio: 'inherit', cwd: GRAPH_DIR });
    } catch (error) {
      console.log('Subgraph may already exist, trying to redeploy...');
    }

    execSync('npm run deploy-local', { stdio: 'inherit', cwd: GRAPH_DIR });

    console.log('\n✅ Deployment complete!');
    console.log(`\nDocuVault contract deployed at: ${contractAddress}`);
    console.log('Subgraph deployed to: http://localhost:8000/subgraphs/name/docuvault');
    console.log('GraphQL endpoint: http://localhost:8000/subgraphs/name/docuvault/graphql');
  } catch (error) {
    console.error('\n❌ Deployment failed:');
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
