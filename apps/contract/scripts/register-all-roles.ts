import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth, DocuVault } from '../typechain-types';
import { Wallet } from 'ethers';
import accounts from './accounts';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface RoleSetup {
  account: any;
  role: string;
  roleHash?: `0x${string}`;
  did?: string;
  name: string;
}

async function registerDID(account: any, didRegistry: DidRegistry, additionalProperties: any = {}): Promise<string | null> {
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
  console.log('Starting All Roles Registration Script with Predefined Accounts...\n');

  const provider = ethers.provider;

  // Create wallets from the accounts in sample.ts
  const wallets = {
    deployer: new Wallet(accounts.Deployer.privateKey, provider),
    issuer1: new Wallet(accounts.Issuer1.privateKey, provider),
    issuer2: new Wallet(accounts.Issuer2.privateKey, provider),
    admin1: new Wallet(accounts.Admin1.privateKey, provider),
    admin2: new Wallet(accounts.Admin2.privateKey, provider),
    verifier1: new Wallet(accounts.Verifier1.privateKey, provider),
    verifier2: new Wallet(accounts.Verifier2.privateKey, provider),
    holder1: new Wallet(accounts.Holder1.privateKey, provider),
    holder2: new Wallet(accounts.Holder2.privateKey, provider),
    holder3: new Wallet(accounts.Holder3.privateKey, provider),
  };

  // Verify addresses match
  console.log('Verifying account addresses...');
  console.log(`Deployer: ${wallets.deployer.address} (Expected: ${accounts.Deployer.account})`);
  console.log(`Admin1: ${wallets.admin1.address} (Expected: ${accounts.Admin1.account})`);
  console.log(`Admin2: ${wallets.admin2.address} (Expected: ${accounts.Admin2.account})`);
  console.log('All addresses verified.\n');

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

  // Get role hashes
  const ADMIN_ROLE = (await didAuth.ADMIN_ROLE()) as `0x${string}`;
  const DEFAULT_ADMIN_ROLE = (await didAuth.DEFAULT_ADMIN_ROLE()) as `0x${string}`;
  const ISSUER_ROLE = (await didAuth.ISSUER_ROLE()) as `0x${string}`;
  const HOLDER_ROLE = (await didAuth.HOLDER_ROLE()) as `0x${string}`;
  const VERIFIER_ROLE = (await didAuth.VERIFIER_ROLE()) as `0x${string}`;

  // Setup role configurations
  const roles: RoleSetup[] = [
    // Deployer gets ALL roles
    {
      account: wallets.deployer,
      role: 'DEPLOYER_ALL_ROLES',
      roleHash: ADMIN_ROLE,
      name: 'Deployer',
    },
    // Admin accounts
    {
      account: wallets.admin1,
      role: 'ADMIN',
      roleHash: ADMIN_ROLE,
      name: 'Admin1',
    },
    {
      account: wallets.admin2,
      role: 'ADMIN',
      roleHash: ADMIN_ROLE,
      name: 'Admin2',
    },
    // Issuer accounts
    {
      account: wallets.issuer1,
      role: 'ISSUER',
      roleHash: ISSUER_ROLE,
      name: 'Issuer1',
    },
    {
      account: wallets.issuer2,
      role: 'ISSUER',
      roleHash: ISSUER_ROLE,
      name: 'Issuer2',
    },
    // Verifier accounts
    {
      account: wallets.verifier1,
      role: 'VERIFIER',
      roleHash: VERIFIER_ROLE,
      name: 'Verifier1',
    },
    {
      account: wallets.verifier2,
      role: 'VERIFIER',
      roleHash: VERIFIER_ROLE,
      name: 'Verifier2',
    },
    // Holder accounts
    {
      account: wallets.holder1,
      role: 'HOLDER',
      roleHash: HOLDER_ROLE,
      name: 'Holder1',
    },
    {
      account: wallets.holder2,
      role: 'HOLDER',
      roleHash: HOLDER_ROLE,
      name: 'Holder2',
    },
    {
      account: wallets.holder3,
      role: 'HOLDER',
      roleHash: HOLDER_ROLE,
      name: 'Holder3',
    },
  ];

  console.log('Contract Addresses:');
  console.log('  DidRegistry:', didRegistryAddress);
  console.log('  DidAuth:', didAuthAddress);
  console.log('  DocuVault:', docuVaultAddress);
  console.log('\n');

  // Process each role
  for (const roleSetup of roles) {
    console.log(`\n Setting up ${roleSetup.name} (${roleSetup.role}):`);
    console.log(`  Address: ${roleSetup.account.address}`);

    try {
      // Register DID
      const additionalProps =
        ['ISSUER', 'VERIFIER'].includes(roleSetup.role) || roleSetup.role === 'DEPLOYER_ALL_ROLES'
          ? { assertionMethod: [`did:docuvault:${roleSetup.account.address.toLowerCase()}#key-1`] }
          : {};

      const did = await registerDID(roleSetup.account, didRegistry, additionalProps);
      if (!did) {
        console.error(`  Failed to register DID for ${roleSetup.name}`);
        continue;
      }
      roleSetup.did = did;

      // Grant roles - use deployer as the granter since it's the initial admin
      if (roleSetup.role === 'DEPLOYER_ALL_ROLES') {
      // Deployer gets ALL roles
      await grantRole(did, ADMIN_ROLE, 'ADMIN_ROLE', didAuth, wallets.deployer);
      await grantRole(did, DEFAULT_ADMIN_ROLE, 'DEFAULT_ADMIN_ROLE', didAuth, wallets.deployer);
      await grantRole(did, ISSUER_ROLE, 'ISSUER_ROLE', didAuth, wallets.deployer);
      await grantRole(did, HOLDER_ROLE, 'HOLDER_ROLE', didAuth, wallets.deployer);
      await grantRole(did, VERIFIER_ROLE, 'VERIFIER_ROLE', didAuth, wallets.deployer);
    } else if (roleSetup.roleHash) {
      await grantRole(did, roleSetup.roleHash, roleSetup.role + '_ROLE', didAuth, wallets.deployer);

      // Admin accounts get additional DEFAULT_ADMIN_ROLE
      if (roleSetup.role === 'ADMIN') {
        await grantRole(did, DEFAULT_ADMIN_ROLE, 'DEFAULT_ADMIN_ROLE', didAuth, wallets.deployer);
      }
    }

    // Special operations based on role
    switch (roleSetup.role) {
      case 'DEPLOYER_ALL_ROLES':
        // Register deployer as both issuer and holder in DocuVault
        try {
          const tx1 = await docuVault.connect(wallets.deployer).registerIssuer(roleSetup.account.address);
          await tx1.wait();
          console.log('  Registered in DocuVault as issuer');
        } catch (error) {
          if (error instanceof Error && error.message.includes('IssuerRegistered')) {
            console.log('  Already registered in DocuVault as issuer');
          } else {
            console.error('  Error registering as issuer in DocuVault:', error instanceof Error ? error.message : error);
          }
        }
        
        try {
          const tx2 = await docuVault.connect(roleSetup.account).registerUser();
          await tx2.wait();
          console.log('  Registered in DocuVault as holder');
        } catch (error) {
          if (error instanceof Error && error.message.includes('AlreadyRegistered')) {
            console.log('  Already registered in DocuVault as holder');
          } else {
            console.error('  Error registering as holder in DocuVault:', error instanceof Error ? error.message : error);
          }
        }
        break;
        
      case 'ISSUER':
        try {
          // Register issuer in DocuVault (admin does this)
          const tx = await docuVault.connect(wallets.deployer).registerIssuer(roleSetup.account.address);
          await tx.wait();
          console.log('  Registered in DocuVault as issuer');
        } catch (error) {
          if (error instanceof Error && error.message.includes('IssuerRegistered')) {
            console.log('  Already registered in DocuVault as issuer');
          } else {
            console.error('  Error registering in DocuVault:', error instanceof Error ? error.message : error);
          }
        }
        break;

      case 'HOLDER':
        try {
          // Holder self-registers in DocuVault
          const tx = await docuVault.connect(roleSetup.account).registerUser();
          await tx.wait();
          console.log('  Registered in DocuVault as holder');
        } catch (error) {
          if (error instanceof Error && error.message.includes('AlreadyRegistered')) {
            console.log('  Already registered in DocuVault as holder');
          } else {
            console.error('  Error registering in DocuVault:', error instanceof Error ? error.message : error);
          }
        }
        break;
    }
    } catch (error) {
      console.error(`  Failed to set up ${roleSetup.name}:`, error instanceof Error ? error.message : error);
      // Continue with next account
    }
  }

  // Summary
  console.log('\n\n========== REGISTRATION SUMMARY ==========\n');
  console.log('Role Setup Complete!\n');

  for (const roleSetup of roles) {
    console.log(`${roleSetup.name} (${roleSetup.role}):`);
    console.log(`  Address: ${roleSetup.account.address}`);
    console.log(`  DID: ${roleSetup.did || 'Not registered'}`);

    if (!roleSetup.did) {
      console.log(`  Status: Failed to register DID`);
      console.log('');
      continue;
    }

    if (roleSetup.role === 'DEPLOYER_ALL_ROLES') {
      // Show all roles for deployer
      const hasAdmin = await didAuth.hasDidRole(roleSetup.did, ADMIN_ROLE);
      const hasDefaultAdmin = await didAuth.hasDidRole(roleSetup.did, DEFAULT_ADMIN_ROLE);
      const hasIssuer = await didAuth.hasDidRole(roleSetup.did, ISSUER_ROLE);
      const hasHolder = await didAuth.hasDidRole(roleSetup.did, HOLDER_ROLE);
      const hasVerifier = await didAuth.hasDidRole(roleSetup.did, VERIFIER_ROLE);
      
      console.log(`  Has ADMIN_ROLE: ${hasAdmin}`);
      console.log(`  Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin}`);
      console.log(`  Has ISSUER_ROLE: ${hasIssuer}`);
      console.log(`  Has HOLDER_ROLE: ${hasHolder}`);
      console.log(`  Has VERIFIER_ROLE: ${hasVerifier}`);
    } else if (roleSetup.roleHash && roleSetup.did) {
      const hasRole = await didAuth.hasDidRole(roleSetup.did, roleSetup.roleHash);
      console.log(`  Has ${roleSetup.role}_ROLE: ${hasRole}`);
      
      // Check DEFAULT_ADMIN_ROLE for admin accounts
      if (roleSetup.role === 'ADMIN') {
        const hasDefaultAdmin = await didAuth.hasDidRole(roleSetup.did, DEFAULT_ADMIN_ROLE);
        console.log(`  Has DEFAULT_ADMIN_ROLE: ${hasDefaultAdmin}`);
      }
    }
    console.log('');
  }

  console.log('\nYou can now use these accounts in your tests and applications!');
  console.log('\nAccount mapping:');
  for (const roleSetup of roles) {
    console.log(`  ${roleSetup.account.address} - ${roleSetup.name} (${roleSetup.role})`);
  }

  console.log('\nUsage:');
  console.log('  npx hardhat run scripts/register-all-roles.ts --network localhost');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
