import { ethers, network } from 'hardhat';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

/**
 * Comprehensive pre-deployment checklist for Docu smart contracts
 *
 * Performs all necessary checks before deployment to ensure:
 * - Environment is properly configured
 * - Required API keys are present
 * - Deployer has sufficient balance
 * - Contracts compile successfully
 * - Network configuration is correct
 */
async function runPreDeploymentChecklist(): Promise<boolean> {
  console.log('🔍 DOCU SMART CONTRACT PRE-DEPLOYMENT CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`📍 Target Network: ${network.name.toUpperCase()}`);
  console.log(`🌐 Chain ID: ${network.config.chainId}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const checks: CheckResult[] = [];
  let allChecksPassed = true;

  // 1. Network Configuration Check
  console.log('1️⃣  NETWORK CONFIGURATION');
  console.log('─────────────────────────');

  const networkCheck = checkNetworkConfiguration();
  checks.push(networkCheck);
  console.log(`${getStatusIcon(networkCheck.status)} ${networkCheck.message}`);
  if (networkCheck.details) console.log(`   ${networkCheck.details}`);

  if (networkCheck.status === 'fail') allChecksPassed = false;

  // 2. Environment Variables Check
  console.log('\n2️⃣  ENVIRONMENT VARIABLES');
  console.log('─────────────────────────');

  const envChecks = checkEnvironmentVariables();
  envChecks.forEach((check) => {
    checks.push(check);
    console.log(`${getStatusIcon(check.status)} ${check.message}`);
    if (check.details) console.log(`   ${check.details}`);
    if (check.status === 'fail') allChecksPassed = false;
  });

  // 3. Deployer Account Check
  console.log('\n3️⃣  DEPLOYER ACCOUNT');
  console.log('───────────────────');

  const accountChecks = await checkDeployerAccount();
  accountChecks.forEach((check) => {
    checks.push(check);
    console.log(`${getStatusIcon(check.status)} ${check.message}`);
    if (check.details) console.log(`   ${check.details}`);
    if (check.status === 'fail') allChecksPassed = false;
  });

  // 4. Contract Compilation Check
  console.log('\n4️⃣  CONTRACT COMPILATION');
  console.log('─────────────────────────');

  const compilationChecks = await checkContractCompilation();
  compilationChecks.forEach((check) => {
    checks.push(check);
    console.log(`${getStatusIcon(check.status)} ${check.message}`);
    if (check.details) console.log(`   ${check.details}`);
    if (check.status === 'fail') allChecksPassed = false;
  });

  // 5. Gas Price Check
  console.log('\n5️⃣  GAS PRICE ANALYSIS');
  console.log('────────────────────');

  const gasPriceCheck = await checkGasPrice();
  checks.push(gasPriceCheck);
  console.log(`${getStatusIcon(gasPriceCheck.status)} ${gasPriceCheck.message}`);
  if (gasPriceCheck.details) console.log(`   ${gasPriceCheck.details}`);

  if (gasPriceCheck.status === 'fail') allChecksPassed = false;

  // 6. Security Check
  console.log('\n6️⃣  SECURITY VERIFICATION');
  console.log('─────────────────────────');

  const securityChecks = checkSecuritySettings();
  securityChecks.forEach((check) => {
    checks.push(check);
    console.log(`${getStatusIcon(check.status)} ${check.message}`);
    if (check.details) console.log(`   ${check.details}`);
    if (check.status === 'fail') allChecksPassed = false;
  });

  // 7. Dependency Check
  console.log('\n7️⃣  DEPENDENCY VERIFICATION');
  console.log('───────────────────────────');

  const dependencyChecks = await checkDependencies();
  dependencyChecks.forEach((check) => {
    checks.push(check);
    console.log(`${getStatusIcon(check.status)} ${check.message}`);
    if (check.details) console.log(`   ${check.details}`);
    if (check.status === 'fail') allChecksPassed = false;
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📊 CHECKLIST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  const passedChecks = checks.filter((c) => c.status === 'pass').length;
  const failedChecks = checks.filter((c) => c.status === 'fail').length;
  const warningChecks = checks.filter((c) => c.status === 'warning').length;

  console.log(`✅ Passed: ${passedChecks}`);
  console.log(`❌ Failed: ${failedChecks}`);
  console.log(`⚠️  Warnings: ${warningChecks}`);
  console.log(`📊 Total: ${checks.length}`);

  if (allChecksPassed) {
    console.log('\n🎉 ALL CHECKS PASSED! Ready for deployment.');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: npm run deploy:sepolia');
    console.log('2. Verify contracts on Etherscan');
    console.log('3. Set up initial admin roles');
    console.log('4. Update API configuration with contract addresses');
  } else {
    console.log('\n❌ SOME CHECKS FAILED! Please fix the issues before deploying.');
    console.log('\n🔧 Common Fixes:');

    if (failedChecks > 0) {
      const failedCheckNames = checks.filter((c) => c.status === 'fail').map((c) => c.name);
      console.log('Failed checks:', failedCheckNames.join(', '));
    }

    console.log('- Get Sepolia ETH: https://sepoliafaucet.com/');
    console.log('- Get Alchemy API key: https://dashboard.alchemy.com/');
    console.log('- Get Etherscan API key: https://etherscan.io/apis');
    console.log('- Check .env.example for required variables');
  }

  console.log('═══════════════════════════════════════════════════════════════\n');

  // Save checklist results
  await saveChecklistResults(checks, allChecksPassed);

  return allChecksPassed;
}

function checkNetworkConfiguration(): CheckResult {
  if (!network.name) {
    return {
      name: 'Network Name',
      status: 'fail',
      message: 'Network name not configured',
      details: 'Check hardhat.config.ts network configuration',
    };
  }

  if (!network.config.chainId) {
    return {
      name: 'Chain ID',
      status: 'fail',
      message: 'Chain ID not configured',
      details: 'Verify network configuration in hardhat.config.ts',
    };
  }

  if (network.name === 'sepolia' && network.config.chainId !== 11155111) {
    return {
      name: 'Chain ID Mismatch',
      status: 'fail',
      message: 'Chain ID mismatch for Sepolia network',
      details: 'Expected 11155111, got ' + network.config.chainId,
    };
  }

  return {
    name: 'Network Configuration',
    status: 'pass',
    message: `Network "${network.name}" configured correctly`,
    details: `Chain ID: ${network.config.chainId}`,
  };
}

function checkEnvironmentVariables(): CheckResult[] {
  const checks: CheckResult[] = [];

  const requiredVars = [
    { name: 'TESTNET_PRIVATE_KEY', description: 'Deployer private key' },
    { name: 'SEPOLIA_URL', description: 'Sepolia RPC URL' },
    { name: 'ETHERSCAN_API_KEY', description: 'Etherscan API key for verification' },
  ];

  const optionalVars = [
    { name: 'ALCHEMY_API_KEY', description: 'Alchemy API key' },
    { name: 'INFURA_API_KEY', description: 'Infura API key (backup)' },
    { name: 'COINMARKETCAP_API_KEY', description: 'CoinMarketCap API for gas reporting' },
  ];

  // Check required variables
  requiredVars.forEach((varInfo) => {
    const value = process.env[varInfo.name];
    if (!value || value.trim() === '' || value === 'your_' + varInfo.name.toLowerCase() + '_here') {
      checks.push({
        name: varInfo.name,
        status: 'fail',
        message: `${varInfo.description} is missing or not configured`,
        details: `Set ${varInfo.name} in .env file`,
      });
    } else {
      const maskedValue = varInfo.name.includes('PRIVATE_KEY')
        ? '0x****...****'
        : value.length > 20
          ? value.substring(0, 20) + '...'
          : value;

      checks.push({
        name: varInfo.name,
        status: 'pass',
        message: `${varInfo.description} is configured`,
        details: `Value: ${maskedValue}`,
      });
    }
  });

  // Check optional variables
  optionalVars.forEach((varInfo) => {
    const value = process.env[varInfo.name];
    if (!value || value.trim() === '' || value === 'your_' + varInfo.name.toLowerCase() + '_here') {
      checks.push({
        name: varInfo.name,
        status: 'warning',
        message: `${varInfo.description} is not configured (optional)`,
        details: `Consider setting ${varInfo.name} for better functionality`,
      });
    } else {
      checks.push({
        name: varInfo.name,
        status: 'pass',
        message: `${varInfo.description} is configured`,
        details: 'Optional but recommended',
      });
    }
  });

  return checks;
}

async function checkDeployerAccount(): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];

  try {
    const [deployer] = await ethers.getSigners();

    checks.push({
      name: 'Deployer Account',
      status: 'pass',
      message: 'Deployer account loaded successfully',
      details: `Address: ${deployer.address}`,
    });

    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInEth = parseFloat(ethers.formatEther(balance));

    if (balanceInEth === 0) {
      checks.push({
        name: 'Account Balance',
        status: 'fail',
        message: 'Deployer account has zero balance',
        details: 'Need ETH for gas fees. Get from faucet: https://sepoliafaucet.com/',
      });
    } else if (balanceInEth < 0.1) {
      checks.push({
        name: 'Account Balance',
        status: 'warning',
        message: `Low balance: ${balanceInEth.toFixed(4)} ETH`,
        details: 'Consider getting more ETH. Deployment may require 0.1-0.5 ETH',
      });
    } else {
      checks.push({
        name: 'Account Balance',
        status: 'pass',
        message: `Sufficient balance: ${balanceInEth.toFixed(4)} ETH`,
        details: 'Ready for deployment',
      });
    }
  } catch (error) {
    checks.push({
      name: 'Deployer Account',
      status: 'fail',
      message: 'Failed to load deployer account',
      details: `Error: ${error}`,
    });
  }

  return checks;
}

async function checkContractCompilation(): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];

  const contractNames = ['DidRegistry', 'DidAuth', 'DidIssuer', 'DidVerifier', 'DocuVault'];

  for (const contractName of contractNames) {
    try {
      const factory = await ethers.getContractFactory(contractName);

      checks.push({
        name: `${contractName} Compilation`,
        status: 'pass',
        message: `${contractName} compiled successfully`,
        details: 'Contract ready for deployment',
      });

      // Check contract size (warn if over 24KB)
      const bytecode = factory.bytecode;
      const sizeInBytes = Math.floor((bytecode.length - 2) / 2); // Remove 0x prefix and convert hex to bytes
      const sizeInKB = sizeInBytes / 1024;

      if (sizeInKB > 24) {
        checks.push({
          name: `${contractName} Size`,
          status: 'warning',
          message: `${contractName} is large: ${sizeInKB.toFixed(2)} KB`,
          details: 'Consider optimization if deploying to mainnet',
        });
      } else {
        checks.push({
          name: `${contractName} Size`,
          status: 'pass',
          message: `${contractName} size OK: ${sizeInKB.toFixed(2)} KB`,
          details: 'Within 24KB limit',
        });
      }
    } catch (error) {
      checks.push({
        name: `${contractName} Compilation`,
        status: 'fail',
        message: `${contractName} compilation failed`,
        details: `Error: ${error}`,
      });
    }
  }

  return checks;
}

async function checkGasPrice(): Promise<CheckResult> {
  try {
    const feeData = await ethers.provider.getFeeData();

    if (!feeData.gasPrice) {
      return {
        name: 'Gas Price',
        status: 'warning',
        message: 'Could not fetch current gas price',
        details: 'Using default gas price from configuration',
      };
    }

    const gasPriceGwei = parseFloat(ethers.formatUnits(feeData.gasPrice, 'gwei'));

    if (gasPriceGwei > 100) {
      return {
        name: 'Gas Price',
        status: 'warning',
        message: `High gas price: ${gasPriceGwei.toFixed(2)} Gwei`,
        details: 'Consider waiting for lower gas prices',
      };
    } else if (gasPriceGwei > 50) {
      return {
        name: 'Gas Price',
        status: 'warning',
        message: `Moderate gas price: ${gasPriceGwei.toFixed(2)} Gwei`,
        details: 'Acceptable for testnet deployment',
      };
    } else {
      return {
        name: 'Gas Price',
        status: 'pass',
        message: `Good gas price: ${gasPriceGwei.toFixed(2)} Gwei`,
        details: 'Optimal for deployment',
      };
    }
  } catch (error) {
    return {
      name: 'Gas Price',
      status: 'fail',
      message: 'Failed to check gas price',
      details: `Error: ${error}`,
    };
  }
}

function checkSecuritySettings(): CheckResult[] {
  const checks: CheckResult[] = [];

  // Check if private key is properly set
  const privateKey = process.env.TESTNET_PRIVATE_KEY;
  if (privateKey && privateKey.startsWith('0x') && privateKey.length === 66) {
    checks.push({
      name: 'Private Key Format',
      status: 'pass',
      message: 'Private key format is correct',
      details: 'Hexadecimal format with 0x prefix',
    });
  } else {
    checks.push({
      name: 'Private Key Format',
      status: 'fail',
      message: 'Private key format is incorrect',
      details: 'Should be 64 hex characters with 0x prefix',
    });
  }

  // Check if .env file exists and is in .gitignore
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    checks.push({
      name: '.env File',
      status: 'pass',
      message: '.env file exists',
      details: 'Environment variables loaded',
    });
  } else {
    checks.push({
      name: '.env File',
      status: 'fail',
      message: '.env file not found',
      details: 'Copy .env.example to .env and configure',
    });
  }

  // Warn about mainnet deployment
  if (network.name === 'mainnet') {
    checks.push({
      name: 'Mainnet Warning',
      status: 'warning',
      message: 'Deploying to MAINNET',
      details: 'Double-check all settings. Use hardware wallet for production!',
    });
  }

  return checks;
}

async function checkDependencies(): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];

  try {
    // Check if artifacts directory exists (contracts compiled)
    const artifactsPath = path.join(__dirname, '..', 'artifacts');
    if (fs.existsSync(artifactsPath)) {
      checks.push({
        name: 'Artifacts',
        status: 'pass',
        message: 'Contract artifacts found',
        details: 'Contracts have been compiled',
      });
    } else {
      checks.push({
        name: 'Artifacts',
        status: 'fail',
        message: 'Contract artifacts not found',
        details: 'Run "npm run build" to compile contracts',
      });
    }

    // Check network connectivity
    const blockNumber = await ethers.provider.getBlockNumber();
    checks.push({
      name: 'Network Connectivity',
      status: 'pass',
      message: 'Connected to network',
      details: `Current block: ${blockNumber}`,
    });
  } catch (error) {
    checks.push({
      name: 'Network Connectivity',
      status: 'fail',
      message: 'Failed to connect to network',
      details: `Error: ${error}`,
    });
  }

  return checks;
}

function getStatusIcon(status: 'pass' | 'fail' | 'warning'): string {
  switch (status) {
    case 'pass':
      return '✅';
    case 'fail':
      return '❌';
    case 'warning':
      return '⚠️';
    default:
      return '❓';
  }
}

async function saveChecklistResults(checks: CheckResult[], allPassed: boolean) {
  const timestamp = new Date().toISOString();
  const results = {
    timestamp,
    network: network.name,
    chainId: network.config.chainId,
    allPassed,
    summary: {
      total: checks.length,
      passed: checks.filter((c) => c.status === 'pass').length,
      failed: checks.filter((c) => c.status === 'fail').length,
      warnings: checks.filter((c) => c.status === 'warning').length,
    },
    checks,
  };

  const checklistDir = path.join(__dirname, '..', 'checklist-results');
  if (!fs.existsSync(checklistDir)) {
    fs.mkdirSync(checklistDir, { recursive: true });
  }

  const filename = `checklist-${network.name}-${timestamp.replace(/[:.]/g, '-')}.json`;
  const filepath = path.join(checklistDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
}

// Run if called directly
if (require.main === module) {
  runPreDeploymentChecklist()
    .then((passed) => process.exit(passed ? 0 : 1))
    .catch((error) => {
      console.error('❌ Checklist failed:', error);
      process.exit(1);
    });
}

export { runPreDeploymentChecklist };
