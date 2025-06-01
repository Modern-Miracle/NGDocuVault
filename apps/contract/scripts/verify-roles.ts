import hre from 'hardhat';
const { ethers } = hre;
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DidRegistry, DidAuth } from '../typechain-types';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Verifying Role Setup...\n');

  // Get signers
  const signers = await ethers.getSigners();

  // Get contract addresses from environment
  const didRegistryAddress = process.env.DID_REGISTRY_CONTRACT_ADDRESS;
  const didAuthAddress = process.env.DID_AUTH_CONTRACT_ADDRESS;
  const docuVaultAddress = process.env.DOCU_VAULT_CONTRACT_ADDRESS;

  if (!didRegistryAddress || !didAuthAddress || !docuVaultAddress) {
    throw new Error('Contract addresses not found in environment variables.');
  }

  // Get contract instances
  const didAuth = await ethers.getContractAt('DidAuth', didAuthAddress) as unknown as DidAuth;
  const didRegistry = await ethers.getContractAt('DidRegistry', didRegistryAddress) as unknown as DidRegistry;

  // Get all role hashes
  const roles: Record<string, `0x${string}`> = {
    ADMIN_ROLE: await didAuth.ADMIN_ROLE() as `0x${string}`,
    DEFAULT_ADMIN_ROLE: await didAuth.DEFAULT_ADMIN_ROLE() as `0x${string}`,
    ISSUER_ROLE: await didAuth.ISSUER_ROLE() as `0x${string}`,
    HOLDER_ROLE: await didAuth.HOLDER_ROLE() as `0x${string}`,
    VERIFIER_ROLE: await didAuth.VERIFIER_ROLE() as `0x${string}`,
    OPERATOR_ROLE: await didAuth.OPERATOR_ROLE() as `0x${string}`,
  };

  console.log('Role Hashes:');
  Object.entries(roles).forEach(([name, hash]) => {
    console.log(`  ${name}: ${hash}`);
  });
  console.log('\n');

  // Check each account
  const accountRoles = [
    { index: 0, name: 'Deployer' },
    { index: 1, name: 'Admin' },
    { index: 2, name: 'Issuer' },
    { index: 3, name: 'Holder' },
    { index: 4, name: 'Verifier' },
  ];

  console.log('Account Status:\n');

  for (const account of accountRoles) {
    if (account.index >= signers.length) continue;

    const signer = signers[account.index];
    const address = signer.address;
    const did = `did:docuvault:${address.toLowerCase()}`;

    console.log(`${account.name} (Account ${account.index}):`);
    console.log(`  Address: ${address}`);
    console.log(`  DID: ${did}`);

    // Check if DID is registered
    try {
      const didDoc = await didRegistry.getDocument(did);
      console.log(`  DID Registered: ${didDoc && didDoc !== '' ? 'Yes' : 'No'}`);
    } catch (error) {
      console.log(`  DID Registered: No`);
    }

    // Check roles
    console.log('  Roles:');
    for (const [roleName, roleHash] of Object.entries(roles)) {
      try {
        const hasRole = await didAuth.hasDidRole(did, roleHash);
        if (hasRole) {
          console.log(`    ✓ ${roleName}`);
        }
      } catch (error) {
        // Role not granted
      }
    }
    console.log('');
  }

  // Test authentication
  console.log('Authentication Tests:\n');

  const testAuth = async (accountIndex: number, credential: string, expectedRole: string) => {
    if (accountIndex >= signers.length) return;

    const signer = signers[accountIndex];
    const did = `did:docuvault:${signer.address.toLowerCase()}`;
    
    try {
      const result = await didAuth.authenticate(did, roles[expectedRole]);
      console.log(`  ${accountRoles[accountIndex].name} authentication: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log(`  ${accountRoles[accountIndex].name} authentication: Failed (${error instanceof Error ? error.message : error})`);
    }
  };

  await testAuth(1, '', 'ADMIN_ROLE');
  await testAuth(2, '', 'ISSUER_ROLE');
  await testAuth(3, '', 'HOLDER_ROLE');
  await testAuth(4, '', 'VERIFIER_ROLE');

  console.log('\nVerification complete!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });