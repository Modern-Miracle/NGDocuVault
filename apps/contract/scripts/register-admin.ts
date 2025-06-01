import hre from 'hardhat';
const { ethers } = hre;
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';
import { Wallet } from 'ethers';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: npx hardhat run scripts/register-admin.ts --network localhost -- <admin-address> [admin-private-key]');
    console.error('Example: npx hardhat run scripts/register-admin.ts --network localhost -- 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
    console.error('Or with private key: npx hardhat run scripts/register-admin.ts --network localhost -- 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
    process.exit(1);
  }

  const adminAddress = args[0];
  const adminPrivateKey = args[1];

  console.log('Starting Admin Registration Script...');
  console.log('Admin address:', adminAddress);
  console.log('Using private key:', adminPrivateKey ? 'Yes' : 'No (using default signer)');
  console.log('');

  // Get the admin account - either from private key or from signers
  let adminAccount;
  let deployerAccount;
  
  if (adminPrivateKey) {
    // Create wallet from private key
    const provider = ethers.provider;
    adminAccount = new Wallet(adminPrivateKey, provider);
    deployerAccount = (await ethers.getSigners())[0]; // Still need deployer for granting initial roles
  } else {
    // Use existing signer that matches the address
    const signers = await ethers.getSigners();
    adminAccount = signers.find(signer => signer.address.toLowerCase() === adminAddress.toLowerCase());
    
    if (!adminAccount) {
      throw new Error(`No signer found for address ${adminAddress}. Please provide the private key.`);
    }
    
    deployerAccount = signers[0]; // Deployer is always the first signer
  }

  console.log('Admin account address:', adminAccount.address);
  console.log('Deployer account address:', deployerAccount.address);

  // Get contract addresses from environment
  const didRegistryAddress = process.env.DID_REGISTRY_CONTRACT_ADDRESS;
  const didAuthAddress = process.env.DID_AUTH_CONTRACT_ADDRESS;
  const docuVaultAddress = process.env.DOCU_VAULT_CONTRACT_ADDRESS;

  if (!didRegistryAddress || !didAuthAddress || !docuVaultAddress) {
    throw new Error('Contract addresses not found in environment variables. Please run deploy script first.');
  }

  // Get contract instances
  const didRegistry = await ethers.getContractAt('DidRegistry', didRegistryAddress) as unknown as DidRegistry;
  const didAuth = await ethers.getContractAt('DidAuth', didAuthAddress) as unknown as DidAuth;
  const docuVault = await ethers.getContractAt('DocuVault', docuVaultAddress) as unknown as DocuVault;

  // Step 1: Register DID for admin account
  const adminDid = `did:docuvault:${adminAccount.address.toLowerCase()}`;
  console.log('\nStep 1: Registering DID for admin account...');
  console.log('DID:', adminDid);

  try {
    // Check if DID already exists
    const existingDoc = await didRegistry.getDocument(adminDid);
    if (existingDoc && existingDoc !== '') {
      console.log('DID already registered for admin account');
    } else {
      // Register DID
      const didDocument = JSON.stringify({
        '@context': 'https://www.w3.org/ns/did/v1',
        'id': adminDid,
        'verificationMethod': [{
          'id': `${adminDid}#key-1`,
          'type': 'EcdsaSecp256k1VerificationKey2019',
          'controller': adminDid,
          'publicKeyHex': adminAccount.address
        }],
        'authentication': [`${adminDid}#key-1`]
      });

      const tx = await didRegistry.connect(adminAccount).registerDid(adminDid, didDocument, adminAccount.address);
      await tx.wait();
      console.log('DID registered successfully');
    }
  } catch (error) {
    console.error('Error registering DID:', error instanceof Error ? error.message : error);
  }

  // Step 2: Grant ADMIN_ROLE to the admin account
  console.log('\nStep 2: Granting ADMIN_ROLE to admin account...');
  
  try {
    const ADMIN_ROLE = await didAuth.ADMIN_ROLE();
    console.log('ADMIN_ROLE hash:', ADMIN_ROLE);

    // Check if already has role
    const hasRole = await didAuth.hasDidRole(adminDid, ADMIN_ROLE);
    if (hasRole) {
      console.log('Admin already has ADMIN_ROLE');
    } else {
      // Grant role (deployer grants to admin)
      const tx = await didAuth.connect(deployerAccount).grantDidRole(adminDid, ADMIN_ROLE);
      await tx.wait();
      console.log('ADMIN_ROLE granted successfully');
    }
  } catch (error) {
    console.error('Error granting ADMIN_ROLE:', error instanceof Error ? error.message : error);
  }

  // Step 3: Grant DEFAULT_ADMIN_ROLE (optional, for full admin privileges)
  console.log('\nStep 3: Granting DEFAULT_ADMIN_ROLE to admin account...');
  
  try {
    const DEFAULT_ADMIN_ROLE = await didAuth.DEFAULT_ADMIN_ROLE();
    console.log('DEFAULT_ADMIN_ROLE hash:', DEFAULT_ADMIN_ROLE);

    const hasRole = await didAuth.hasDidRole(adminDid, DEFAULT_ADMIN_ROLE);
    if (hasRole) {
      console.log('Admin already has DEFAULT_ADMIN_ROLE');
    } else {
      const tx = await didAuth.connect(deployerAccount).grantDidRole(adminDid, DEFAULT_ADMIN_ROLE);
      await tx.wait();
      console.log('DEFAULT_ADMIN_ROLE granted successfully');
    }
  } catch (error) {
    console.error('Error granting DEFAULT_ADMIN_ROLE:', error instanceof Error ? error.message : error);
  }

  // Step 4: Verify roles
  console.log('\nStep 4: Verifying admin roles...');
  
  const adminRole = await didAuth.ADMIN_ROLE();
  const defaultAdminRole = await didAuth.DEFAULT_ADMIN_ROLE();
  
  const hasAdminRole = await didAuth.hasDidRole(adminDid, adminRole);
  const hasDefaultAdminRole = await didAuth.hasDidRole(adminDid, defaultAdminRole);
  
  console.log('Has ADMIN_ROLE:', hasAdminRole);
  console.log('Has DEFAULT_ADMIN_ROLE:', hasDefaultAdminRole);

  console.log('\nAdmin registration completed!');
  console.log('Admin DID:', adminDid);
  console.log('Admin Address:', adminAccount.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });