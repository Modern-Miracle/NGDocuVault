import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';

interface DeploymentInfo {
  network: string;
  contracts: {
    DidRegistry: string;
    DidAuth: string;
    DidIssuer: string;
    DidVerifier: string;
    DocuVault: string;
  };
}

/**
 * Verify deployment by checking:
 * 1. Contract code exists at addresses
 * 2. Contracts are initialized properly
 * 3. Dependencies are correctly set
 * 4. Basic functionality works
 */
async function verifyDeployment() {
  console.clear();
  
  console.log(chalk.bold.cyan('\n🔍 DOCU DEPLOYMENT VERIFICATION\n'));
  
  const headerBox = boxen(
    chalk.white(`Verifying deployment on ${chalk.cyan(network.name.toUpperCase())}\n`) +
    chalk.gray(`Chain ID: ${network.config.chainId}`),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  );
  
  console.log(headerBox + '\n');

  // Load deployment info
  const loadSpinner = ora({
    text: 'Loading deployment information...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  let deploymentInfo: DeploymentInfo;
  
  try {
    const deploymentPath = path.join(__dirname, '..', 'deployments', `${network.name}-latest.json`);
    
    if (!fs.existsSync(deploymentPath)) {
      loadSpinner.fail(chalk.red('✗ No deployment found for ' + network.name));
      console.log(chalk.yellow('\nPlease run deployment first: npm run deploy:' + network.name));
      process.exit(1);
    }
    
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    loadSpinner.succeed(chalk.green('✓ Deployment info loaded'));
  } catch (error) {
    loadSpinner.fail(chalk.red('✗ Failed to load deployment info'));
    throw error;
  }

  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  const verificationResults: { name: string; status: boolean; message: string }[] = [];

  // 1. Verify contract bytecode exists
  console.log(chalk.bold.white('📋 Verifying Contract Deployment\n'));
  
  for (const [name, address] of Object.entries(deploymentInfo.contracts)) {
    const codeSpinner = ora({
      text: `Checking ${name} bytecode...`,
      spinner: 'dots12',
      color: 'cyan'
    }).start();

    try {
      const code = await ethers.provider.getCode(address);
      
      if (code === '0x') {
        codeSpinner.fail(chalk.red(`✗ ${name} has no bytecode at ${address}`));
        verificationResults.push({ name, status: false, message: 'No bytecode found' });
      } else {
        codeSpinner.succeed(chalk.green(`✓ ${name} deployed at ${address}`));
        verificationResults.push({ name, status: true, message: 'Bytecode verified' });
      }
    } catch (error) {
      codeSpinner.fail(chalk.red(`✗ Failed to check ${name}`));
      verificationResults.push({ name, status: false, message: `Error: ${error}` });
    }
  }

  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  // 2. Verify contract interactions
  console.log(chalk.bold.white('🔗 Verifying Contract Interactions\n'));

  // Check DidRegistry
  const registrySpinner = ora({
    text: 'Testing DidRegistry functionality...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  try {
    const didRegistry = await ethers.getContractAt('DidRegistry', deploymentInfo.contracts.DidRegistry);
    const [signer] = await ethers.getSigners();
    
    // Try to check if a DID exists (should not revert)
    const testDid = `did:docu:${signer.address.toLowerCase()}`;
    const exists = await didRegistry.didExists(testDid);
    
    registrySpinner.succeed(chalk.green('✓ DidRegistry is responsive'));
    console.log(chalk.gray('  └─'), chalk.white('Test DID check:'), exists ? 'exists' : 'not registered');
  } catch (error) {
    registrySpinner.fail(chalk.red('✗ DidRegistry interaction failed'));
    console.log(chalk.gray('  └─'), chalk.red(`Error: ${error}`));
  }

  // Check DocuVault
  const vaultSpinner = ora({
    text: 'Testing DocuVault functionality...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  try {
    const docuVault = await ethers.getContractAt('DocuVault', deploymentInfo.contracts.DocuVault);
    
    // Check if contract is paused
    const isPaused = await docuVault.paused();
    
    vaultSpinner.succeed(chalk.green('✓ DocuVault is responsive'));
    console.log(chalk.gray('  └─'), chalk.white('Contract status:'), isPaused ? 'paused' : 'active');
  } catch (error) {
    vaultSpinner.fail(chalk.red('✗ DocuVault interaction failed'));
    console.log(chalk.gray('  └─'), chalk.red(`Error: ${error}`));
  }

  // Check DidAuth dependencies
  const authSpinner = ora({
    text: 'Verifying DidAuth dependencies...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  try {
    const didAuth = await ethers.getContractAt('DidAuth', deploymentInfo.contracts.DidAuth);
    
    // Get dependency addresses
    const registryAddr = await didAuth.didRegistry();
    const verifierAddr = await didAuth.didVerifier();
    const issuerAddr = await didAuth.didIssuer();
    
    const depsCorrect = 
      registryAddr.toLowerCase() === deploymentInfo.contracts.DidRegistry.toLowerCase() &&
      verifierAddr.toLowerCase() === deploymentInfo.contracts.DidVerifier.toLowerCase() &&
      issuerAddr.toLowerCase() === deploymentInfo.contracts.DidIssuer.toLowerCase();
    
    if (depsCorrect) {
      authSpinner.succeed(chalk.green('✓ DidAuth dependencies correctly set'));
    } else {
      authSpinner.fail(chalk.red('✗ DidAuth dependencies mismatch'));
    }
  } catch (error) {
    authSpinner.fail(chalk.red('✗ DidAuth verification failed'));
    console.log(chalk.gray('  └─'), chalk.red(`Error: ${error}`));
  }

  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  // 3. Check roles (if applicable)
  console.log(chalk.bold.white('👥 Verifying Role Configuration\n'));

  const roleSpinner = ora({
    text: 'Checking admin roles...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  try {
    const docuVault = await ethers.getContractAt('DocuVault', deploymentInfo.contracts.DocuVault);
    const [signer] = await ethers.getSigners();
    
    const DEFAULT_ADMIN_ROLE = await docuVault.DEFAULT_ADMIN_ROLE();
    const hasAdminRole = await docuVault.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
    
    if (hasAdminRole) {
      roleSpinner.succeed(chalk.green('✓ Deployer has admin role'));
    } else {
      roleSpinner.warn(chalk.yellow('⚠ Deployer does not have admin role'));
      console.log(chalk.gray('  └─'), chalk.yellow('Run: npm run setup:roles'));
    }
  } catch (error) {
    roleSpinner.fail(chalk.red('✗ Role check failed'));
  }

  // Summary
  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  const successCount = verificationResults.filter(r => r.status).length;
  const totalCount = verificationResults.length;
  const allPassed = successCount === totalCount;

  const summaryBox = boxen(
    chalk.bold.white('📊 Verification Summary\n\n') +
    chalk.white('Total Contracts: ') + chalk.cyan(totalCount + '\n') +
    chalk.white('Verified: ') + chalk.green(successCount + '\n') +
    chalk.white('Failed: ') + chalk.red((totalCount - successCount) + '\n\n') +
    (allPassed ? 
      chalk.green.bold('✅ All verifications passed!') : 
      chalk.yellow.bold('⚠️  Some verifications failed')),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: allPassed ? 'green' : 'yellow',
      float: 'center'
    }
  );

  console.log(summaryBox);

  if (!allPassed) {
    console.log('\n' + chalk.yellow('⚠️  Please check the failed verifications above'));
    process.exit(1);
  }

  // Show contract addresses for reference
  console.log('\n' + chalk.bold.white('📋 Deployed Contracts:\n'));
  
  Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
    console.log(chalk.gray('  •'), chalk.white(name + ':'), chalk.cyan(address));
  });

  if (network.name === 'sepolia') {
    console.log('\n' + chalk.bold.white('🔗 Etherscan Links:\n'));
    Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
      console.log(chalk.gray('  •'), chalk.blue.underline(`https://sepolia.etherscan.io/address/${address}`));
    });
  }

  console.log('\n' + chalk.green.bold('✅ Deployment verification complete!\n'));
}

// Execute verification
verifyDeployment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red.bold('\n❌ Verification failed:'), error);
    process.exit(1);
  });