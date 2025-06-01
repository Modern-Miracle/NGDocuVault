// Export all event helpers with explicit re-exports to resolve naming conflicts

// DID Registry events
export {
  type DIDRegisteredEvent,
  type DIDUpdatedEvent,
  type DIDDeactivatedEvent,
  parseDIDRegisteredEvent,
  parseDIDUpdatedEvent,
  parseDIDDeactivatedEvent,
  parseDIDRegistryEvents,
  buildDIDRegisteredFilter,
  buildDIDEventFilter,
  sortEventsByBlock,
  filterEventsByDID as filterRegistryEventsByDID,
  getLatestEvent,
} from './did-registry-events';

// DID Auth events
export {
  type RoleGrantedEvent,
  type RoleRevokedEvent,
  type AuthenticationSuccessfulEvent,
  type AuthenticationFailedEvent,
  type CredentialVerifiedEvent,
  type CredentialVerificationFailedEvent,
  ROLES,
  ROLE_NAMES,
  parseRoleGrantedEvent,
  parseRoleRevokedEvent,
  parseAuthenticationSuccessfulEvent,
  parseAuthenticationFailedEvent,
  parseCredentialVerifiedEvent,
  parseCredentialVerificationFailedEvent,
  parseDidAuthEvents,
  getRoleName,
  filterEventsByDID as filterAuthEventsByDID,
  filterEventsByRole,
  getCurrentRoles,
  getAuthenticationHistory,
} from './did-auth-events';

// DocuVault events - no conflicts
export * from './docu-vault-events';
