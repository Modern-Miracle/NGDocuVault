import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth } from '../typechain-types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Checking current contract state...\n');

  // Get contract addresses
  const didRegistryAddress = process.env.DID_REGISTRY_CONTRACT_ADDRESS;
  const didAuthAddress = process.env.DID_AUTH_CONTRACT_ADDRESS;

  if (!didRegistryAddress || !didAuthAddress) {
    throw new Error('Contract addresses not found in environment.');
  }

  // Get signers
  const signers = await ethers.getSigners();
  console.log('Available signers:');
  for (let i = 0; i < Math.min(5, signers.length); i++) {
    console.log(`  [${i}] ${signers[i].address}`);
  }
  console.log('');

  // Get contract instances
  const didRegistry = await ethers.getContractAt('DidRegistry', didRegistryAddress) as unknown as DidRegistry;
  const didAuth = await ethers.getContractAt('DidAuth', didAuthAddress) as unknown as DidAuth;

  // Check each signer's DID status
  console.log('DID Registration Status:');
  for (let i = 0; i < Math.min(5, signers.length); i++) {
    const signer = signers[i];
    const address = signer.address;
    
    console.log(`\nSigner [${i}] - ${address}:`);
    
    // Check if address has a DID
    try {
      const did = await didRegistry.addressToDID(address);
      if (did && did !== '') {
        console.log(`  Has DID: ${did}`);
        
        // Check if DID is active
        try {
          const isActive = await didRegistry.isActive(did);
          console.log(`  Is Active: ${isActive}`);
        } catch (error) {
          console.log(`  Is Active: Error checking (${error})`);
        }
        
        // Get document
        try {
          const doc = await didRegistry.getDocument(did);
          console.log(`  Document: ${doc.substring(0, 100)}...`);
        } catch (error) {
          console.log(`  Document: Error retrieving`);
        }
      } else {
        console.log(`  Has DID: No`);
      }
    } catch (error) {
      console.log(`  Error checking DID: ${error}`);
    }
  }

  // Check role assignments
  console.log('\n\nRole Assignments:');
  const roles = {
    ADMIN_ROLE: await didAuth.ADMIN_ROLE(),
    DEFAULT_ADMIN_ROLE: await didAuth.DEFAULT_ADMIN_ROLE(),
    ISSUER_ROLE: await didAuth.ISSUER_ROLE(),
    HOLDER_ROLE: await didAuth.HOLDER_ROLE(),
    VERIFIER_ROLE: await didAuth.VERIFIER_ROLE(),
  };

  for (let i = 0; i < Math.min(5, signers.length); i++) {
    const address = signers[i].address;
    const did = await didRegistry.addressToDID(address);
    
    if (did && did !== '') {
      console.log(`\nDID: ${did}`);
      for (const [roleName, roleHash] of Object.entries(roles)) {
        try {
          const hasRole = await didAuth.hasDidRole(did, roleHash as `0x${string}`);
          if (hasRole) {
            console.log(`  ✓ ${roleName}`);
          }
        } catch (error) {
          // Role not assigned or error
        }
      }
    }
  }

  // Get contract deployment info
  console.log('\n\nContract Deployment Info:');
  console.log(`DidRegistry: ${didRegistryAddress}`);
  console.log(`DidAuth: ${didAuthAddress}`);
  
  // Try to understand the initial state
  const deployerAddress = signers[0].address;
  const deployerDid = `did:docuvault:${deployerAddress.toLowerCase()}`;
  console.log(`\nExpected deployer DID: ${deployerDid}`);
  
  const actualDid = await didRegistry.addressToDID(deployerAddress);
  console.log(`Actual deployer DID: ${actualDid || 'None'}`);
  
  if (actualDid && actualDid !== deployerDid) {
    console.log('\nWARNING: Deployer has a different DID than expected!');
    console.log('This might be from a previous deployment or test.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });