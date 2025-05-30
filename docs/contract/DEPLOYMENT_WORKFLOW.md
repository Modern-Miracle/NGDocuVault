# 🚀 Docu Smart Contract Deployment Workflow

## Overview

This guide provides a comprehensive workflow for deploying the Docu smart contracts to Sepolia testnet and production networks. The deployment process has been optimized with professional tooling and beautiful CLI interfaces.

## 📋 Prerequisites

### 1. Required API Keys
- **Alchemy API Key** - For reliable RPC endpoints
- **Etherscan API Key** - For contract verification
- **Private Key** - For deployment wallet (NEVER commit!)

### 2. Required ETH
- **Sepolia**: ~0.5 ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- **Mainnet**: ~0.1-0.2 ETH (depending on gas prices)

### 3. Environment Setup
```bash
# Navigate to contract directory
cd apps/contract

# Install dependencies
pnpm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration
```

## 🎯 Deployment Workflow

### Step 1: Environment Configuration

1. **Configure `.env` file**:
```env
# Network RPC URLs
ALCHEMY_API_KEY=your_alchemy_api_key_here
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}

# Deployment wallet
TESTNET_PRIVATE_KEY=0x...your_private_key_here
DEPLOYER_ADDRESS=0x...your_address_here

# Contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Deployment settings
AUTO_VERIFY=true
CONFIRMATION_BLOCKS=6
GAS_PRICE_GWEI=30
```

### Step 2: Pre-deployment Checklist

Run the comprehensive pre-deployment checklist:

```bash
npm run deploy:checklist
```

This will verify:
- ✅ Network configuration
- ✅ Environment variables
- ✅ Deployer account balance
- ✅ Contract compilation
- ✅ Gas price analysis
- ✅ Security settings
- ✅ Dependencies

Expected output:
```
🔍 DOCU SMART CONTRACT PRE-DEPLOYMENT CHECKLIST
═══════════════════════════════════════════════════════════════
📍 Target Network: SEPOLIA
🌐 Chain ID: 11155111
═══════════════════════════════════════════════════════════════

1️⃣  NETWORK CONFIGURATION
─────────────────────────
✅ Network "sepolia" configured correctly
   Chain ID: 11155111

2️⃣  ENVIRONMENT VARIABLES
─────────────────────────
✅ Deployer private key is configured
   Value: 0x****...****
✅ Sepolia RPC URL is configured
   Value: https://eth-sepolia.g...

...

🎉 ALL CHECKS PASSED! Ready for deployment.
```

### Step 3: Compile Contracts

```bash
npm run build
```

Verify contract sizes:
```bash
npm run size
```

Expected output:
```
 ·-----------------------|--------------|----------------·
 |  Contract Name        ·  Size (KB)   ·  Change (KB)   │
 ························|··············|·················
 |  DidRegistry          ·    12.45     ·                │
 |  DidAuth              ·    18.23     ·                │
 |  DidIssuer            ·    14.67     ·                │
 |  DidVerifier          ·    13.89     ·                │
 |  DocuVault            ·    22.14     ·                │
 ·-----------------------|--------------|----------------·
```

### Step 4: Test Deployment (Localhost)

1. **Start local node**:
```bash
# Terminal 1
npm run dev:contract
```

2. **Deploy to localhost**:
```bash
# Terminal 2
npm run deploy
```

3. **Verify deployment**:
```bash
npm run verify:roles
```

### Step 5: Deploy to Sepolia

Run the enhanced deployment script:

```bash
npm run deploy:sepolia
```

Expected beautiful output:
```
██████   ██████   ██████  ██    ██     ██    ██  █████  ██    ██ ██      ████████ 
██   ██ ██    ██ ██       ██    ██     ██    ██ ██   ██ ██    ██ ██         ██    
██   ██ ██    ██ ██       ██    ██     ██    ██ ███████ ██    ██ ██         ██    
██   ██ ██    ██ ██       ██    ██      ██  ██  ██   ██ ██    ██ ██         ██    
██████   ██████   ██████   ██████        ████   ██   ██  ██████  ███████    ██    


╔══════════════════════════════════════╗
║    🚀 Smart Contract Deployment      ║
║                                      ║
║    📍 Network: SEPOLIA               ║
║    🔗 Chain ID: 11155111             ║
║    📅 Date: 5/30/2025, 10:30:00 AM   ║
╚══════════════════════════════════════╝

✓ Deployer account loaded
  └─ Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f5b9E0
  └─ Balance: 0.5234 ETH

✓ Gas price fetched
  └─ Current gas price: 25.5 Gwei

────────────────────────────────────────────────────────────

📦 Contract Deployment Progress

✓ [1/5] 📋 DidRegistry deployed successfully
  ├─ Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  ├─ Gas used: 1234567 Gwei
  └─ Tx hash: 0xabc123...
    ✓ Confirmed

✓ [2/5] ✅ DidVerifier deployed successfully
  ├─ Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  ├─ Gas used: 2345678 Gwei
  └─ Tx hash: 0xdef456...
    ✓ Confirmed

...

╔══════════════════════════════════════╗
║      📊 Deployment Summary           ║
║                                      ║
║  Total Contracts: 5                  ║
║  Total Gas Used: 8765432 Gwei        ║
║  Total Cost: 0.0234 ETH              ║
║  Block Number: 4567890               ║
╚══════════════════════════════════════╝

📋 Deployed Contract Addresses

  📋 DidRegistry: 0x5FbDB2315678afecb367f032d93F642f64180aa3
  ✅ DidVerifier: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  🏛️ DidIssuer: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  🔐 DidAuth: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
  🏗️ DocuVault: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9

 ███████ ██    ██  ██████  ██████ ███████ ███████ ███████ ██ 
 ██      ██    ██ ██      ██      ██      ██      ██      ██ 
 ███████ ██    ██ ██      ██      █████   ███████ ███████ ██ 
      ██ ██    ██ ██      ██      ██           ██      ██    
 ███████  ██████   ██████  ██████ ███████ ███████ ███████ ██ 

╔══════════════════════════════════════╗
║        🎯 Next Steps                 ║
║                                      ║
║  1. npm run setup:roles - Set up     ║
║     contract roles                   ║
║  2. npm run register:admin -         ║
║     Register admin account           ║
║  3. Update API .env with contract    ║
║     addresses                        ║
║  4. Update frontend configuration    ║
║  5. Deploy subgraph (if applicable)  ║
╚══════════════════════════════════════╝

🔗 View on Etherscan:

  • DidRegistry: https://sepolia.etherscan.io/address/0x5FbDB2315678afecb367f032d93F642f64180aa3
  • DidVerifier: https://sepolia.etherscan.io/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  • DidIssuer: https://sepolia.etherscan.io/address/0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
  • DidAuth: https://sepolia.etherscan.io/address/0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
  • DocuVault: https://sepolia.etherscan.io/address/0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

### Step 6: Post-deployment Setup

1. **Set up roles**:
```bash
npm run setup:roles
```

2. **Register initial admin**:
```bash
npm run register:admin
```

3. **Register issuers and verifiers**:
```bash
npm run register:issuer
npm run register:verifier
```

4. **Verify role setup**:
```bash
npm run verify:roles
```

### Step 7: Update Other Services

1. **Update API `.env`**:
```env
# apps/api/.env
SEPOLIA_DID_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
SEPOLIA_DID_AUTH_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
SEPOLIA_DID_ISSUER_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
SEPOLIA_DID_VERIFIER_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
SEPOLIA_DOCU_VAULT_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

2. **Update frontend configuration**:
```typescript
// apps/web/src/config/contract.ts
export const CONTRACTS = {
  sepolia: {
    DidRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    DidAuth: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    DidIssuer: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    DidVerifier: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    DocuVault: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
  }
};
```

## 🔍 Monitoring & Verification

### Contract Verification on Etherscan

If automatic verification is disabled, manually verify:

```bash
npx hardhat verify --network sepolia 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Monitor Transactions

1. Check deployment status on Etherscan
2. Monitor contract interactions
3. Set up event listeners in your application

## 🛠️ Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Get Sepolia ETH from faucets
   - Check gas price settings

2. **"Nonce too low"**
   - Reset MetaMask account
   - Clear pending transactions

3. **"Contract already verified"**
   - This is fine, contract is already on Etherscan

4. **Deployment fails midway**
   - Check `deployments/sepolia-latest.json` for partial deployment
   - Resume from failed contract

### Recovery from Failed Deployment

If deployment fails partway:

1. Check saved deployment info:
```bash
cat deployments/sepolia-latest-failed.json
```

2. Update script to skip already deployed contracts
3. Resume deployment

## 📊 Gas Optimization

### Estimated Gas Costs (Sepolia)

| Contract | Estimated Gas | Cost @ 30 Gwei |
|----------|--------------|----------------|
| DidRegistry | ~1,500,000 | ~0.045 ETH |
| DidVerifier | ~1,200,000 | ~0.036 ETH |
| DidIssuer | ~1,200,000 | ~0.036 ETH |
| DidAuth | ~2,000,000 | ~0.060 ETH |
| DocuVault | ~3,000,000 | ~0.090 ETH |
| **Total** | **~8,900,000** | **~0.267 ETH** |

### Gas Saving Tips

1. Deploy during low gas periods
2. Use optimizer settings in `hardhat.config.ts`
3. Batch transactions where possible

## 🔒 Security Checklist

- [ ] Private keys are properly secured
- [ ] `.env` file is in `.gitignore`
- [ ] Contract addresses are verified
- [ ] Admin roles are properly assigned
- [ ] Access controls are configured
- [ ] Emergency pause is tested

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

## 🎉 Deployment Complete!

Once all steps are completed:

1. Contracts are live on Sepolia
2. Roles are configured
3. API and frontend are updated
4. System is ready for testing

Remember to test thoroughly on testnet before mainnet deployment!