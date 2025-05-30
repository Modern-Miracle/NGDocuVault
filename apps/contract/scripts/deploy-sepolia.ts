import { ethers, run, network } from 'hardhat';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import gradientString from 'gradient-string';
import figlet from 'figlet';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

interface DeploymentInfo {
  network: string;
  chainId: number | undefined;
  deployer: string;
  deploymentDate: string;
  blockNumber: number;
  gasPrice: string | null;
  contracts: {
    DidRegistry: string;
    DidAuth: string;
    DidIssuer: string;
    DidVerifier: string;
    DocuVault: string;
  };
  transactionHashes: {
    DidRegistry: string;
    DidAuth: string;
    DidIssuer: string;
    DidVerifier: string;
    DocuVault: string;
  };
  gasUsed: {
    DidRegistry: string;
    DidAuth: string;
    DidIssuer: string;
    DidVerifier: string;
    DocuVault: string;
    total: string;
  };
}

// Create beautiful gradients
const docuGradient = gradientString(['#FF6B6B', '#4ECDC4', '#45B7D1']);
const successGradient = gradientString(['#00C9FF', '#92FE9D']);
const warningGradient = gradientString(['#FC466B', '#3F5EFB']);

/**
 * Professional deployment script for Docu smart contracts to Sepolia testnet
 *
 * Deploys core contracts in correct order:
 * 1. DidRegistry (foundation contract)
 * 2. DidVerifier (depends on DidRegistry)
 * 3. DidIssuer (depends on DidRegistry)
 * 4. DidAuth (depends on all above)
 * 5. DocuVault (main application contract)
 *
 * Excludes ZKP verifier contracts as requested.
 */
async function main() {
  console.clear();

  // Display beautiful banner
  const banner = figlet.textSync('DOCU VAULT', {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
  });

  console.log(docuGradient(banner));
  console.log('\n');

  // Show deployment header
  const headerBox = boxen(
    chalk.bold.white(
      `🚀 Smart Contract Deployment\n\n` +
        `📍 Network: ${chalk.cyan(network.name.toUpperCase())}\n` +
        `🔗 Chain ID: ${chalk.cyan(network.config.chainId)}\n` +
        `📅 Date: ${chalk.cyan(new Date().toLocaleString())}`
    ),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan',
      float: 'center',
    }
  );

  console.log(headerBox);

  // Step 1: Check deployer account
  const accountSpinner = ora({
    text: 'Loading deployer account...',
    spinner: 'dots12',
    color: 'cyan',
  }).start();

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);

  accountSpinner.succeed(chalk.green('✓ Deployer account loaded'));

  console.log(chalk.gray('  └─'), chalk.white('Address:'), chalk.cyan(deployer.address));
  console.log(chalk.gray('  └─'), chalk.white('Balance:'), chalk.yellow(`${balanceInEth} ETH`));

  // Check balance warning
  if (parseFloat(balanceInEth) < 0.1) {
    console.log(
      '\n' +
        boxen(
          chalk.yellow('⚠️  Low Balance Warning\n\n') +
            chalk.white('Your account balance is low. You may need more ETH.\n') +
            chalk.gray('Get Sepolia ETH from: https://sepoliafaucet.com/'),
          {
            padding: 1,
            borderStyle: 'round',
            borderColor: 'yellow',
          }
        )
    );
  }

  // Step 2: Check gas price
  const gasSpinner = ora({
    text: 'Fetching current gas prices...',
    spinner: 'dots12',
    color: 'cyan',
  }).start();

  const feeData = await ethers.provider.getFeeData();
  const gasPriceGwei = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : 'auto';

  gasSpinner.succeed(chalk.green('✓ Gas price fetched'));
  console.log(chalk.gray('  └─'), chalk.white('Current gas price:'), chalk.yellow(`${gasPriceGwei} Gwei`));

  console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');

  const deploymentInfo: DeploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    deploymentDate: new Date().toISOString(),
    blockNumber: 0,
    gasPrice: feeData.gasPrice?.toString() || null,
    contracts: {} as any,
    transactionHashes: {} as any,
    gasUsed: {} as any,
  };

  let totalGasUsed = BigInt(0);

  try {
    // Contract deployment list
    console.log(chalk.bold.white('📦 Contract Deployment Progress\n'));

    const contracts = [
      { name: 'DidRegistry', args: () => [] as any, icon: '📋' },
      { name: 'DidVerifier', args: () => [deploymentInfo.contracts.DidRegistry], icon: '✅' },
      { name: 'DidIssuer', args: () => [deploymentInfo.contracts.DidRegistry], icon: '🏛️' },
      {
        name: 'DidAuth',
        args: () => [
          deploymentInfo.contracts.DidRegistry,
          deploymentInfo.contracts.DidVerifier,
          deploymentInfo.contracts.DidIssuer,
          deployer.address,
        ],
        icon: '🔐',
      },
      { name: 'DocuVault', args: () => [deploymentInfo.contracts.DidAuth], icon: '🏗️' },
    ];

    // Deploy each contract with beautiful output
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i];
      const stepNumber = `[${i + 1}/${contracts.length}]`;

      const deploySpinner = ora({
        text: `${stepNumber} Deploying ${contract.name}...`,
        spinner: 'dots12',
        color: 'cyan',
      }).start();

      try {
        // Get contract factory
        const Factory = await ethers.getContractFactory(contract.name);

        // Get deployment arguments
        const deployArgs = typeof contract.args === 'function' ? contract.args() : contract.args;

        // Deploy contract
        const deployedContract = await Factory.deploy(...deployArgs);
        await deployedContract.waitForDeployment();

        const contractAddress = await deployedContract.getAddress();
        const deployTx = deployedContract.deploymentTransaction();
        const receipt = await deployTx?.wait();

        // Store deployment info
        deploymentInfo.contracts[contract.name as keyof typeof deploymentInfo.contracts] = contractAddress;
        deploymentInfo.transactionHashes[contract.name as keyof typeof deploymentInfo.transactionHashes] =
          deployTx?.hash || '';
        deploymentInfo.gasUsed[contract.name as keyof typeof deploymentInfo.gasUsed] =
          receipt?.gasUsed.toString() || '0';
        totalGasUsed += receipt?.gasUsed || BigInt(0);

        deploySpinner.succeed(chalk.green(`✓ ${stepNumber} ${contract.icon} ${contract.name} deployed successfully`));

        console.log(chalk.gray('  ├─'), chalk.white('Address:'), chalk.cyan(contractAddress));
        console.log(
          chalk.gray('  ├─'),
          chalk.white('Gas used:'),
          chalk.yellow(ethers.formatUnits(receipt?.gasUsed || 0, 'gwei') + ' Gwei')
        );
        console.log(chalk.gray('  └─'), chalk.white('Tx hash:'), chalk.gray(deployTx?.hash?.substring(0, 10) + '...'));

        // Wait for confirmations (except localhost)
        if (network.name !== 'localhost' && network.name !== 'hardhat') {
          const confirmSpinner = ora({
            text: chalk.gray(`    Waiting for ${process.env.CONFIRMATION_BLOCKS || 6} confirmations...`),
            spinner: 'dots8',
            color: 'gray',
          }).start();

          await deployTx?.wait(parseInt(process.env.CONFIRMATION_BLOCKS || '6'));
          confirmSpinner.succeed(chalk.gray('    ✓ Confirmed'));
        }

        console.log('');
      } catch (error) {
        deploySpinner.fail(chalk.red(`✗ ${stepNumber} Failed to deploy ${contract.name}`));
        throw error;
      }
    }

    // Calculate total gas used
    deploymentInfo.gasUsed.total = totalGasUsed.toString();
    deploymentInfo.blockNumber = await ethers.provider.getBlockNumber();

    console.log(chalk.gray('─'.repeat(60)) + '\n');

    // Display deployment summary
    const totalCostEth = feeData.gasPrice ? ethers.formatEther(totalGasUsed * feeData.gasPrice) : '0';

    const summaryBox = boxen(
      chalk.bold.white('📊 Deployment Summary\n\n') +
        chalk.white('Total Contracts: ') +
        chalk.green('5\n') +
        chalk.white('Total Gas Used: ') +
        chalk.yellow(ethers.formatUnits(totalGasUsed, 'gwei') + ' Gwei\n') +
        chalk.white('Total Cost: ') +
        chalk.yellow(totalCostEth + ' ETH\n') +
        chalk.white('Block Number: ') +
        chalk.cyan(deploymentInfo.blockNumber),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'green',
        float: 'center',
      }
    );

    console.log(summaryBox);

    // Contract addresses display
    console.log('\n' + chalk.bold.white('📋 Deployed Contract Addresses\n'));

    Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
      const icon = contracts.find((c) => c.name === name)?.icon || '📄';
      console.log(chalk.gray('  ' + icon), chalk.white(name + ':'), chalk.cyan(address));
    });

    // Verify contracts on Etherscan
    if (network.name !== 'localhost' && network.name !== 'hardhat' && process.env.AUTO_VERIFY === 'true') {
      console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');
      console.log(chalk.bold.white('🔍 Contract Verification\n'));

      await verifyContracts(deploymentInfo, contracts);
    }

    // Save deployment info
    await saveDeploymentInfo(deploymentInfo);

    // Update environment variables
    await updateEnvironmentVariables(deploymentInfo);

    // Display success message
    console.log(
      '\n' +
        successGradient(
          figlet.textSync('SUCCESS!', {
            font: 'Small',
            horizontalLayout: 'fitted',
          })
        )
    );

    // Show next steps
    const nextStepsBox = boxen(
      chalk.bold.white('🎯 Next Steps\n\n') +
        chalk.white('1. ') +
        chalk.cyan('npm run setup:roles') +
        chalk.gray(' - Set up contract roles\n') +
        chalk.white('2. ') +
        chalk.cyan('npm run register:admin') +
        chalk.gray(' - Register admin account\n') +
        chalk.white('3. ') +
        chalk.gray('Update API .env with contract addresses\n') +
        chalk.white('4. ') +
        chalk.gray('Update frontend configuration\n') +
        chalk.white('5. ') +
        chalk.gray('Deploy subgraph (if applicable)'),
      {
        padding: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
        float: 'center',
      }
    );

    console.log('\n' + nextStepsBox);

    // Etherscan links for Sepolia
    if (network.name === 'sepolia') {
      console.log('\n' + chalk.bold.white('🔗 View on Etherscan:\n'));
      Object.entries(deploymentInfo.contracts).forEach(([name, address]) => {
        console.log(
          chalk.gray('  •'),
          chalk.white(name + ':'),
          chalk.blue.underline(`https://sepolia.etherscan.io/address/${address}`)
        );
      });
    }
  } catch (error) {
    console.error('\n' + chalk.red.bold('❌ DEPLOYMENT FAILED!'));
    console.error(chalk.red(error));

    // Save partial deployment info if any contracts were deployed
    if (Object.keys(deploymentInfo.contracts).length > 0) {
      await saveDeploymentInfo(deploymentInfo, 'failed');
      console.log('\n' + chalk.yellow('💾 Partial deployment info saved for recovery'));
    }

    process.exit(1);
  }
}

/**
 * Verify deployed contracts on Etherscan with beautiful output
 */
async function verifyContracts(deploymentInfo: DeploymentInfo, contractsConfig: any[]) {
  const contracts = [
    { name: 'DidRegistry', address: deploymentInfo.contracts.DidRegistry, args: [] },
    {
      name: 'DidVerifier',
      address: deploymentInfo.contracts.DidVerifier,
      args: [deploymentInfo.contracts.DidRegistry],
    },
    { name: 'DidIssuer', address: deploymentInfo.contracts.DidIssuer, args: [deploymentInfo.contracts.DidRegistry] },
    {
      name: 'DidAuth',
      address: deploymentInfo.contracts.DidAuth,
      args: [
        deploymentInfo.contracts.DidRegistry,
        deploymentInfo.contracts.DidVerifier,
        deploymentInfo.contracts.DidIssuer,
        deploymentInfo.deployer,
      ],
    },
    { name: 'DocuVault', address: deploymentInfo.contracts.DocuVault, args: [] },
  ];

  for (const contract of contracts) {
    const verifySpinner = ora({
      text: `Verifying ${contract.name}...`,
      spinner: 'dots12',
      color: 'cyan',
    }).start();

    try {
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: contract.args,
        contract: `src/${contract.name}.sol:${contract.name}`,
      });
      verifySpinner.succeed(chalk.green(`✓ ${contract.name} verified successfully`));
    } catch (error: any) {
      if (error.message.toLowerCase().includes('already verified')) {
        verifySpinner.succeed(chalk.green(`✓ ${contract.name} already verified`));
      } else {
        verifySpinner.fail(chalk.red(`✗ ${contract.name} verification failed`));
        console.log(chalk.gray('    Error: ' + error.message));
      }
    }
  }
}

/**
 * Save deployment information with spinner
 */
async function saveDeploymentInfo(deploymentInfo: DeploymentInfo, status: string = 'success') {
  const saveSpinner = ora({
    text: 'Saving deployment information...',
    spinner: 'dots12',
    color: 'cyan',
  }).start();

  try {
    const deploymentsDir = path.join(__dirname, '..', 'deployments');

    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${deploymentInfo.network}-${timestamp}-${status}.json`;
    const filepath = path.join(deploymentsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

    const latestFilepath = path.join(deploymentsDir, `${deploymentInfo.network}-latest.json`);
    fs.writeFileSync(latestFilepath, JSON.stringify(deploymentInfo, null, 2));

    saveSpinner.succeed(chalk.green('✓ Deployment information saved'));
    console.log(chalk.gray('  └─'), chalk.white('File:'), chalk.cyan(filename));
  } catch (error) {
    saveSpinner.fail(chalk.red('✗ Failed to save deployment info'));
    throw error;
  }
}

/**
 * Update environment variables with spinner
 */
async function updateEnvironmentVariables(deploymentInfo: DeploymentInfo) {
  const envSpinner = ora({
    text: 'Updating environment variables...',
    spinner: 'dots12',
    color: 'cyan',
  }).start();

  try {
    const envPath = path.join(__dirname, '..', '.env');
    const networkPrefix = deploymentInfo.network.toUpperCase();

    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const contractVars = {
      [`${networkPrefix}_DID_REGISTRY_ADDRESS`]: deploymentInfo.contracts.DidRegistry,
      [`${networkPrefix}_DID_AUTH_ADDRESS`]: deploymentInfo.contracts.DidAuth,
      [`${networkPrefix}_DID_ISSUER_ADDRESS`]: deploymentInfo.contracts.DidIssuer,
      [`${networkPrefix}_DID_VERIFIER_ADDRESS`]: deploymentInfo.contracts.DidVerifier,
      [`${networkPrefix}_DOCU_VAULT_ADDRESS`]: deploymentInfo.contracts.DocuVault,
    };

    for (const [key, value] of Object.entries(contractVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;

      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n');
    envSpinner.succeed(chalk.green('✓ Environment variables updated'));
  } catch (error) {
    envSpinner.fail(chalk.red('✗ Failed to update environment variables'));
    throw error;
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(chalk.red.bold('\n💥 Unexpected error:'), error);
    process.exit(1);
  });
