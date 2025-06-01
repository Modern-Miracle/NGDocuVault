import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Setting up initial admin after deployment...\n');

  // Get contract addresses
  const didRegistryAddress = process.env.DID_REGISTRY_CONTRACT_ADDRESS;
  const didAuthAddress = process.env.DID_AUTH_CONTRACT_ADDRESS;
  const docuVaultAddress = process.env.DOCU_VAULT_CONTRACT_ADDRESS;

  if (!didRegistryAddress || !didAuthAddress || !docuVaultAddress) {
    throw new Error('Contract addresses not found. Please run deploy script first.');
  }

  // Get the deployer (first signer)
  const [deployer] = await ethers.getSigners();
  console.log('Deployer address:', deployer.address);

  // Get contract instances
  const didRegistry = await ethers.getContractAt('DidRegistry', didRegistryAddress) as unknown as DidRegistry;
  const didAuth = await ethers.getContractAt('DidAuth', didAuthAddress) as unknown as DidAuth;

  // Check current state
  console.log('\nChecking current state...');
  
  // Check who deployed DidAuth (should have initial admin rights)
  try {
    // The deployer should be able to grant roles initially
    let deployerDid = `did:docuvault:${deployer.address.toLowerCase()}`;
    
    // First, check if deployer already has a DID
    console.log('\n1. Checking deployer DID status...');
    
    let deployerActualDid = await didRegistry.addressToDID(deployer.address);
    
    if (deployerActualDid && deployerActualDid !== '') {
      console.log('Deployer already has DID:', deployerActualDid);
      
      // Use the existing DID instead of trying to register a new one
      if (deployerActualDid !== deployerDid) {
        console.log('WARNING: Existing DID differs from expected format');
        console.log('Expected:', deployerDid);
        console.log('Actual:', deployerActualDid);
        console.log('Using existing DID for role assignment...');
      }
      
      // Update deployerDid to use the actual one
      deployerDid = deployerActualDid;
    } else {
      // No existing DID, register new one
      console.log('No existing DID found, registering new one...');
      
      const didDocument = JSON.stringify({
        '@context': 'https://www.w3.org/ns/did/v1',
        'id': deployerDid,
        'verificationMethod': [{
          'id': `${deployerDid}#key-1`,
          'type': 'EcdsaSecp256k1VerificationKey2019',
          'controller': deployerDid,
          'publicKeyHex': deployer.address
        }],
        'authentication': [`${deployerDid}#key-1`]
      });

      try {
        const tx = await didRegistry.registerDid(deployerDid, didDocument, deployer.address);
        await tx.wait();
        console.log('Deployer DID registered successfully');
      } catch (error) {
        console.error('Error registering DID:', error);
        throw error;
      }
    }

    // Grant admin roles to deployer
    console.log('\n2. Granting admin roles to deployer...');
    const ADMIN_ROLE = await didAuth.ADMIN_ROLE();
    const DEFAULT_ADMIN_ROLE = await didAuth.DEFAULT_ADMIN_ROLE();

    // Check if already has roles
    const hasAdminRole = await didAuth.hasDidRole(deployerDid, ADMIN_ROLE);
    const hasDefaultAdminRole = await didAuth.hasDidRole(deployerDid, DEFAULT_ADMIN_ROLE);

    if (!hasAdminRole) {
      console.log('Granting ADMIN_ROLE...');
      const tx = await didAuth.grantDidRole(deployerDid, ADMIN_ROLE);
      await tx.wait();
      console.log('ADMIN_ROLE granted');
    } else {
      console.log('Already has ADMIN_ROLE');
    }

    if (!hasDefaultAdminRole) {
      console.log('Granting DEFAULT_ADMIN_ROLE...');
      const tx = await didAuth.grantDidRole(deployerDid, DEFAULT_ADMIN_ROLE);
      await tx.wait();
      console.log('DEFAULT_ADMIN_ROLE granted');
    } else {
      console.log('Already has DEFAULT_ADMIN_ROLE');
    }

    console.log('\nInitial admin setup complete!');
    console.log('Admin DID:', deployerDid);
    console.log('Admin Address:', deployer.address);
    console.log('\nYou can now run register-all-roles.ts to set up other roles.');

  } catch (error) {
    console.error('Error during setup:', error);
    
    // Check if this is a permission issue
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.error('\nIt seems the deployer does not have permission to grant roles.');
      console.error('This might happen if the contracts were already initialized.');
      console.error('Check the DidAuth contract constructor to see how initial permissions are set.');
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });