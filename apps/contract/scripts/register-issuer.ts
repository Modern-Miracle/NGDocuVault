import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Starting Issuer Registration Script...\n');

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const issuerAccount = signers[2]; // Use third account as issuer

  console.log('Deployer address:', deployer.address);
  console.log('Issuer account address:', issuerAccount.address);

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

  // Step 1: Register DID for issuer account
  const issuerDid = `did:docuvault:${issuerAccount.address.toLowerCase()}`;
  console.log('\nStep 1: Registering DID for issuer account...');
  console.log('DID:', issuerDid);

  try {
    // Check if DID already exists
    const existingDoc = await didRegistry.getDocument(issuerDid);
    if (existingDoc && existingDoc !== '') {
      console.log('DID already registered for issuer account');
    } else {
      // Register DID
      const didDocument = JSON.stringify({
        '@context': 'https://www.w3.org/ns/did/v1',
        'id': issuerDid,
        'verificationMethod': [{
          'id': `${issuerDid}#key-1`,
          'type': 'EcdsaSecp256k1VerificationKey2019',
          'controller': issuerDid,
          'publicKeyHex': issuerAccount.address
        }],
        'authentication': [`${issuerDid}#key-1`],
        'assertionMethod': [`${issuerDid}#key-1`]
      });

      const tx = await didRegistry.connect(issuerAccount).registerDid(issuerDid, didDocument, issuerAccount.address);
      await tx.wait();
      console.log('DID registered successfully');
    }
  } catch (error) {
    console.error('Error registering DID:', error instanceof Error ? error.message : error);
  }

  // Step 2: Grant ISSUER_ROLE to the issuer account
  console.log('\nStep 2: Granting ISSUER_ROLE to issuer account...');
  
  try {
    const ISSUER_ROLE = await didAuth.ISSUER_ROLE();
    console.log('ISSUER_ROLE hash:', ISSUER_ROLE);

    // Check if already has role
    const hasRole = await didAuth.hasDidRole(issuerDid, ISSUER_ROLE);
    if (hasRole) {
      console.log('Issuer already has ISSUER_ROLE');
    } else {
      // Grant role (deployer or admin can do this)
      const tx = await didAuth.connect(deployer).grantDidRole(issuerDid, ISSUER_ROLE);
      await tx.wait();
      console.log('ISSUER_ROLE granted successfully');
    }
  } catch (error) {
    console.error('Error granting ISSUER_ROLE:', error instanceof Error ? error.message : error);
  }

  // Step 3: Register issuer in DocuVault
  console.log('\nStep 3: Registering issuer in DocuVault contract...');
  
  try {
    // This might need to be called by an admin
    // First check if we need to use an admin account
    const adminAccount = signers[1]; // Assuming second account is admin from previous script
    const adminDid = `did:docuvault:${adminAccount.address.toLowerCase()}`;
    
    // Try to register issuer (this function might be admin-only)
    const tx = await docuVault.connect(adminAccount).registerIssuer(issuerAccount.address);
    await tx.wait();
    console.log('Issuer registered in DocuVault successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('IssuerRegistered')) {
      console.log('Issuer already registered in DocuVault');
    } else if (errorMessage.includes('NotAdmin')) {
      console.log('Note: registerIssuer requires admin privileges. Run register-admin.ts first.');
    } else {
      console.error('Error registering issuer in DocuVault:', errorMessage);
    }
  }

  // Step 4: Verify roles and credentials
  console.log('\nStep 4: Verifying issuer setup...');
  
  const issuerRole = await didAuth.ISSUER_ROLE();
  const hasIssuerRole = await didAuth.hasDidRole(issuerDid, issuerRole);
  
  console.log('Has ISSUER_ROLE:', hasIssuerRole);

  // Check if issuer can authenticate
  try {
    const canAuthenticate = await didAuth.authenticate(issuerDid, issuerRole);
    console.log('Can authenticate with ISSUER_ROLE:', canAuthenticate);
  } catch (error) {
    console.log('Authentication check failed:', error instanceof Error ? error.message : error);
  }

  console.log('\nIssuer registration completed!');
  console.log('Issuer DID:', issuerDid);
  console.log('Issuer Address:', issuerAccount.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });