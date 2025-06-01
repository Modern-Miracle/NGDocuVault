# Security Guidelines for Environment Variables

## 🔐 Environment Variables Classification

### ✅ **SAFE for CI/CD** (Public Configuration)
These can be safely included in GitHub Actions workflows:

- `VITE_API_BASE_URL` - Public API endpoint
- `VITE_SEPOLIA_CHAIN_ID` - Public blockchain network ID
- `VITE_SEPOLIA_*_CONTRACT_ADDRESS` - Public contract addresses (on blockchain)

### ⚠️ **SENSITIVE** (Use GitHub Secrets)
These should be stored in GitHub repository secrets:

- `VITE_SEPOLIA_RPC_URL` - Contains Alchemy API key
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Azure deployment token

### ❌ **SECRETS** (Never in CI/CD)
These should ONLY be in Azure Key Vault or App Service settings:

- `DATABASE_URL` - Contains database credentials
- `JWT_SECRET` - Authentication signing key
- `AZURE_CLIENT_SECRET` - Service principal credentials
- Private keys, passwords, connection strings

## 🛠️ **Setup Instructions**

### 1. GitHub Repository Secrets
Add these secrets to your GitHub repository:

```bash
# Go to: Repository → Settings → Secrets and variables → Actions

VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
AZURE_STATIC_WEB_APPS_API_TOKEN=your_deployment_token
```

### 2. Azure Key Vault (for API secrets)
```bash
# Database connection string
az keyvault secret set \
  --vault-name lelink-kv-we-sbx \
  --name database-connection-string \
  --value "your_connection_string"

# JWT secret
az keyvault secret set \
  --vault-name lelink-kv-we-sbx \
  --name jwt-secret \
  --value "your_jwt_secret"
```

### 3. App Service Configuration
```bash
# Reference Key Vault secrets in App Service
az webapp config appsettings set \
  --name docu-vault-api \
  --resource-group LeLinksbxWE \
  --settings \
    DATABASE_URL='@Microsoft.KeyVault(VaultName=lelink-kv-we-sbx;SecretName=database-connection-string)' \
    JWT_SECRET='@Microsoft.KeyVault(VaultName=lelink-kv-we-sbx;SecretName=jwt-secret)'
```

## 🔍 **Security Best Practices**

1. **Never commit secrets** to version control
2. **Use environment-specific secrets** (dev, staging, prod)
3. **Rotate secrets regularly**
4. **Use managed identities** for Azure services
5. **Audit secret access** regularly

## 📝 **Environment Files**

- `apps/web/.env.example` - Template for local development
- `apps/web/.env.local` - Local development (git-ignored)
- Never commit `.env` files with real secrets

## 🚨 **What to do if secrets are exposed**

1. **Immediately rotate** the exposed secrets
2. **Revoke access** to compromised keys
3. **Update** all dependent services
4. **Review** git history for other exposures