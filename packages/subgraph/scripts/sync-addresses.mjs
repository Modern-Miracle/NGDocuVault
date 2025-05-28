#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract name mapping from deployment files to subgraph data source names
const CONTRACT_MAPPING = {
  'DocuVault.json': 'DocuVault',
  'DidRegistry.json': 'DIDRegistry',
  'DidVerifier.json': 'DIDVerifier',
  'DidIssuer.json': 'DIDIssuer',
  'DidAuth.json': 'DIDAuth'
};

async function syncHardhatAddresses() {
  try {
    // Paths
    const subgraphPath = path.join(__dirname, '..', 'subgraph.yaml');
    const deploymentsPath = path.join(__dirname, '../../../apps/contract/deployments/localhost');
    
    // Check if deployments directory exists
    if (!fs.existsSync(deploymentsPath)) {
      console.error('❌ Hardhat deployments not found at:', deploymentsPath);
      console.log('Please deploy contracts first with: cd apps/contract && pnpm deploy');
      process.exit(1);
    }

    // Read the existing subgraph.yaml
    const subgraphContent = fs.readFileSync(subgraphPath, 'utf8');
    const subgraphConfig = yaml.load(subgraphContent);

    if (!subgraphConfig || !subgraphConfig.dataSources) {
      throw new Error('Invalid subgraph.yaml structure');
    }

    console.log('📋 Syncing contract addresses from Hardhat deployment...\n');

    let updatedCount = 0;

    // Update each data source with the corresponding contract address
    for (const [deploymentFile, dataSourceName] of Object.entries(CONTRACT_MAPPING)) {
      const deploymentPath = path.join(deploymentsPath, deploymentFile);
      
      if (!fs.existsSync(deploymentPath)) {
        console.warn(`⚠️  ${deploymentFile} not found, skipping...`);
        continue;
      }

      // Read deployment file
      const deploymentContent = fs.readFileSync(deploymentPath, 'utf8');
      const deployment = JSON.parse(deploymentContent);
      
      // Find the corresponding data source
      const dataSource = subgraphConfig.dataSources.find(ds => ds.name === dataSourceName);
      
      if (!dataSource) {
        console.warn(`⚠️  Data source ${dataSourceName} not found in subgraph.yaml`);
        continue;
      }

      // Get the start block (default to 1 if not available)
      const startBlock = deployment.receipt?.blockNumber || 1;

      // Update if address is different
      if (dataSource.source.address !== deployment.address) {
        console.log(`✅ Updating ${dataSourceName}:`);
        console.log(`   Address: ${dataSource.source.address} → ${deployment.address}`);
        console.log(`   Start Block: ${dataSource.source.startBlock} → ${startBlock}`);
        
        dataSource.source.address = deployment.address;
        dataSource.source.startBlock = startBlock;
        updatedCount++;
      } else {
        console.log(`✓ ${dataSourceName} already up to date (${deployment.address})`);
      }
    }

    if (updatedCount > 0) {
      // Write the updated subgraph.yaml
      const updatedYaml = yaml.dump(subgraphConfig, { 
        lineWidth: 120,
        noRefs: true,
        sortKeys: false
      });
      
      fs.writeFileSync(subgraphPath, updatedYaml);
      console.log(`\n✨ Updated ${updatedCount} contract address(es) in subgraph.yaml`);
    } else {
      console.log('\n✨ All contract addresses are already up to date');
    }

  } catch (error) {
    console.error('❌ Error syncing contract addresses:', error);
    process.exit(1);
  }
}

// Run the sync
syncHardhatAddresses();