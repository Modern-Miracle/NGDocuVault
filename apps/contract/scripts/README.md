# DocuVault Contract Scripts

This directory contains scripts for deploying and setting up the DocuVault smart contract system.

## Prerequisites

1. Ensure your local Hardhat node is running:
   ```bash
   npx hardhat node
   ```

2. Deploy the contracts:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

3. Set up initial admin (required after fresh deployment):
   ```bash
   npx hardhat run scripts/setup-initial-admin.ts --network localhost
   ```

## Available Scripts

### Role Registration Scripts

These scripts set up different user roles in the system using Hardhat's default accounts:

#### Setup Scripts

1. **setup-initial-admin.ts** - Sets up the initial admin after deployment (required)
   ```bash
   npx hardhat run scripts/setup-initial-admin.ts --network localhost
   ```

2. **register-admin.ts** - Registers a specified address as an additional admin
   ```bash
   # Using default signer (must be in hardhat accounts)
   npx hardhat run scripts/register-admin.ts --network localhost -- <address>
   
   # Using custom private key
   npx hardhat run scripts/register-admin.ts --network localhost -- <address> <private-key>
   ```

2. **register-issuer.ts** - Registers account[2] as an issuer
   ```bash
   npx hardhat run scripts/register-issuer.ts --network localhost
   ```

3. **register-holder.ts** - Registers account[3] as a holder
   ```bash
   npx hardhat run scripts/register-holder.ts --network localhost
   ```

4. **register-verifier.ts** - Registers account[4] as a verifier
   ```bash
   npx hardhat run scripts/register-verifier.ts --network localhost
   ```

#### All-in-One Setup

- **register-all-roles.ts** - Registers all roles at once
  ```bash
  # Using default configuration (signers[0] as admin)
  npx hardhat run scripts/register-all-roles.ts --network localhost
  
  # Using custom admin address
  npx hardhat run scripts/register-all-roles.ts --network localhost -- --admin <address>
  
  # Using custom admin with private key  
  npx hardhat run scripts/register-all-roles.ts --network localhost -- --admin <address> --admin-key <private-key>
  ```

- **setup-roles.sh** - Shell script that runs all registrations
  ```bash
  ./scripts/setup-roles.sh
  ```

## Account Mapping

When using Hardhat's local network, the default account mapping is:

| Account Index | Role      | Description                          |
|--------------|-----------|--------------------------------------|
| 0            | Deployer  | Contract owner, deploys all contracts |
| 1            | Issuer    | Can issue and verify documents       |
| 2            | Holder    | Document holder/owner                 |
| 3            | Verifier  | Can verify document authenticity      |

**Note**: The admin role can be assigned to any address using the command-line arguments.

## What Each Script Does

### For All Roles:
1. Creates a DID (Decentralized Identifier) for the account
2. Registers the DID in the DidRegistry contract
3. Grants the appropriate role via DidAuth contract

### Additional Actions:
- **Admin**: Gets both ADMIN_ROLE and DEFAULT_ADMIN_ROLE
- **Issuer**: Gets registered in DocuVault's issuer registry
- **Holder**: Self-registers in DocuVault as a document holder
- **Verifier**: Gets verification permissions

## Usage Example

Complete setup process:

```bash
# 1. Start Hardhat node
npx hardhat node

# 2. Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost

# 3. Set up initial admin (required)
npx hardhat run scripts/setup-initial-admin.ts --network localhost

# 4. Set up all other roles
npx hardhat run scripts/register-all-roles.ts --network localhost

# Or use the shell script
./scripts/setup-roles.sh
```

## Debugging

If you encounter errors, use the debug script:

```bash
npx hardhat run scripts/debug-roles.ts --network localhost
```

## Verification

Each script verifies the setup by:
1. Checking if the DID is properly registered
2. Confirming the role has been granted
3. Testing authentication with credentials
4. Verifying contract-specific registrations

## Command Line Arguments

### register-admin.ts
- First argument: Admin address (required)
- Second argument: Admin private key (optional, uses existing signer if not provided)

### register-all-roles.ts
- `--admin <address>`: Specify custom admin address (optional)
- `--admin-key <private-key>`: Specify admin private key (optional, required if admin is not in signers)

## Troubleshooting

1. **"Contract addresses not found"** - Make sure you've run the deploy script first
2. **"NotAdmin" errors** - Run register-admin.ts before register-issuer.ts
3. **"AlreadyRegistered" errors** - The account is already set up, this is not an error
4. **Transaction failures** - Ensure your local Hardhat node is running
5. **"No signer found"** - The specified address is not in Hardhat's accounts, provide the private key

## Notes

- The deployer (account[0]) automatically has admin privileges
- DIDs follow the format: `did:docuvault:{address}`
- All scripts are idempotent - they check for existing setups before proceeding
- Role hashes are computed using keccak256 of the role name (e.g., "ADMIN_ROLE")