import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import fs from 'fs';
import path from 'path';

/**
 * Hardhat Deploy script for DocuVault contracts
 * This replaces the previous deploy.ts script with a more predictable deployment process
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('Deploying All Contracts with account:', deployer);
  const balance = await ethers.provider.getBalance(deployer);
  console.log('Account balance:', ethers.formatEther(balance));

  // 1. Deploy DidRegistry contract first
  console.log('\nDeploying DidRegistry contract...');
  const didRegistryDeployment = await deploy('DidRegistry', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true, // speed up deployment on local network (ganache, hardhat), no effect on live networks
  });

  // 2. Deploy DidVerifier with DidRegistry dependency
  console.log('\nDeploying DidVerifier contract...');
  const didVerifierDeployment = await deploy('DidVerifier', {
    from: deployer,
    args: [didRegistryDeployment.address],
    log: true,
    autoMine: true,
  });

  // 3. Deploy DidIssuer with DidRegistry dependency
  console.log('\nDeploying DidIssuer contract...');
  const didIssuerDeployment = await deploy('DidIssuer', {
    from: deployer,
    args: [didRegistryDeployment.address],
    log: true,
    autoMine: true,
  });

  // 4. Deploy DidAuth with all dependencies
  console.log('\nDeploying DidAuth contract...');
  const didAuthDeployment = await deploy('DidAuth', {
    from: deployer,
    args: [didRegistryDeployment.address, didVerifierDeployment.address, didIssuerDeployment.address, deployer],
    log: true,
    autoMine: true,
  });

  // 5. Deploy DocuVault contract
  console.log('\nDeploying DocuVault contract...');
  const docuVaultDeployment = await deploy('DocuVault', {
    from: deployer,
    args: [didAuthDeployment.address],
    log: true,
    autoMine: true,
  });

  // 6. Deploy VerifierFactory contract
  console.log('\nDeploying VerifierFactory contract...');
  const verifierFactoryDeployment = await deploy('VerifierFactory', {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get verifier contracts from factory
  const verifierFactory = await ethers.getContractAt('VerifierFactory', verifierFactoryDeployment.address);
  const ageVerifierAddress = await verifierFactory.ageverifier();
  const fhirVerifierAddress = await verifierFactory.fhirverifier();
  const hashVerifierAddress = await verifierFactory.hashverifier();

  console.log('\nAgeVerifier deployed to:', ageVerifierAddress);
  console.log('FhirVerifier deployed to:', fhirVerifierAddress);
  console.log('HashVerifier deployed to:', hashVerifierAddress);

  // Collect all contract addresses
  const envVars = {
    DID_REGISTRY_CONTRACT_ADDRESS: didRegistryDeployment.address,
    DID_VERIFIER_CONTRACT_ADDRESS: didVerifierDeployment.address,
    DID_ISSUER_CONTRACT_ADDRESS: didIssuerDeployment.address,
    DID_AUTH_CONTRACT_ADDRESS: didAuthDeployment.address,
    DOCU_VAULT_CONTRACT_ADDRESS: docuVaultDeployment.address,
    VERIFIER_FACTORY_CONTRACT_ADDRESS: verifierFactoryDeployment.address,
    AGE_VERIFIER_CONTRACT_ADDRESS: ageVerifierAddress,
    FHIR_VERIFIER_CONTRACT_ADDRESS: fhirVerifierAddress,
    HASH_VERIFIER_CONTRACT_ADDRESS: hashVerifierAddress,
  };

  // Path to the .env files
  const webEnv = path.resolve(__dirname, '../../web/.env');
  const contractEnv = path.resolve(__dirname, '../.env');
  const apiEnv = path.resolve(__dirname, '../../api/.env');
  const graphEnv = path.resolve(__dirname, '../../../packages/subgraph/.env');

  console.log('\nUpdating environment files with contract addresses:');
  console.log('webEnv:', webEnv);
  console.log('contractEnv:', contractEnv);
  console.log('apiEnv:', apiEnv);
  console.log('graphEnv:', graphEnv);

  // Read env files if they exist
  let webEnvContent = fs.existsSync(webEnv) ? fs.readFileSync(webEnv, 'utf8') : '';
  let contractEnvContent = fs.existsSync(contractEnv) ? fs.readFileSync(contractEnv, 'utf8') : '';
  let apiEnvContent = fs.existsSync(apiEnv) ? fs.readFileSync(apiEnv, 'utf8') : '';
  let graphEnvContent = fs.existsSync(graphEnv) ? fs.readFileSync(graphEnv, 'utf8') : '';

  // Update web .env
  Object.entries(envVars).forEach(([key, value]) => {
    // Standard variables
    const regex = new RegExp(`^${key}=.*`, 'gm');
    if (regex.test(webEnvContent)) {
      webEnvContent = webEnvContent.replace(regex, `${key}=${value}`);
    } else {
      webEnvContent += `\n${key}=${value}`;
    }

    // VITE_ variables
    const publicRegex = new RegExp(`^VITE_${key}=.*`, 'gm');
    if (publicRegex.test(webEnvContent)) {
      webEnvContent = webEnvContent.replace(publicRegex, `VITE_${key}=${value}`);
    } else {
      webEnvContent += `\nVITE_${key}=${value}`;
    }
  });

  // Update contract .env
  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*`, 'gm');
    if (regex.test(contractEnvContent)) {
      contractEnvContent = contractEnvContent.replace(regex, `${key}=${value}`);
    } else {
      contractEnvContent += `\n${key}=${value}`;
    }
  });

  // Update API .env with network-specific prefixes
  Object.entries(envVars).forEach(([key, value]) => {
    const prefix =
      network.name === 'hardhat' || network.name === 'localhost'
        ? 'LOCAL_'
        : network.name === 'sepolia'
          ? 'TESTNET_'
          : network.name === 'mainnet'
            ? 'MAINNET_'
            : 'LOCAL_';

    const regex = new RegExp(`^${prefix}${key}=.*`, 'gm');
    if (regex.test(apiEnvContent)) {
      apiEnvContent = apiEnvContent.replace(regex, `${prefix}${key}=${value}`);
    } else {
      apiEnvContent += `\n${prefix}${key}=${value}`;
    }
  });

  // Update subgraph .env
  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*`, 'gm');
    if (regex.test(graphEnvContent)) {
      graphEnvContent = graphEnvContent.replace(regex, `${key}=${value}`);
    } else {
      graphEnvContent += `\n${key}=${value}`;
    }
  });

  // Write updated content back to files
  fs.writeFileSync(webEnv, webEnvContent.trim());
  fs.writeFileSync(contractEnv, contractEnvContent.trim());
  fs.writeFileSync(apiEnv, apiEnvContent.trim());
  fs.writeFileSync(graphEnv, graphEnvContent.trim());

  console.log('\nContract addresses saved to .env files:');
  console.log(JSON.stringify(envVars, null, 2));

  // Set up initial admin role for local development
  if (network.name === 'hardhat' || network.name === 'localhost') {
    console.log('\nSetting up initial admin role for deployer...');

    try {
      // Get contract instances
      const didRegistry = await ethers.getContractAt('DidRegistry', didRegistryDeployment.address);
      const didAuth = await ethers.getContractAt('DidAuth', didAuthDeployment.address);

      // Register a DID for the deployer if they don't have one
      const deployerDid = await didRegistry.addressToDID(deployer);

      if (!deployerDid || deployerDid === '') {
        // Create a DID for the deployer
        const did = `did:eth:${deployer.toLowerCase()}`;
        console.log(`Registering DID for deployer: ${did}`);

        const tx = await didRegistry.createDID(did, deployer);
        await tx.wait();
        console.log('DID registered successfully');

        // Grant initial admin role
        const grantTx = await didAuth.grantInitialAdminRole();
        await grantTx.wait();
        console.log('Admin role granted to deployer');
      } else {
        console.log(`Deployer already has DID: ${deployerDid}`);

        // Try to grant initial admin role if not already granted
        try {
          const grantTx = await didAuth.grantInitialAdminRole();
          await grantTx.wait();
          console.log('Admin role granted to deployer');
        } catch (error) {
          console.log(
            'Admin role already granted or error occurred:',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
    } catch (error) {
      console.error('Error setting up initial admin role:', error);
    }
  }

  // Verify contracts if not on a local network
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log('\nVerifying contracts on Etherscan...');

    try {
      await hre.run('verify:verify', {
        address: didRegistryDeployment.address,
        constructorArguments: [],
      });
      console.log('DidRegistry verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidRegistry:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: didVerifierDeployment.address,
        constructorArguments: [didRegistryDeployment.address],
      });
      console.log('DidVerifier verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidVerifier:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: didIssuerDeployment.address,
        constructorArguments: [didRegistryDeployment.address],
      });
      console.log('DidIssuer verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidIssuer:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: didAuthDeployment.address,
        constructorArguments: [
          didRegistryDeployment.address,
          didVerifierDeployment.address,
          didIssuerDeployment.address,
          deployer,
        ],
      });
      console.log('DidAuth verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DidAuth:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: docuVaultDeployment.address,
        constructorArguments: [],
      });
      console.log('DocuVault verified on Etherscan');
    } catch (error) {
      console.log('Error verifying DocuVault:', error);
    }

    try {
      await hre.run('verify:verify', {
        address: verifierFactoryDeployment.address,
        constructorArguments: [],
      });
      console.log('VerifierFactory verified on Etherscan');
    } catch (error) {
      console.log('Error verifying VerifierFactory:', error);
    }
  }

  // Also update the deployment information for The Graph
  await updateSubgraphConfig(envVars, hre);
};

/**
 * Updates subgraph configuration with deployed contract addresses
 */
async function updateSubgraphConfig(envVars: Record<string, string>, hre: HardhatRuntimeEnvironment) {
  const subgraphConfigPath = path.resolve(__dirname, '../../../packages/subgraph/config/networks.json');
  const { ethers } = hre;

  let networks = {};
  if (fs.existsSync(subgraphConfigPath)) {
    networks = JSON.parse(fs.readFileSync(subgraphConfigPath, 'utf8'));
  }

  // Get timestamp for start blocks
  const currentBlock = await ethers.provider.getBlockNumber();
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Update network config
  networks = {
    ...networks,
    hardhat: {
      DocuVault: {
        address: envVars.DOCU_VAULT_CONTRACT_ADDRESS,
        startBlock: 1,
      },
      VerifierFactory: {
        address: envVars.VERIFIER_FACTORY_CONTRACT_ADDRESS,
        startBlock: 1,
      },
      AgeVerifier: {
        address: envVars.AGE_VERIFIER_CONTRACT_ADDRESS,
        startBlock: 1,
      },
      FhirVerifier: {
        address: envVars.FHIR_VERIFIER_CONTRACT_ADDRESS,
        startBlock: 1,
      },
      HashVerifier: {
        address: envVars.HASH_VERIFIER_CONTRACT_ADDRESS,
        startBlock: 1,
      },
      DidRegistry: {
        address: envVars.DID_REGISTRY_CONTRACT_ADDRESS,
        startBlock: 1,
      },
    },
  };

  fs.writeFileSync(subgraphConfigPath, JSON.stringify(networks, null, 2));
  console.log('\nUpdated subgraph configuration in:', subgraphConfigPath);
}

// Tags help for selective deployment and dependencies management
func.tags = ['All', 'DID', 'DocuVault', 'Verifiers'];
func.dependencies = []; // This is the first script, no dependencies

export default func;
