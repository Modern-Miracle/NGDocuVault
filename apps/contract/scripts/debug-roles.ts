import hre from 'hardhat';
const { ethers } = hre;
import { DidRegistry } from '../typechain-types';

async function main() {
  console.log('Debug Script - Testing DID Registration\n');

  // Get contract address
  const didRegistryAddress = process.env.DID_REGISTRY_CONTRACT_ADDRESS;
  if (!didRegistryAddress) {
    throw new Error('DID_REGISTRY_CONTRACT_ADDRESS not found in environment');
  }

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log('Signer address:', signer.address);

  // Get contract instance
  const didRegistry = await ethers.getContractAt('DidRegistry', didRegistryAddress) as unknown as DidRegistry;

  // Test DID
  const testDid = `did:docuvault:${signer.address.toLowerCase()}`;
  console.log('Test DID:', testDid);

  // Check if DID already exists
  try {
    const existingDoc = await didRegistry.getDocument(testDid);
    console.log('Existing document:', existingDoc);
    
    if (existingDoc && existingDoc !== '') {
      console.log('DID already registered');
      
      // Try to check if active
      const isActive = await didRegistry.isActive(testDid);
      console.log('Is active:', isActive);
    } else {
      console.log('DID not registered yet');
    }
  } catch (error) {
    console.log('Error checking existing DID:', error);
  }

  // Try to register DID
  console.log('\nAttempting to register DID...');
  
  const didDocument = JSON.stringify({
    '@context': 'https://www.w3.org/ns/did/v1',
    'id': testDid,
    'verificationMethod': [{
      'id': `${testDid}#key-1`,
      'type': 'EcdsaSecp256k1VerificationKey2019',
      'controller': testDid,
      'publicKeyHex': signer.address
    }],
    'authentication': [`${testDid}#key-1`]
  });

  try {
    console.log('Calling registerDid with:');
    console.log('  DID:', testDid);
    console.log('  Document:', didDocument);
    console.log('  PublicKey:', signer.address);
    
    const tx = await didRegistry.registerDid(testDid, didDocument, signer.address);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction mined in block:', receipt?.blockNumber);
    console.log('Gas used:', receipt?.gasUsed.toString());
    
    // Check if DID is now registered
    const newDoc = await didRegistry.getDocument(testDid);
    console.log('New document:', newDoc);
  } catch (error: any) {
    console.error('Error registering DID:', error);
    
    // Try to decode error
    if (error.data) {
      console.log('Error data:', error.data);
    }
    if (error.reason) {
      console.log('Error reason:', error.reason);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });