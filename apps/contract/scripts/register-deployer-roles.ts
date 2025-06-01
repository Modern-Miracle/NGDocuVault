import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';
import { Wallet } from 'ethers';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Your provided account details
const CUSTOM_ACCOUNT = {
  privateKey: '0x',
  address: '0x04E1B236182b9703535ecB490697b79B45453Ba1', // This is the deployer address from deployment
};

async function registerDID(
  account: any,
  didRegistry: DidRegistry,
  additionalProperties: any = {}
): Promise<string | null> {
  const did = `did:docuvault:${account.address.toLowerCase()}`;

  try {
    // Try to check if address already has a DID
    console.log(`  Checking if address already has a DID...`);
    try {
      const existingDid = await didRegistry.addressToDID(account.address);
      if (existingDid && existingDid !== '') {
        console.log(`  Address already has DID: ${existingDid}`);
        return existingDid;
      }
    } catch (e) {
      // Address doesn't have a DID yet, continue with registration
    }
    console.log(`  Address does not have a DID, proceeding with registration...`);

    // Register DID
    const didDocument = JSON.stringify({
      '@context': 'https://www.w3.org/ns/did/v1',
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: did,
          publicKeyHex: account.address,
        },
      ],
      authentication: [`${did}#key-1`],
      ...additionalProperties,
    });

    console.log(`  Calling registerDid with:`);
    console.log(`    - did: ${did}`);
    console.log(`    - document length: ${didDocument.length} chars`);
    console.log(`    - publicKey: ${account.address}`);

    const tx = await didRegistry.connect(account).registerDid(did, didDocument, account.address);
    const receipt = await tx.wait();
    console.log(`  Transaction hash: ${receipt.hash}`);
    console.log(`  DID registered successfully: ${did}`);
    return did;
  } catch (error: any) {
    console.error(`  Raw error:`, error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Check if it's a contract error
    if (error.data) {
      console.error(`  Error data:`, error.data);
    }

    if (errorMsg.includes('0x7c24598f')) {
      console.error(`  Error registering DID: Invalid DID format`);
    } else if (errorMsg.includes('0x446d4ac6')) {
      console.error(`  Error registering DID: DID already registered`);
    } else {
      console.error(`  Error registering DID: ${errorMsg}`);
    }
    return null; // Return null to indicate failure
  }
}

async function grantRole(
  did: string,
  roleHash: `0x${string}`,
  roleName: string,
  didAuth: DidAuth,
  granter: any
): Promise<boolean> {
  try {
    // Check if already has role
    const hasRole = await didAuth.hasDidRole(did, roleHash);
    if (hasRole) {
      console.log(`  Already has ${roleName}`);
      return true;
    }

    // Grant role
    const tx = await didAuth.connect(granter).grantDidRole(did, roleHash);
    await tx.wait();
    console.log(`  ${roleName} granted successfully`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes('0x7c24598f')) {
      console.error(`  Error granting ${roleName}: Invalid DID format`);
    } else {
      console.error(`  Error granting ${roleName}: ${errorMsg}`);
    }
    return false;
  }
}

async function main() {
  console.log('Starting Deployer Role Registration Script...\n');

  const provider = ethers.provider;

  // Create wallet from your private key
  const wallet = new Wallet(CUSTOM_ACCOUNT.privateKey, provider);

  console.log(`Deployer Address: ${wallet.address}`);
  console.log(`Expected Address: ${CUSTOM_ACCOUNT.address}`);

  if (wallet.address !== CUSTOM_ACCOUNT.address) {
    throw new Error('Address mismatch! Check private key and address.');
  }

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get contract addresses - use the deployed addresses from Sepolia
  const didRegistryAddress = '0xAe410e4483ce22Db8A7C6a815b20Bce2AcB7C78B';
  const didAuthAddress = '0x0b7F3f1436A47e33f953521bBFD2887A90b2FA60';
  const docuVaultAddress = '0x9F2e9D5029FE75c0112b64974f98784402efb7bB';

  // Get contract instances
  const didRegistry = (await ethers.getContractAt('DidRegistry', didRegistryAddress)) as unknown as DidRegistry;
  const didAuth = (await ethers.getContractAt('DidAuth', didAuthAddress)) as unknown as DidAuth;
  const docuVault = (await ethers.getContractAt('DocuVault', docuVaultAddress)) as unknown as DocuVault;

  // Get role hashes
  const ADMIN_ROLE = (await didAuth.ADMIN_ROLE()) as `0x${string}`;
  const DEFAULT_ADMIN_ROLE = (await didAuth.DEFAULT_ADMIN_ROLE()) as `0x${string}`;
  const ISSUER_ROLE = (await didAuth.ISSUER_ROLE()) as `0x${string}`;
  const HOLDER_ROLE = (await didAuth.HOLDER_ROLE()) as `0x${string}`;
  const VERIFIER_ROLE = (await didAuth.VERIFIER_ROLE()) as `0x${string}`;

  console.log('Contract Addresses:');
  console.log('  DidRegistry:', didRegistryAddress);
  console.log('  DidAuth:', didAuthAddress);
  console.log('  DocuVault:', docuVaultAddress);
  console.log('\n');

  console.log('Role Hashes:');
  console.log('  DEFAULT_ADMIN_ROLE:', DEFAULT_ADMIN_ROLE);
  console.log('  ADMIN_ROLE:', ADMIN_ROLE);
  console.log('  ISSUER_ROLE:', ISSUER_ROLE);
  console.log('  HOLDER_ROLE:', HOLDER_ROLE);
  console.log('  VERIFIER_ROLE:', VERIFIER_ROLE);
  console.log('\n');

  // Register DID with additional properties for all roles
  console.log('=== REGISTERING DID ===');
  const additionalProps = {
    assertionMethod: [`did:docuvault:${wallet.address.toLowerCase()}#key-1`],
  };

  const did = await registerDID(wallet, didRegistry, additionalProps);
  if (!did) {
    console.error('Failed to register DID. Exiting.');
    return;
  }

  // Grant ALL roles to the deployer
  console.log('\n=== GRANTING ROLES ===');
  await grantRole(did, DEFAULT_ADMIN_ROLE, 'DEFAULT_ADMIN_ROLE', didAuth, wallet);
  await grantRole(did, ADMIN_ROLE, 'ADMIN_ROLE', didAuth, wallet);
  await grantRole(did, ISSUER_ROLE, 'ISSUER_ROLE', didAuth, wallet);
  await grantRole(did, HOLDER_ROLE, 'HOLDER_ROLE', didAuth, wallet);
  await grantRole(did, VERIFIER_ROLE, 'VERIFIER_ROLE', didAuth, wallet);

  // Register in DocuVault
  console.log('\n=== REGISTERING IN DOCU VAULT ===');

  // Register as issuer
  try {
    const tx1 = await docuVault.connect(wallet).registerIssuer(wallet.address);
    await tx1.wait();
    console.log('  Registered in DocuVault as issuer');
  } catch (error) {
    if (error instanceof Error && error.message.includes('IssuerRegistered')) {
      console.log('  Already registered in DocuVault as issuer');
    } else {
      console.error('  Error registering as issuer in DocuVault:', error instanceof Error ? error.message : error);
    }
  }

  // Register as holder/user
  try {
    const tx2 = await docuVault.connect(wallet).registerUser();
    await tx2.wait();
    console.log('  Registered in DocuVault as holder');
  } catch (error) {
    if (error instanceof Error && error.message.includes('AlreadyRegistered')) {
      console.log('  Already registered in DocuVault as holder');
    } else {
      console.error('  Error registering as holder in DocuVault:', error instanceof Error ? error.message : error);
    }
  }

  // Final verification
  console.log('\n=== VERIFICATION ===');
  console.log(`\nDeployer Account: ${wallet.address}`);
  console.log(`DID: ${did}`);

  const hasDefaultAdmin = await didAuth.hasDidRole(did, DEFAULT_ADMIN_ROLE);
  const hasAdmin = await didAuth.hasDidRole(did, ADMIN_ROLE);
  const hasIssuer = await didAuth.hasDidRole(did, ISSUER_ROLE);
  const hasHolder = await didAuth.hasDidRole(did, HOLDER_ROLE);
  const hasVerifier = await didAuth.hasDidRole(did, VERIFIER_ROLE);

  console.log(`\nRole Status:`);
  console.log(`  Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin}`);
  console.log(`  Has ADMIN_ROLE: ${hasAdmin}`);
  console.log(`  Has ISSUER_ROLE: ${hasIssuer}`);
  console.log(`  Has HOLDER_ROLE: ${hasHolder}`);
  console.log(`  Has VERIFIER_ROLE: ${hasVerifier}`);

  console.log('\n✅ Deployer registration complete!');
  console.log(`\nYour account (${wallet.address}) now has ALL roles:`);
  console.log('  - DEFAULT_ADMIN_ROLE (can manage other admins)');
  console.log('  - ADMIN_ROLE (administrative functions)');
  console.log('  - ISSUER_ROLE (can issue credentials)');
  console.log('  - HOLDER_ROLE (can hold documents)');
  console.log('  - VERIFIER_ROLE (can verify credentials)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
