import hre from 'hardhat';
const { ethers } = hre;
import * as fs from 'fs';
import * as path from 'path';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * Deploys the DataRegistry contract with all required dependencies
 *
 * The DataRegistry contract requires:
 * - A token address (ERC20 token for payments)
 * - A provider address (payable address that receives service fees)
 * - A service fee amount
 * - A DidAuth contract address (for DID-based authentication)
 */
async function main() {
  const { deployments, getNamedAccounts, network } = hre;

  // Get the named accounts from the configuration
  try {
    const { deployer } = await getNamedAccounts();

    console.log('Deploying contracts with account:', deployer);

    // Get the account's balance
    const balance = await ethers.provider.getBalance(deployer);
    console.log('Account balance:', ethers.formatEther(balance));

    // Deploy DidRegistry contract first
    console.log('\nDeploying DidRegistry contract...');
    const DidRegistry = await ethers.getContractFactory('DidRegistry');
    const didRegistry = await DidRegistry.deploy();
    await didRegistry.waitForDeployment();
    const didRegistryAddress = await didRegistry.getAddress();
    console.log('DidRegistry deployed to:', didRegistryAddress);

    // Deploy DidVerifier with DidRegistry dependency
    console.log('\nDeploying DidVerifier contract...');
    const DidVerifier = await ethers.getContractFactory('DidVerifier');
    const didVerifier = await DidVerifier.deploy(didRegistryAddress);
    await didVerifier.waitForDeployment();
    const didVerifierAddress = await didVerifier.getAddress();
    console.log('DidVerifier deployed to:', didVerifierAddress);

    // Deploy DidIssuer with DidRegistry dependency
    console.log('\nDeploying DidIssuer contract...');
    const DidIssuer = await ethers.getContractFactory('DidIssuer');
    const didIssuer = await DidIssuer.deploy(didRegistryAddress);
    await didIssuer.waitForDeployment();
    const didIssuerAddress = await didIssuer.getAddress();
    console.log('DidIssuer deployed to:', didIssuerAddress);

    // Deploy DidAuth with all dependencies
    console.log('\nDeploying DidAuth contract...');
    const DidAuth = await ethers.getContractFactory('DidAuth');
    const didAuth = await DidAuth.deploy(didRegistryAddress, didVerifierAddress, didIssuerAddress, deployer);
    await didAuth.waitForDeployment();
    const didAuthAddress = await didAuth.getAddress();
    console.log('DidAuth deployed to:', didAuthAddress);

    // IMPORTANT: Register DID for deployer first
    console.log('\nRegistering DID for deployer...');
    const deployerDid = `did:docuvault:${deployer.toLowerCase()}`;
    const didDocument = JSON.stringify({
      '@context': 'https://www.w3.org/ns/did/v1',
      id: deployerDid,
      verificationMethod: [
        {
          id: `${deployerDid}#key-1`,
          type: 'EcdsaSecp256k1VerificationKey2019',
          controller: deployerDid,
          publicKeyHex: deployer,
        },
      ],
      authentication: [`${deployerDid}#key-1`],
    });

    try {
      const registerTx = await didRegistry.registerDid(deployerDid, didDocument, deployer);
      await registerTx.wait();
      console.log('Deployer DID registered:', deployerDid);
    } catch (error) {
      console.log('Note: DID registration failed or already exists:', error);
    }

    // Deploy DocuVault contract
    console.log('\nDeploying DocuVault contract...');
    const DocuVault = await ethers.getContractFactory('DocuVault');
    const docuVault = await DocuVault.deploy();
    await docuVault.waitForDeployment();
    const docuVaultAddress = await docuVault.getAddress();
    console.log('DocuVault deployed to:', docuVaultAddress);

    // Deploy VerifierFactory contract
    console.log('\nDeploying VerifierFactory contract...');
    const VerifierFactory = await ethers.getContractFactory('VerifierFactory');
    const verifierFactory = await VerifierFactory.deploy();
    await verifierFactory.waitForDeployment();
    const verifierFactoryAddress = await verifierFactory.getAddress();
    console.log('VerifierFactory deployed to:', verifierFactoryAddress);

    // Get verifier contracts from factory
    const verifierFactoryContract = await ethers.getContractAt('VerifierFactory', verifierFactoryAddress);
    const ageVerifierAddress = await verifierFactoryContract.ageverifier();
    const fhirVerifierAddress = await verifierFactoryContract.fhirverifier();
    const hashVerifierAddress = await verifierFactoryContract.hashverifier();

    console.log('\nAgeVerifier deployed to:', ageVerifierAddress);
    console.log('FhirVerifier deployed to:', fhirVerifierAddress);
    console.log('HashVerifier deployed to:', hashVerifierAddress);

    // Collect all contract addresses
    const envVars = {
      DID_REGISTRY_CONTRACT_ADDRESS: didRegistryAddress,
      DID_VERIFIER_CONTRACT_ADDRESS: didVerifierAddress,
      DID_ISSUER_CONTRACT_ADDRESS: didIssuerAddress,
      DID_AUTH_CONTRACT_ADDRESS: didAuthAddress,
      DOCU_VAULT_CONTRACT_ADDRESS: docuVaultAddress,
      VERIFIER_FACTORY_CONTRACT_ADDRESS: verifierFactoryAddress,
      AGE_VERIFIER_CONTRACT_ADDRESS: ageVerifierAddress,
      FHIR_VERIFIER_CONTRACT_ADDRESS: fhirVerifierAddress,
      HASH_VERIFIER_CONTRACT_ADDRESS: hashVerifierAddress,
    };

    // Path to the .env files
    const contractEnv = path.resolve(__dirname, '../.env');

    // Create .env file content
    let envContent = '';
    Object.entries(envVars).forEach(([key, value]) => {
      envContent += `${key}=${value}\n`;
    });

    // Write to .env file
    fs.writeFileSync(contractEnv, envContent);

    console.log('\nContract addresses saved to .env file:');
    console.log(JSON.stringify(envVars, null, 2));

    // Update subgraph configuration if needed
    console.log('\nDeployment complete!');
    console.log(
      '\nIMPORTANT: Run "npx hardhat run scripts/setup-initial-admin.ts --network localhost" to set up admin roles.'
    );
  } catch (error) {
    console.error('Error during deployment:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
