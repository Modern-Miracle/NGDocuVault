import {
  ConsentGranted,
  ConsentRevoked,
  DocumentBatchVerified,
  DocumentRegistered,
  DocumentShared,
  DocumentUpdated,
  DocumentVerified,
  IssuerActivated,
  IssuerDeactivated,
  IssuerRegistered,
  ShareRequested,
  VerificationRequested,
  DocuVault,
} from '../generated/DocuVault/DocuVault';
import { Document, Holder, Issuer, ShareRequest, VerificationRequest } from '../generated/schema';
import { Address, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts';

// Helper functions
function getOrCreateIssuer(address: Address): Issuer {
  let issuerId = address.toHexString();
  let issuer = Issuer.load(issuerId);

  if (!issuer) {
    issuer = new Issuer(issuerId);
    issuer.address = address;
    issuer.isActive = true;
    issuer.registeredAt = BigInt.fromI32(0); // Will be updated in the handler
    issuer.save();
  }

  return issuer;
}

function getOrCreateHolder(address: Address): Holder {
  let holderId = address.toHexString();
  let holder = Holder.load(holderId);

  if (!holder) {
    holder = new Holder(holderId);
    holder.address = address;
    holder.save();
  }

  return holder;
}

function generateShareRequestId(documentId: Bytes, requester: Address): string {
  return documentId.toHexString() + '-' + requester.toHexString();
}

function generateVerificationRequestId(documentId: Bytes, timestamp: BigInt): string {
  return documentId.toHexString() + '-' + timestamp.toString();
}

// Convert numeric document type to enum string
function getDocumentTypeString(typeCode: BigInt): string {
  let typeInt = typeCode.toI32();

  if (typeInt == 0) return 'GENERIC';
  if (typeInt == 1) return 'BIRTH_CERTIFICATE';
  if (typeInt == 2) return 'DEATH_CERTIFICATE';
  if (typeInt == 3) return 'MARRIAGE_CERTIFICATE';
  if (typeInt == 4) return 'ID_CARD';
  if (typeInt == 5) return 'PASSPORT';

  return 'OTHER';
}

// Log errors instead of using try/catch
function logError(message: string, context: string): void {
  log.error('{}: {}', [context, message]);
}

// Event Handlers
export function handleIssuerRegistered(event: IssuerRegistered): void {
  let issuerAddress = event.params.issuer;
  let timestamp = event.params.timestamp;

  let issuer = getOrCreateIssuer(issuerAddress);
  issuer.isActive = true;
  issuer.registeredAt = timestamp;
  issuer.activatedAt = timestamp;
  issuer.save();
}

export function handleIssuerActivated(event: IssuerActivated): void {
  let issuerAddress = event.params.issuer;
  let timestamp = event.params.timestamp;

  let issuer = getOrCreateIssuer(issuerAddress);
  issuer.isActive = true;
  issuer.activatedAt = timestamp;
  issuer.save();
}

export function handleIssuerDeactivated(event: IssuerDeactivated): void {
  let issuerAddress = event.params.issuer;
  let timestamp = event.params.timestamp;

  let issuer = getOrCreateIssuer(issuerAddress);
  issuer.isActive = false;
  issuer.deactivatedAt = timestamp;
  issuer.save();
}

export function handleDocumentRegistered(event: DocumentRegistered): void {
  let documentId = event.params.documentId;
  let issuerAddress = event.params.issuer;
  let holderAddress = event.params.holder;
  let timestamp = event.params.timestamp;

  // Get or create related entities
  let issuer = getOrCreateIssuer(issuerAddress);
  let holder = getOrCreateHolder(holderAddress);

  // Get document type and other details from the contract
  let docuVault = DocuVault.bind(event.address);
  let docInfo = docuVault.try_getDocumentInfo(documentId);

  // Create new document entity
  let document = new Document(documentId.toHexString());
  document.documentId = documentId;
  document.issuer = issuer.id;
  document.holder = holder.id;
  document.registeredAt = timestamp;

  if (!docInfo.reverted) {
    document.isVerified = docInfo.value.getIsVerified();
    document.isExpired = docInfo.value.getIsExpired();
    document.issuanceDate = docInfo.value.getIssuanceDate();
    document.expirationDate = docInfo.value.getExpirationDate();

    // Convert numeric document type to enum string
    let docTypeNumeric = docInfo.value.getDocumentType();
    document.documentType = getDocumentTypeString(BigInt.fromI32(docTypeNumeric));
  } else {
    document.isVerified = false;
    document.isExpired = false;
    document.issuanceDate = timestamp;
    document.expirationDate = timestamp.plus(BigInt.fromI32(31536000)); // Default 1 year
    document.documentType = 'GENERIC';
    log.warning('Could not fetch document info for {}. Using default values.', [documentId.toHexString()]);
  }

  document.save();
  log.info('Document registered successfully: {}', [documentId.toHexString()]);
}

export function handleDocumentVerified(event: DocumentVerified): void {
  let documentId = event.params.documentId;
  let verifier = event.params.verifier;
  let timestamp = event.params.timestamp;

  let documentIdString = documentId.toHexString();
  let document = Document.load(documentIdString);

  if (document) {
    document.isVerified = true;
    document.verifiedAt = timestamp;
    document.verifiedBy = verifier;
    document.save();
    log.info('Document verified successfully: {}', [documentIdString]);
  } else {
    log.warning('Attempted to verify non-existent document: {}', [documentIdString]);
  }
}

export function handleDocumentBatchVerified(event: DocumentBatchVerified): void {
  let documentIdsBytes = event.params.documentIds;
  let verifier = event.params.verifier;
  let timestamp = event.params.timestamp;

  // For simplicity in this implementation
  let documentIdString = documentIdsBytes.toHexString();
  let document = Document.load(documentIdString);

  if (document) {
    document.isVerified = true;
    document.verifiedAt = timestamp;
    document.verifiedBy = verifier;
    document.save();
    log.info('Document batch verified successfully: {}', [documentIdString]);
  } else {
    log.warning('Attempted to batch verify non-existent document: {}', [documentIdString]);
  }
}

export function handleDocumentShared(event: DocumentShared): void {
  let documentId = event.params.documentId;
  let requester = event.params.holder; // The requester is stored in the holder parameter
  let timestamp = event.params.timestamp;

  let requestId = generateShareRequestId(documentId, requester);
  let shareRequest = ShareRequest.load(requestId);

  if (!shareRequest) {
    // If no existing share request, create one
    let document = Document.load(documentId.toHexString());
    if (document) {
      let holder = Holder.load(document.holder);
      if (holder) {
        shareRequest = new ShareRequest(requestId);
        shareRequest.document = document.id;
        shareRequest.requester = requester;
        shareRequest.holder = holder.id;
        shareRequest.status = 'GRANTED';
        shareRequest.requestedAt = timestamp;
        shareRequest.grantedAt = timestamp;
        shareRequest.save();
      }
    }
  }
}

export function handleVerificationRequested(event: VerificationRequested): void {
  let documentId = event.params.documentId;
  let holderAddress = event.params.holder;
  let timestamp = event.params.timestamp;

  let document = Document.load(documentId.toHexString());
  let holder = getOrCreateHolder(holderAddress);

  if (document) {
    let requestId = generateVerificationRequestId(documentId, timestamp);
    let request = new VerificationRequest(requestId);
    request.document = document.id;
    request.holder = holder.id;
    request.requestedAt = timestamp;
    request.verified = false;
    request.save();
  }
}

export function handleConsentGranted(event: ConsentGranted): void {
  let documentId = event.params.documentId;
  let requesterAddress = event.params.requester;
  let timestamp = event.params.timestamp;

  let requestId = generateShareRequestId(documentId, requesterAddress);
  let shareRequest = ShareRequest.load(requestId);

  if (shareRequest) {
    shareRequest.status = 'GRANTED';
    shareRequest.grantedAt = timestamp;
    shareRequest.save();
  } else {
    // Create a new share request if one doesn't exist
    let document = Document.load(documentId.toHexString());
    if (document) {
      let holder = Holder.load(document.holder);
      if (holder) {
        let newRequest = new ShareRequest(requestId);
        newRequest.document = document.id;
        newRequest.requester = requesterAddress;
        newRequest.holder = holder.id;
        newRequest.status = 'GRANTED';
        newRequest.requestedAt = timestamp;
        newRequest.grantedAt = timestamp;
        newRequest.save();
      }
    }
  }

  // Try to get the validUntil from the contract
  let docuVault = DocuVault.bind(event.address);
  let consentInfo = docuVault.try_getConsentStatus(documentId, requesterAddress);

  if (!consentInfo.reverted) {
    let validUntil = consentInfo.value.getValidUntil();
    let shareRequest = ShareRequest.load(requestId);
    if (shareRequest) {
      shareRequest.validUntil = validUntil;
      shareRequest.save();
    }
  }
}

export function handleConsentRevoked(event: ConsentRevoked): void {
  let documentId = event.params.documentId;
  let requesterAddress = event.params.requester;
  let timestamp = event.params.timestamp;

  let requestId = generateShareRequestId(documentId, requesterAddress);
  let shareRequest = ShareRequest.load(requestId);

  if (shareRequest) {
    shareRequest.status = 'REJECTED';
    shareRequest.revokedAt = timestamp;
    shareRequest.validUntil = BigInt.fromI32(0);
    shareRequest.save();
  }
}

export function handleShareRequested(event: ShareRequested): void {
  let documentId = event.params.documentId;
  let requesterAddress = event.params.requester;
  let timestamp = event.params.timestamp;

  let document = Document.load(documentId.toHexString());

  if (document) {
    let holder = Holder.load(document.holder);
    if (holder) {
      let requestId = generateShareRequestId(documentId, requesterAddress);
      let request = ShareRequest.load(requestId);

      if (!request) {
        request = new ShareRequest(requestId);
        request.document = document.id;
        request.requester = requesterAddress;
        request.holder = holder.id;
        request.requestedAt = timestamp;
      }

      request.status = 'PENDING';
      request.save();
    }
  }
}

export function handleDocumentUpdated(event: DocumentUpdated): void {
  let oldDocumentId = event.params.oldDocumentId;
  let newDocumentId = event.params.newDocumentId;
  let issuerAddress = event.params.issuer;
  let timestamp = event.params.timestamp;

  // Get the old document
  let oldDocument = Document.load(oldDocumentId.toHexString());

  if (!oldDocument) {
    return; // Can't proceed without the old document
  }

  // Get or create the new document
  let docuVault = DocuVault.bind(event.address);
  let docInfo = docuVault.try_getDocumentInfo(newDocumentId);

  let newDocument = new Document(newDocumentId.toHexString());
  newDocument.documentId = newDocumentId;
  newDocument.issuer = oldDocument.issuer; // Keep the same issuer
  newDocument.holder = oldDocument.holder; // Keep the same holder
  newDocument.registeredAt = timestamp;
  newDocument.previousVersion = oldDocumentId.toHexString();

  if (!docInfo.reverted) {
    newDocument.isVerified = docInfo.value.getIsVerified();
    newDocument.isExpired = docInfo.value.getIsExpired();
    newDocument.issuanceDate = docInfo.value.getIssuanceDate();
    newDocument.expirationDate = docInfo.value.getExpirationDate();
    newDocument.documentType = docInfo.value.getDocumentType().toString();
  } else {
    newDocument.isVerified = false;
    newDocument.isExpired = false;
    newDocument.issuanceDate = timestamp;
    newDocument.expirationDate = timestamp.plus(BigInt.fromI32(31536000)); // Default 1 year
    newDocument.documentType = 'GENERIC';
  }

  newDocument.save();
}
