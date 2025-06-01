/**
 * Blockchain Events Hooks
 *
 * This file re-exports all blockchain event hooks for easier importing.
 */

// DocuVault Events
export {
  useDocuEvents,
  useDocumentRegisteredEvents,
  useDocumentVerifiedEvents,
  useDocumentBatchVerifiedEvents,
  useDocumentUpdatedEvents,
  useDocumentSharedEvents,
  useShareRequestedEvents,
  useConsentGrantedEvents,
  useConsentRevokedEvents,
  useVerificationRequestedEvents,
  useUserRegisteredEvents,
  useIssuerRegisteredEvents,
  useIssuerActivatedEvents,
  useIssuerDeactivatedEvents,
} from './use-docu-events';

// DID Authentication Events
export {
  useDidAuthEvents,
  useAuthenticationSuccessfulEvents,
  useAuthenticationFailedEvents,
  useCredentialVerifiedEvents,
  useCredentialVerificationFailedEvents,
  useRoleGrantedEvents,
  useRoleRevokedEvents,
  useCurrentDIDRoles,
  useDIDAuthenticationHistory,
  useWatchRoleChanges,
  useRoleEventAnalytics,
  ROLES,
  ROLE_NAMES,
} from './use-did-auth-events';

// DID Registry Events
export {
  useDidRegistryEvents,
  useDIDRegisteredEvents,
  useDIDUpdatedEvents,
  useDIDDeactivatedEvents,
  useDIDEvents,
  useLatestDIDStatus,
  useWatchDIDEvents,
} from './use-did-registry-events';
