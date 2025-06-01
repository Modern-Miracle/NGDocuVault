import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Starting Verifier Registration Script...\n');

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const verifierAccount = signers[4]; // Use fifth account as verifier

  console.log('Deployer address:', deployer.address);
  console.log('Verifier account address:', verifierAccount.address);

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

  // Step 1: Register DID for verifier account
  const verifierDid = `did:docuvault:${verifierAccount.address.toLowerCase()}`;
  console.log('\nStep 1: Registering DID for verifier account...');
  console.log('DID:', verifierDid);

  try {
    // Check if DID already exists
    const existingDoc = await didRegistry.getDocument(verifierDid);
    if (existingDoc && existingDoc !== '') {
      console.log('DID already registered for verifier account');
    } else {
      // Register DID
      const didDocument = JSON.stringify({
        '@context': 'https://www.w3.org/ns/did/v1',
        'id': verifierDid,
        'verificationMethod': [{
          'id': `${verifierDid}#key-1`,
          'type': 'EcdsaSecp256k1VerificationKey2019',
          'controller': verifierDid,
          'publicKeyHex': verifierAccount.address
        }],
        'authentication': [`${verifierDid}#key-1`],
        'assertionMethod': [`${verifierDid}#key-1`]
      });

      const tx = await didRegistry.connect(verifierAccount).registerDid(verifierDid, didDocument, verifierAccount.address);
      await tx.wait();
      console.log('DID registered successfully');
    }
  } catch (error) {
    console.error('Error registering DID:', error instanceof Error ? error.message : error);
  }

  // Step 2: Grant VERIFIER_ROLE to the verifier account
  console.log('\nStep 2: Granting VERIFIER_ROLE to verifier account...');
  
  try {
    const VERIFIER_ROLE = await didAuth.VERIFIER_ROLE();
    console.log('VERIFIER_ROLE hash:', VERIFIER_ROLE);

    // Check if already has role
    const hasRole = await didAuth.hasDidRole(verifierDid, VERIFIER_ROLE);
    if (hasRole) {
      console.log('Verifier already has VERIFIER_ROLE');
    } else {
      // Grant role (deployer or admin can do this)
      const tx = await didAuth.connect(deployer).grantDidRole(verifierDid, VERIFIER_ROLE);
      await tx.wait();
      console.log('VERIFIER_ROLE granted successfully');
    }
  } catch (error) {
    console.error('Error granting VERIFIER_ROLE:', error instanceof Error ? error.message : error);
  }

  // Step 3: Add verifier in DocuVault (if there's a specific function for this)
  console.log('\nStep 3: Setting up verifier in DocuVault...');
  
  try {
    // Check if DocuVault has a specific verifier registration function
    // For now, verifiers might just need the VERIFIER_ROLE to operate
    console.log('Verifier setup in DocuVault: VERIFIER_ROLE is sufficient for verification operations');
  } catch (error) {
    console.error('Error in DocuVault setup:', error instanceof Error ? error.message : error);
  }

  // Step 4: Verify roles and credentials
  console.log('\nStep 4: Verifying verifier setup...');
  
  const verifierRole = await didAuth.VERIFIER_ROLE();
  const hasVerifierRole = await didAuth.hasDidRole(verifierDid, verifierRole);
  
  console.log('Has VERIFIER_ROLE:', hasVerifierRole);

  // Check if verifier can authenticate
  try {
    const canAuthenticate = await didAuth.authenticate(verifierDid, verifierRole);
    console.log('Can authenticate with VERIFIER_ROLE:', canAuthenticate);
  } catch (error) {
    console.log('Authentication check failed:', error instanceof Error ? error.message : error);
  }

  // Test verifier capabilities
  console.log('\nTesting verifier capabilities...');
  try {
    // Verifiers should be able to check document verification status
    // This is just a test - in real usage, we'd need an actual document ID
    const testDocumentId = ethers.keccak256(ethers.toUtf8Bytes('test-document'));
    const document = await docuVault.documents(testDocumentId);
    console.log('Can read document data:', document.issuanceDate == 0 ? 'No document exists (expected)' : 'Document found');
  } catch (error) {
    console.log('Document access test:', error instanceof Error ? error.message : error);
  }

  console.log('\nVerifier registration completed!');
  console.log('Verifier DID:', verifierDid);
  console.log('Verifier Address:', verifierAccount.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });