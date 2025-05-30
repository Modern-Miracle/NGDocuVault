import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-verify';
import 'hardhat-gas-reporter';
import 'hardhat-contract-sizer';
import 'dotenv/config';
import 'hardhat-deploy';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable IR-based optimizer for better gas efficiency
      evmVersion: 'paris', // Use Paris EVM version for better compatibility
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 5000,
      },
      accounts: {
        count: 20,
        accountsBalance: '10000000000000000000000', // 10000 ETH
      },
    },
    localhost: {
      url: process.env.LOCAL_RPC_URL || 'http://127.0.0.1:8545',
      chainId: 31337,
      timeout: 60000,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || '',
      accounts: process.env.TESTNET_PRIVATE_KEY ? [process.env.TESTNET_PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: parseInt(process.env.GAS_PRICE_GWEI || '30') * 1000000000,
      gas: parseInt(process.env.GAS_LIMIT || '5000000'),
      timeout: 120000,
      // @ts-ignore
      confirmations: parseInt(process.env.CONFIRMATION_BLOCKS || '6'),
    },
    mainnet: {
      url: process.env.MAINNET_URL || '',
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      chainId: 1,
      gasPrice: 'auto',
      gas: 'auto',
      timeout: 120000,
    },
    // Additional networks for future deployment
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.TESTNET_PRIVATE_KEY ? [process.env.TESTNET_PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 'auto',
    },
    arbitrum: {
      url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.TESTNET_PRIVATE_KEY ? [process.env.TESTNET_PRIVATE_KEY] : [],
      chainId: 42161,
      gasPrice: 'auto',
    },
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: process.env.TESTNET_PRIVATE_KEY ? [process.env.TESTNET_PRIVATE_KEY] : [],
      chainId: 10,
      gasPrice: 'auto',
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // First account by default
      1: process.env.DEPLOYER_ADDRESS || 0, // mainnet
      11155111: process.env.DEPLOYER_ADDRESS || 0, // sepolia
      31337: 0, // localhost and hardhat
    },
    owner: {
      default: 1,
      1: process.env.INITIAL_OWNER || 0, // mainnet
      11155111: process.env.INITIAL_OWNER || 0, // sepolia
    },
    admin: {
      default: 2,
      1: process.env.ADMIN_ADDRESS_1 || 0,
      11155111: process.env.ADMIN_ADDRESS_1 || 0,
    },
  },
  paths: {
    sources: './src',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    deploy: './deploy',
    deployments: './deployments',
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      polygon: process.env.POLYGONSCAN_API_KEY || '',
      arbitrumOne: process.env.ARBISCAN_API_KEY || '',
      optimisticEthereum: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || '',
    },
    customChains: [
      {
        network: 'sepolia',
        chainId: 11155111,
        urls: {
          apiURL: 'https://api-sepolia.etherscan.io/api',
          browserURL: 'https://sepolia.etherscan.io',
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USD',
    gasPrice: parseInt(process.env.GAS_PRICE_GWEI || '30'),
    token: 'ETH',
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: './gas-report.txt',
    noColors: true,
    excludeContracts: ['MockIssuer'],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: process.env.NODE_ENV !== 'test',
    strict: true,
    only: ['DidRegistry', 'DidAuth', 'DidIssuer', 'DidVerifier', 'DocuVault'],
  },
  mocha: {
    timeout: 120000, // 2 minutes
    reporter: 'spec',
  },
  typechain: {
    outDir: 'types/contracts',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false,
    discriminateTypes: true,
  },
};

export default config;
