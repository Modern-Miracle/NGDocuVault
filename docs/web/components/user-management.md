# User Management Component

The User Management component provides admin users with the ability to manage user roles and permissions.

## Overview

Location: `/apps/web/src/pages/UserManagement.tsx`

The User Management page is an admin-only interface for managing user roles within the Docu platform. It provides functionality to grant and revoke roles, view user activity, and monitor role changes.

## Recent Updates (2024)

### Authentication Changes
- **Replaced** deprecated `useDidSiwe` hook with standard `useAuth` and `useIsAdmin` hooks
- **Added** loading state while checking admin permissions
- **Improved** access control with proper permission checking

### UI/UX Improvements
- **Updated** DID format from `did:eth:` to `did:docuvault:` in placeholder text
- **Added** input validation for Ethereum addresses and DID formats
- **Enhanced** error messages for better user guidance
- **Added** required attributes to form fields
- **Implemented** "Select a role" default option

### Type Safety Enhancements
- **Updated** transaction hash types to use `Address` from viem
- **Made** timestamp optional in `RoleEventLog` interface
- **Improved** event processing with proper type handling

### Error Handling
- **Added** async error handling for clipboard operations
- **Enhanced** DID lookup error messages
- **Improved** validation feedback

## Features

### Role Management
- Grant roles to users via DID or Ethereum address
- Revoke existing roles
- Support for multiple roles: Admin, Issuer, Verifier, Holder, Operator

### User Listing
- Display all users with their assigned roles
- Show activity timestamps
- Filter by role, status, or search term
- Real-time updates from blockchain events

### Statistics Dashboard
- Total users count
- Active users tracking
- Role distribution

## Usage

### Prerequisites
- User must have admin role
- Connected wallet
- Valid Ethereum connection

### Adding a New User

```typescript
// Component handles address validation
// Accepts either Ethereum address or DID
// Format: 0x... or did:docuvault:...

// If Ethereum address provided:
// 1. Validates format
// 2. Looks up associated DID
// 3. Grants role to DID

// If DID provided:
// 1. Uses DID directly
// 2. Grants role
```

### Granting/Revoking Roles

```typescript
// Roles are automatically converted to bytes32 hashes
// UI shows human-readable names
// Blockchain stores keccak256 hashes

// Example role mapping:
// "ADMIN_ROLE" -> keccak256("ADMIN_ROLE")
// "ISSUER_ROLE" -> keccak256("ISSUER_ROLE")
```

## Component Structure

### State Management
- Local state for filters and form inputs
- React Query for blockchain data
- Event listeners for real-time updates

### Key Hooks Used
- `useAuth()` - Get current user address
- `useIsAdmin()` - Check admin permissions
- `useGrantDidRole()` - Grant role mutations
- `useRevokeDidRole()` - Revoke role mutations
- `useRoleGrantedEvents()` - Monitor role granted events
- `useRoleRevokedEvents()` - Monitor role revoked events

### Event Processing
- Listens to DidAuth contract events
- Processes RoleGranted and RoleRevoked events
- Builds user activity history
- Updates UI in real-time

## Error Handling

### Common Error Scenarios
1. **No DID Found**: User must register through signup process first
2. **Invalid Address**: Must be valid Ethereum address format
3. **Permission Denied**: Only admins can access this page
4. **Transaction Failed**: Blockchain transaction errors

### Error Messages
- Clear, actionable error messages
- Toast notifications for user feedback
- Detailed error descriptions when available

## Code Example

```typescript
// Check admin access
const { address } = useAuth();
const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin(address);

// Show loading state
if (isAdminLoading) {
  return <LoadingSpinner />;
}

// Restrict access
if (!isAdmin) {
  return <AccessDenied />;
}

// Grant role
const handleGrantRole = async (did: string, role: string) => {
  const roleHash = getRoleHash(role);
  await grantRole({ did, role: roleHash });
};
```

## Best Practices

1. **Always validate input** before blockchain transactions
2. **Handle loading states** for better UX
3. **Show clear error messages** with recovery steps
4. **Use proper TypeScript types** for type safety
5. **Monitor events** for real-time updates

## Future Improvements

- Batch role operations
- Role history visualization
- Export user data functionality
- Advanced filtering options
- Role expiration dates