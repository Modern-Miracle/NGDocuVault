import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Starting Holder Registration Script...\n');

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const holderAccount = signers[3]; // Use fourth account as holder

  console.log('Deployer address:', deployer.address);
  console.log('Holder account address:', holderAccount.address);

  // Get contract addresses from environment
  const didRegistryAddress = process.env.DID_REGISTRY_CONTRACT_ADDRESS;
  const didAuthAddress = process.env.DID_AUTH_CONTRACT_ADDRESS;
  const docuVaultAddress = process.env.DOCU_VAULT_CONTRACT_ADDRESS;

  if (!didRegistryAddress || !didAuthAddress || !docuVaultAddress) {
    throw new Error('Contract addresses not found in environment variables. Please run deploy script first.');
  }

  // Get contract instances
  const didRegistry = (await ethers.getContractAt('DidRegistry', didRegistryAddress)) as unknown as DidRegistry;
  const didAuth = (await ethers.getContractAt('DidAuth', didAuthAddress)) as unknown as DidAuth;
  const docuVault = (await ethers.getContractAt('DocuVault', docuVaultAddress)) as unknown as DocuVault;

  // Step 1: Register DID for holder account
  const holderDid = `did:docuvault:${holderAccount.address.toLowerCase()}`;
  console.log('\nStep 1: Registering DID for holder account...');
  console.log('DID:', holderDid);

  try {
    // Check if DID already exists
    const existingDoc = await didRegistry.getDocument(holderDid);
    if (existingDoc && existingDoc !== '') {
      console.log('DID already registered for holder account');
    } else {
      // Register DID
      const didDocument = JSON.stringify({
        '@context': 'https://www.w3.org/ns/did/v1',
        id: holderDid,
        verificationMethod: [
          {
            id: `${holderDid}#key-1`,
            type: 'EcdsaSecp256k1VerificationKey2019',
            controller: holderDid,
            publicKeyHex: holderAccount.address,
          },
        ],
        authentication: [`${holderDid}#key-1`],
      });

      const tx = await didRegistry.connect(holderAccount).registerDid(holderDid, didDocument, holderAccount.address);
      await tx.wait();
      console.log('DID registered successfully');
    }
  } catch (error) {
    console.error('Error registering DID:', error);
  }

  // Step 2: Grant HOLDER_ROLE to the holder account
  console.log('\nStep 2: Granting HOLDER_ROLE to holder account...');

  try {
    const HOLDER_ROLE = await didAuth.HOLDER_ROLE();
    console.log('HOLDER_ROLE hash:', HOLDER_ROLE);

    // Check if already has role
    const hasRole = await didAuth.hasDidRole(holderDid, HOLDER_ROLE);
    if (hasRole) {
      console.log('Holder already has HOLDER_ROLE');
    } else {
      // Grant role (deployer or admin can do this)
      const tx = await didAuth.connect(deployer).grantDidRole(holderDid, HOLDER_ROLE);
      await tx.wait();
      console.log('HOLDER_ROLE granted successfully');
    }
  } catch (error) {
    console.error('Error granting HOLDER_ROLE:', error);
  }

  // Step 3: Register user in DocuVault
  console.log('\nStep 3: Registering holder in DocuVault contract...');

  try {
    // Holder registers themselves
    const tx = await docuVault.connect(holderAccount).registerUser();
    await tx.wait();
    console.log('Holder registered in DocuVault successfully');
  } catch (error) {
    if (error instanceof Error && error.message.includes('AlreadyRegistered')) {
      console.log('Holder already registered in DocuVault');
    } else {
      console.error('Error registering holder in DocuVault:', error instanceof Error ? error.message : error);
    }
  }

  // Step 4: Verify roles and setup
  console.log('\nStep 4: Verifying holder setup...');

  const holderRole = await didAuth.HOLDER_ROLE();
  const hasHolderRole = await didAuth.hasDidRole(holderDid, holderRole);

  console.log('Has HOLDER_ROLE:', hasHolderRole);

  // Check if holder can authenticate
  try {
    const canAuthenticate = await didAuth.authenticate(holderDid, holderRole);
    console.log('Can authenticate with HOLDER_ROLE:', canAuthenticate);
  } catch (error) {
    console.log('Authentication check failed:', error instanceof Error ? error.message : error);
  }

  // Check if holder is registered in DocuVault
  try {
    // Try to get holder's documents (should return empty array for new holder)
    const documents = await docuVault.connect(holderAccount).getDocuments(holderAccount.address);
    console.log('Number of documents:', documents.length);
  } catch (error) {
    console.log('Document check:', error instanceof Error ? error.message : error);
  }

  console.log('\nHolder registration completed!');
  console.log('Holder DID:', holderDid);
  console.log('Holder Address:', holderAccount.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
