import { keccak256, toBytes } from 'viem';

/**
 * Get the bytes32 hash of a role
 * @param role - The role to get the hash for
 * @returns The bytes32 hash of the role
 */
export const getRoleHash = (role: string): `0x${string}` => {
  // If the role is already a hash (starts with 0x), return it
  if (typeof role === 'string' && role.startsWith('0x')) {
    return role as `0x${string}`;
  }
  
  // Handle role names with or without _ROLE suffix
  const roleBase = role.replace('_ROLE', '');
  
  switch (roleBase) {
    case 'ADMIN':
      return keccak256(toBytes('ADMIN_ROLE'));
    case 'ISSUER':
      return keccak256(toBytes('ISSUER_ROLE'));
    case 'PRODUCER':
      return keccak256(toBytes('PRODUCER_ROLE'));
    case 'CONSUMER':
      return keccak256(toBytes('CONSUMER_ROLE'));
    case 'PROVIDER':
      return keccak256(toBytes('PROVIDER_ROLE'));
    case 'VERIFIER':
      return keccak256(toBytes('VERIFIER_ROLE'));
    case 'DEFAULT_ADMIN':
      return keccak256(toBytes('DEFAULT_ADMIN_ROLE'));
    case 'HOLDER':
      return keccak256(toBytes('HOLDER_ROLE'));
    case 'OPERATOR':
      return keccak256(toBytes('OPERATOR_ROLE'));
    default:
      // Otherwise hash the role string with _ROLE suffix
      return keccak256(toBytes(role.includes('_ROLE') ? role : `${role}_ROLE`));
  }
};

/**
 * Get the role name from a bytes32 hash
 * @param roleHash - The bytes32 hash of the role
 * @returns The role name or the hash if not found
 */
export const getRoleNameFromHash = (roleHash: string): string => {
  const roleMap: Record<string, string> = {
    [keccak256(toBytes('ADMIN_ROLE'))]: 'ADMIN_ROLE',
    [keccak256(toBytes('ISSUER_ROLE'))]: 'ISSUER_ROLE',
    [keccak256(toBytes('PRODUCER_ROLE'))]: 'PRODUCER_ROLE',
    [keccak256(toBytes('CONSUMER_ROLE'))]: 'CONSUMER_ROLE',
    [keccak256(toBytes('PROVIDER_ROLE'))]: 'PROVIDER_ROLE',
    [keccak256(toBytes('VERIFIER_ROLE'))]: 'VERIFIER_ROLE',
    [keccak256(toBytes('DEFAULT_ADMIN_ROLE'))]: 'DEFAULT_ADMIN_ROLE',
    [keccak256(toBytes('HOLDER_ROLE'))]: 'HOLDER_ROLE',
    [keccak256(toBytes('OPERATOR_ROLE'))]: 'OPERATOR_ROLE',
  };
  
  return roleMap[roleHash] || roleHash;
};
