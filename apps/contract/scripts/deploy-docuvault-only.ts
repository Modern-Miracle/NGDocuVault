import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';

/**
 * Recovery script to deploy only DocuVault contract
 * Uses existing deployed contract addresses from failed deployment
 */
async function deployDocuVaultOnly() {
  console.clear();
  
  console.log(chalk.bold.cyan('\n🔧 DOCUVAULT RECOVERY DEPLOYMENT\n'));
  
  const headerBox = boxen(
    chalk.white(`Deploying remaining contract on ${chalk.cyan(network.name.toUpperCase())}\n`) +
    chalk.gray(`This will deploy only the DocuVault contract`),
    {
      padding: 1,
      borderStyle: 'round',
      borderColor: 'yellow'
    }
  );
  
  console.log(headerBox + '\n');

  // Load partial deployment info
  const loadSpinner = ora({
    text: 'Loading previous deployment information...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  let deploymentInfo: any;
  
  try {
    // Try to load the failed deployment first
    const failedDeployments = fs.readdirSync(path.join(__dirname, '..', 'deployments'))
      .filter(f => f.includes('sepolia') && f.includes('failed'))
      .sort((a, b) => b.localeCompare(a)); // Most recent first
    
    if (failedDeployments.length > 0) {
      const latestFailed = failedDeployments[0];
      const deploymentPath = path.join(__dirname, '..', 'deployments', latestFailed);
      deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      loadSpinner.succeed(chalk.green('✓ Loaded deployment info from: ' + latestFailed));
    } else {
      throw new Error('No failed deployment found');
    }
  } catch (error) {
    loadSpinner.fail(chalk.red('✗ Failed to load deployment info'));
    console.log(chalk.yellow('\nNo partial deployment found. Please run full deployment instead.'));
    process.exit(1);
  }

  // Display existing contracts
  console.log('\n' + chalk.bold.white('📋 Existing Contracts:\n'));
  
  const contracts = [
    { name: 'DidRegistry', icon: '📋' },
    { name: 'DidVerifier', icon: '✅' },
    { name: 'DidIssuer', icon: '🏛️' },
    { name: 'DidAuth', icon: '🔐' }
  ];
  
  contracts.forEach(contract => {
    const address = deploymentInfo.contracts[contract.name];
    if (address) {
      console.log(
        chalk.gray('  ' + contract.icon),
        chalk.white(contract.name + ':'),
        chalk.cyan(address),
        chalk.green('✓')
      );
    }
  });

  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  // Check deployer
  const [deployer] = await ethers.getSigners();
  console.log(chalk.white('Deployer:'), chalk.cyan(deployer.address));
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(chalk.white('Balance:'), chalk.yellow(ethers.formatEther(balance) + ' ETH'));

  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  // Deploy DocuVault
  const deploySpinner = ora({
    text: 'Deploying DocuVault contract...',
    spinner: 'dots12',
    color: 'cyan'
  }).start();

  try {
    // Verify DidAuth address exists
    if (!deploymentInfo.contracts.DidAuth) {
      throw new Error('DidAuth contract address not found in deployment info');
    }

    const DocuVault = await ethers.getContractFactory('DocuVault');
    
    // Deploy with DidAuth address as constructor argument
    const docuVault = await DocuVault.deploy(deploymentInfo.contracts.DidAuth);
    await docuVault.waitForDeployment();
    
    const docuVaultAddress = await docuVault.getAddress();
    const deployTx = docuVault.deploymentTransaction();
    const receipt = await deployTx?.wait();
    
    deploySpinner.succeed(chalk.green('✓ DocuVault deployed successfully'));
    
    console.log(chalk.gray('  ├─'), chalk.white('Address:'), chalk.cyan(docuVaultAddress));
    console.log(chalk.gray('  ├─'), chalk.white('Constructor arg (DidAuth):'), chalk.cyan(deploymentInfo.contracts.DidAuth));
    console.log(chalk.gray('  ├─'), chalk.white('Gas used:'), chalk.yellow(ethers.formatUnits(receipt?.gasUsed || 0, 'gwei') + ' Gwei'));
    console.log(chalk.gray('  └─'), chalk.white('Tx hash:'), chalk.gray(deployTx?.hash));

    // Wait for confirmations
    if (network.name !== 'localhost' && network.name !== 'hardhat') {
      const confirmSpinner = ora({
        text: chalk.gray(`Waiting for ${process.env.CONFIRMATION_BLOCKS || 6} confirmations...`),
        spinner: 'dots8',
        color: 'gray'
      }).start();
      
      await deployTx?.wait(parseInt(process.env.CONFIRMATION_BLOCKS || '6'));
      confirmSpinner.succeed(chalk.gray('✓ Confirmed'));
    }

    // Update deployment info
    deploymentInfo.contracts.DocuVault = docuVaultAddress;
    deploymentInfo.transactionHashes.DocuVault = deployTx?.hash || '';
    deploymentInfo.gasUsed.DocuVault = receipt?.gasUsed.toString() || '0';
    
    // Calculate new total gas
    const totalGas = Object.values(deploymentInfo.gasUsed)
      .filter((v): v is string => typeof v === 'string' && v !== 'total')
      .reduce((sum, gas) => sum + BigInt(gas), BigInt(0));
    deploymentInfo.gasUsed.total = totalGas.toString();

    // Save complete deployment
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${deploymentInfo.network}-${timestamp}-complete.json`;
    const filepath = path.join(__dirname, '..', 'deployments', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
    
    // Update latest
    const latestFilepath = path.join(__dirname, '..', 'deployments', `${deploymentInfo.network}-latest.json`);
    fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));

    console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

    // Success summary
    const summaryBox = boxen(
      chalk.bold.green('✅ Deployment Recovery Complete!\n\n') +
      chalk.white('All contracts deployed:\n\n') +
      Object.entries(deploymentInfo.contracts).map(([name, address]) => {
        const contract = contracts.find(c => c.name === name) || { icon: '🏗️' };
        return chalk.gray('  ' + contract.icon) + ' ' + chalk.white(name + ':') + ' ' + chalk.cyan(address);
      }).join('\n'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green',
        float: 'center'
      }
    );
    
    console.log(summaryBox);

    // Update .env file
    const envSpinner = ora({
      text: 'Updating environment variables...',
      spinner: 'dots12',
      color: 'cyan'
    }).start();

    try {
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      const networkPrefix = network.name.toUpperCase();
      const key = `${networkPrefix}_DOCU_VAULT_ADDRESS`;
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${docuVaultAddress}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
      
      fs.writeFileSync(envPath, envContent.trim() + '\n');
      envSpinner.succeed(chalk.green('✓ Environment variables updated'));
    } catch (error) {
      envSpinner.fail(chalk.red('✗ Failed to update .env'));
    }

    // Etherscan links
    if (network.name === 'sepolia') {
      console.log('\n' + chalk.bold.white('🔗 View on Etherscan:\n'));
      console.log(chalk.blue.underline(`https://sepolia.etherscan.io/address/${docuVaultAddress}`));
    }

    console.log('\n' + chalk.green.bold('🎉 DocuVault deployment complete!'));
    console.log('\n' + chalk.yellow('Next steps:'));
    console.log(chalk.gray('  1. Run'), chalk.cyan('npm run deploy:verify --network sepolia'));
    console.log(chalk.gray('  2. Run'), chalk.cyan('npm run setup:roles'));
    console.log(chalk.gray('  3. Update API and frontend configurations'));

  } catch (error) {
    deploySpinner.fail(chalk.red('✗ DocuVault deployment failed'));
    console.error(chalk.red('\nError:'), error);
    process.exit(1);
  }
}

// Execute deployment
deployDocuVaultOnly()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red.bold('\n💥 Unexpected error:'), error);
    process.exit(1);
  });