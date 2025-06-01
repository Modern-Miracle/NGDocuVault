# Deployment Documentation

Comprehensive deployment guides for all environments.

## 📑 Table of Contents

- [Overview](./overview.md)
- [Local Development](./local.md)
- [Testnet Deployment](./testnet.md)
- [Production Deployment](./production.md)
- [Infrastructure](./infrastructure.md)
- [Monitoring](./monitoring.md)
- [Troubleshooting](./troubleshooting.md)

## 🚀 Deployment Environments

### Local Development
- Hardhat local node
- Local IPFS node
- SQL Server in Docker
- Hot reload enabled

### Testnet (Sepolia)
- Public testnet deployment
- Infura/Alchemy RPC
- Web3.Storage for IPFS
- Test database instance

### Production
- Mainnet deployment
- High-availability setup
- Production database
- Monitoring and alerts

## 📋 Pre-Deployment Checklist

### Environment Variables
- [ ] `DATABASE_URL` - SQL Server connection
- [ ] `ETHEREUM_RPC_URL` - Blockchain RPC endpoint
- [ ] `PRIVATE_KEY` - Deployment wallet key
- [ ] `WEB3_STORAGE_TOKEN` - IPFS storage token
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `SESSION_SECRET` - Session encryption

### Infrastructure
- [ ] Database server provisioned
- [ ] RPC endpoint configured
- [ ] Domain and SSL certificates
- [ ] Load balancer setup
- [ ] Monitoring tools

### Security
- [ ] Environment variables secured
- [ ] Private keys in secure vault
- [ ] CORS configuration
- [ ] Rate limiting enabled
- [ ] Security headers

## 🔧 Deployment Commands

### API Deployment

```bash
# Build API
cd apps/api
pnpm build

# Start production server
pnpm start

# Or use PM2
pm2 start ecosystem.config.js
```

### Web App Deployment

```bash
# Build web app
cd apps/web
pnpm build

# Preview build
pnpm preview

# Deploy to hosting service
# (Vercel, Netlify, etc.)
```

### Contract Deployment

```bash
# Deploy to testnet
cd apps/contract
pnpm hardhat run scripts/deploy.ts --network sepolia

# Verify contracts
pnpm hardhat verify --network sepolia <CONTRACT_ADDRESS>

# Setup initial roles
pnpm hardhat run scripts/setup-initial-admin.ts --network sepolia
```

## 📊 Post-Deployment

### Verification Steps
1. Check contract deployment on Etherscan
2. Verify API endpoints are responding
3. Test authentication flow
4. Confirm IPFS integration
5. Validate role permissions

### Monitoring Setup
- Application logs
- Error tracking (Sentry)
- Performance monitoring
- Blockchain event monitoring
- Database health checks

## 🔄 Continuous Deployment

### GitHub Actions Workflow
- Automated testing on PR
- Build verification
- Deployment on merge to main
- Environment-specific deployments

### Rollback Procedures
1. Database backup before deployment
2. Contract upgrade patterns
3. API versioning strategy
4. Frontend rollback process

See individual deployment guides for detailed instructions.