#!/bin/bash

# Azure App Service Deployment Script - API Only (Basic B1 Tier)
set -e

# Configuration
RESOURCE_GROUP="LeLinksbxWE"
LOCATION="West Europe"
ACR_NAME="docuvaultacr"
APP_SERVICE_PLAN="docu-vault-plan"
API_APP_NAME="docu-vault-api"
API_IMAGE_NAME="docu-vault-api"
IMAGE_TAG="latest"

echo "🚀 Starting Azure App Service deployment - API ONLY (Basic B1 tier)..."
echo "💰 Cost: ~$13.14/month (1x Basic B1 App Service)"

# Login to Azure (if not already logged in)
echo "📝 Checking Azure login..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure first:"
    az login
fi

# Check if resource group exists
echo "📦 Checking resource group..."
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo "✅ Resource group $RESOURCE_GROUP already exists"
    # Get the actual location of existing resource group
    ACTUAL_LOCATION=$(az group show --name $RESOURCE_GROUP --query location --output tsv)
    echo "📍 Using existing location: $ACTUAL_LOCATION"
    LOCATION=$ACTUAL_LOCATION
else
    echo "📦 Creating resource group..."
    az group create --name $RESOURCE_GROUP --location "$LOCATION" --output table
fi

# Create Azure Container Registry if it doesn't exist
echo "🏗️  Creating Azure Container Registry..."
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --admin-enabled true \
    --output table || echo "ACR already exists"

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer --output tsv)

# Build and push API Docker image
echo "🐳 Building and pushing API Docker image..."
az acr build \
    --registry $ACR_NAME \
    --image $API_IMAGE_NAME:$IMAGE_TAG \
    --file Dockerfile.api \
    .

# Create App Service Plan (Basic B1 tier) if it doesn't exist
echo "📋 Creating App Service Plan (Basic B1)..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --location "$LOCATION" \
    --sku B1 \
    --is-linux \
    --output table || echo "App Service Plan already exists"

# Create API App Service
echo "🔧 Creating API App Service..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $API_APP_NAME \
    --deployment-container-image-name $ACR_LOGIN_SERVER/$API_IMAGE_NAME:$IMAGE_TAG \
    --output table || echo "API App Service already exists"

# Configure container registry for API
echo "🔐 Configuring container registry for API..."
az webapp config container set \
    --name $API_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --docker-custom-image-name $ACR_LOGIN_SERVER/$API_IMAGE_NAME:$IMAGE_TAG \
    --docker-registry-server-url https://$ACR_LOGIN_SERVER \
    --docker-registry-server-user $ACR_NAME \
    --docker-registry-server-password $(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)

# Configure API environment variables
echo "⚙️  Configuring API environment variables..."
az webapp config appsettings set \
    --name $API_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        PORT=3000 \
        NETWORK=sepolia \
        SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/s82VpBxn0XJii1BoSX4M8vdtvzw9bDGf \
        SEPOLIA_CHAIN_ID=11155111 \
        SEPOLIA_DOCU_VAULT_CONTRACT_ADDRESS=0x8abaE3CEA79090BF9EfD096B0975241F1619FAb8 \
        SEPOLIA_DID_AUTH_CONTRACT_ADDRESS=0x892f57d997c5e9f5C5317704c996f7308833f95c \
        SEPOLIA_DID_REGISTRY_CONTRACT_ADDRESS=0x3922d5521B7376efc1CADD2761cC4dFBA45DF446 \
        SEPOLIA_DID_ISSUER_CONTRACT_ADDRESS=0xBD9be795602cF5719de20D5cbc2036fB80e94821 \
        SEPOLIA_DID_VERIFIER_CONTRACT_ADDRESS=0x309076d0d9E5206574Ab84c5805D535758D67570 \
        AZURE_KEY_VAULT_URL=https://lelink-kv-we-sbx.vault.azure.net/ \
        ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173 \
    --output table

# Get API URL
API_URL=$(az webapp show --name $API_APP_NAME --resource-group $RESOURCE_GROUP --query defaultHostName --output tsv)

# Enable container logging
echo "📝 Enabling container logging..."
az webapp log config \
    --name $API_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --docker-container-logging filesystem

# Configure managed identity for Key Vault access
echo "🔑 Configuring managed identity for Key Vault access..."
az webapp identity assign \
    --name $API_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --output table

echo ""
echo "✅ API Deployment completed successfully!"
echo ""
echo "🌐 API URL: https://$API_URL"
echo "💰 Cost estimate: ~$13.14/month (Basic B1 App Service)"
echo ""
echo "🔍 Testing API health check..."
sleep 30  # Wait for deployment to complete
curl -f https://$API_URL/health || echo "❌ Health check failed - API might still be starting up"

echo ""
echo "📋 Next steps:"
echo "1. Add Key Vault environment variables:"
echo "   az webapp config appsettings set --name $API_APP_NAME --resource-group $RESOURCE_GROUP \\"
echo "     --settings DATABASE_URL='@Microsoft.KeyVault(VaultName=lelink-kv-we-sbx;SecretName=database-connection-string)' \\"
echo "                JWT_SECRET='@Microsoft.KeyVault(VaultName=lelink-kv-we-sbx;SecretName=jwt-secret)'"
echo ""
echo "2. Test the API:"
echo "   curl https://$API_URL/health"
echo "   curl https://$API_URL/api/v1/auth/status"
echo ""
echo "3. View logs:"
echo "   az webapp log tail --name $API_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "4. When ready, deploy the web frontend using the main script with this API URL:"
echo "   API_URL=https://$API_URL"