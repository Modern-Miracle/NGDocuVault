import { DIDRegistered, DIDUpdated, DIDDeactivated } from '../generated/DIDRegistry/DidRegistry';
import { IssuerTrustStatusUpdated } from '../generated/DIDVerifier/DidVerifier';
import { CredentialIssued } from '../generated/DIDIssuer/DidIssuer';
import {
  RoleGranted,
  RoleRevoked,
  AuthenticationSuccessful,
  AuthenticationFailed,
  CredentialVerified,
  CredentialVerificationFailed,
} from '../generated/DIDAuth/DidAuth';
import { DID, Credential, Role, TrustedIssuer, Authentication, DidHolder, Holder } from '../generated/schema';
import { BigInt, Bytes, log } from '@graphprotocol/graph-ts';

// Helper function to log errors in a standardized way
function logError(message: string, context: string): void {
  log.error('{}: {}', [context, message]);
}

// Helper function to get or create a DID entity
function getOrCreateDid(did: string): DID {
  let didEntity = DID.load(did);

  if (!didEntity) {
    didEntity = new DID(did);
    didEntity.did = did;
    didEntity.active = true;
    didEntity.lastUpdated = BigInt.fromI32(0);
    didEntity.save();
    log.info('Created new DID entity: {}', [did]);
  }

  return didEntity;
}

// Event handlers for DIDRegistry
export function handleDIDRegistered(event: DIDRegistered): void {
  let didId = event.params.did;
  let controller = event.params.controller;

  let didEntity = getOrCreateDid(didId);
  didEntity.controller = controller;
  didEntity.active = true;
  didEntity.lastUpdated = event.block.timestamp;
  didEntity.save();
  log.info('DID registered successfully: {}', [didId]);

  // Check if controller has a Holder entity and create a link
  let holderId = controller.toHexString();
  let holder = Holder.load(holderId);

  if (holder) {
    let didHolderId = didId + '-' + holderId;
    let didHolder = new DidHolder(didHolderId);
    didHolder.did = didEntity.id;
    didHolder.holder = holder.id;
    didHolder.save();
    log.info('DID Holder relationship created: {}', [didHolderId]);
  }
}

export function handleDIDUpdated(event: DIDUpdated): void {
  let didId = event.params.did;
  let timestamp = event.params.timestamp;

  let didEntity = DID.load(didId);
  if (didEntity) {
    didEntity.lastUpdated = BigInt.fromI32(timestamp.toI32());
    didEntity.save();
    log.info('DID updated successfully: {}', [didId]);
  } else {
    log.warning('Attempted to update non-existent DID: {}', [didId]);
  }
}

export function handleDIDDeactivated(event: DIDDeactivated): void {
  let didId = event.params.did;
  let timestamp = event.params.timestamp;

  let didEntity = DID.load(didId);
  if (didEntity) {
    didEntity.active = false;
    didEntity.lastUpdated = BigInt.fromI32(timestamp.toI32());
    didEntity.save();
    log.info('DID deactivated successfully: {}', [didId]);
  } else {
    log.warning('Attempted to deactivate non-existent DID: {}', [didId]);
  }
}

// Event handlers for DIDVerifier
export function handleIssuerTrustStatusUpdated(event: IssuerTrustStatusUpdated): void {
  let credentialType = event.params.credentialType;
  let issuer = event.params.issuer;
  let trusted = event.params.trusted;

  let issuerHex = issuer.toHexString();
  let trustedIssuerId = credentialType + '-' + issuerHex;

  let trustedIssuer = TrustedIssuer.load(trustedIssuerId);
  if (!trustedIssuer) {
    trustedIssuer = new TrustedIssuer(trustedIssuerId);
    trustedIssuer.credentialType = credentialType;
    trustedIssuer.issuer = issuer;
    log.info('Created new TrustedIssuer entity: {}', [trustedIssuerId]);
  }

  trustedIssuer.trusted = trusted;
  trustedIssuer.updatedAt = event.block.timestamp;
  trustedIssuer.save();
  log.info('Issuer trust status updated: {}, trusted: {}', [trustedIssuerId, trusted.toString()]);
}

// Event handlers for DIDIssuer
export function handleCredentialIssued(event: CredentialIssued): void {
  let credentialType = event.params.credentialType;
  let subject = event.params.subject;
  let credentialId = event.params.credentialId;
  let timestamp = event.params.timestamp;

  let didEntity = DID.load(subject);
  if (!didEntity) {
    // Create a placeholder DID if one doesn't exist yet
    didEntity = new DID(subject);
    didEntity.did = subject;
    didEntity.controller = Bytes.fromHexString('0x0000000000000000000000000000000000000000');
    didEntity.active = true;
    didEntity.lastUpdated = timestamp;
    didEntity.save();
    log.info('Created placeholder DID for credential subject: {}', [subject]);
  }

  let credential = new Credential(credentialId.toHexString());
  credential.credentialType = credentialType;
  credential.subject = didEntity.id;
  credential.credentialId = credentialId;
  credential.issuedAt = timestamp;
  credential.issuer = event.transaction.from;
  credential.verified = false;
  credential.save();
  log.info('New credential issued: {}, type: {}', [credentialId.toHexString(), credentialType]);
}

// Event handlers for DIDAuth
export function handleRoleGranted(event: RoleGranted): void {
  let didId = event.params.did;
  let role = event.params.role;
  let timestamp = event.params.timestamp;

  let didEntity = DID.load(didId);
  if (!didEntity) {
    // Create a placeholder DID if one doesn't exist yet
    didEntity = new DID(didId);
    didEntity.did = didId;
    didEntity.controller = Bytes.fromHexString('0x0000000000000000000000000000000000000000');
    didEntity.active = true;
    didEntity.lastUpdated = timestamp;
    didEntity.save();
    log.info('Created placeholder DID for role assignment: {}', [didId]);
  }

  let roleId = didId + '-' + role.toHexString();
  let roleEntity = Role.load(roleId);

  if (!roleEntity) {
    roleEntity = new Role(roleId);
    roleEntity.did = didEntity.id;
    roleEntity.role = role;
    log.info('Created new role: {} for DID: {}', [roleId, didId]);
  }

  roleEntity.granted = true;
  roleEntity.grantedAt = timestamp;
  roleEntity.revokedAt = null;
  roleEntity.save();
  log.info('Role granted: {} for DID: {}', [roleId, didId]);
}

export function handleRoleRevoked(event: RoleRevoked): void {
  let didId = event.params.did;
  let role = event.params.role;
  let timestamp = event.params.timestamp;

  let roleId = didId + '-' + role.toHexString();
  let roleEntity = Role.load(roleId);

  if (roleEntity) {
    roleEntity.granted = false;
    roleEntity.revokedAt = timestamp;
    roleEntity.save();
    log.info('Role revoked: {} for DID: {}', [roleId, didId]);
  } else {
    log.warning('Attempted to revoke non-existent role: {} for DID: {}', [role.toHexString(), didId]);
  }
}

export function handleAuthenticationSuccessful(event: AuthenticationSuccessful): void {
  let didId = event.params.did;
  let role = event.params.role;
  let timestamp = event.params.timestamp;

  let didEntity = DID.load(didId);
  if (!didEntity) {
    log.warning('Authentication attempt for non-existent DID: {}', [didId]);
    return; // Cannot authenticate a non-existent DID
  }

  let authId = didId + '-' + role.toHexString() + '-' + timestamp.toString();
  let auth = new Authentication(authId);
  auth.did = didEntity.id;
  auth.role = role;
  auth.timestamp = timestamp;
  auth.successful = true;
  auth.save();
  log.info('Authentication successful for DID: {} with role: {}', [didId, role.toHexString()]);
}

export function handleAuthenticationFailed(event: AuthenticationFailed): void {
  let didId = event.params.did;
  let role = event.params.role;
  let timestamp = event.params.timestamp;

  let didEntity = DID.load(didId);
  if (!didEntity) {
    log.warning('Authentication attempt for non-existent DID: {}', [didId]);
    return; // Cannot authenticate a non-existent DID
  }

  let authId = didId + '-' + role.toHexString() + '-' + timestamp.toString();
  let auth = new Authentication(authId);
  auth.did = didEntity.id;
  auth.role = role;
  auth.timestamp = timestamp;
  auth.successful = false;
  auth.save();
  log.info('Authentication failed for DID: {} with role: {}', [didId, role.toHexString()]);
}

export function handleCredentialVerified(event: CredentialVerified): void {
  let didId = event.params.did;
  let credentialType = event.params.credentialType;
  let credentialId = event.params.credentialId;
  let timestamp = event.params.timestamp;

  let credential = Credential.load(credentialId.toHexString());
  if (credential) {
    credential.verified = true;
    credential.verifiedAt = timestamp;
    credential.save();
    log.info('Credential verified: {} for DID: {}', [credentialId.toHexString(), didId]);
  } else {
    log.warning('Attempted to verify non-existent credential: {} for DID: {}', [credentialId.toHexString(), didId]);
  }
}

export function handleCredentialVerificationFailed(event: CredentialVerificationFailed): void {
  let didId = event.params.did;
  let credentialType = event.params.credentialType;
  let credentialId = event.params.credentialId;
  let timestamp = event.params.timestamp;

  let credential = Credential.load(credentialId.toHexString());
  if (credential) {
    credential.verified = false;
    credential.save();
    log.info('Credential verification failed: {} for DID: {}', [credentialId.toHexString(), didId]);
  } else {
    log.warning('Attempted to mark verification failure for non-existent credential: {} for DID: {}', [
      credentialId.toHexString(),
      didId,
    ]);
  }
}
