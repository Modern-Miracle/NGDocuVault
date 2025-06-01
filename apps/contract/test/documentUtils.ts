import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { AddressLike } from 'ethers';
import { TestContext, DocumentType, Consent } from './common';
import * as CONSTANTS from './constants';

/**
 * Creates a document with parameters from the test scenarios
 * @param ctx Test context
 * @param scenarioKey Key from TEST_SCENARIOS to use
 * @param holderAddress Optional custom holder address
 * @returns Document ID
 */
export async function createScenarioDocument(
  ctx: TestContext,
  scenarioKey: keyof typeof CONSTANTS.TEST_SCENARIOS,
  holderAddress?: AddressLike
): Promise<string> {
  // Handle batch scenarios differently
  if (scenarioKey === 'BATCH') {
    throw new Error('For batch scenarios, use createBatchDocuments function instead');
  }

  const scenario = CONSTANTS.TEST_SCENARIOS[scenarioKey] as {
    contentHash: string;
    cid: string;
    type: DocumentType;
    validity: number;
  };

  const holder = holderAddress || ctx.holder.address;
  const expirationDate = await CONSTANTS.getExpirationDate(scenario.validity);

  return ctx.registerDocument(scenario.contentHash, scenario.cid, holder, expirationDate, scenario.type);
}

/**
 * Creates multiple documents from the BATCH scenario
 * @param ctx Test context
 * @param count Optional count of documents to create (defaults to full batch)
 * @returns Array of document IDs
 */
export async function createBatchDocuments(ctx: TestContext, count?: number): Promise<string[]> {
  const batch = CONSTANTS.TEST_SCENARIOS.BATCH;
  const actualCount = count || batch.length;
  const documentIds: string[] = [];

  for (let i = 0; i < actualCount; i++) {
    const document = batch[i];
    const expirationDate = await CONSTANTS.getExpirationDate(document.validity);

    const documentId = await ctx.registerDocument(
      document.contentHash,
      document.cid,
      ctx.holder.address,
      expirationDate,
      document.type
    );

    documentIds.push(documentId);
  }

  return documentIds;
}

/**
 * Creates a document from the predefined document types
 * @param ctx Test context
 * @param documentType The type of document to create
 * @param holderAddress Optional custom holder address
 * @returns Document ID
 */
export async function createTypedDocument(
  ctx: TestContext,
  documentType: keyof typeof CONSTANTS.TEST_DOCUMENTS,
  holderAddress?: AddressLike
): Promise<string> {
  const docTemplate = CONSTANTS.TEST_DOCUMENTS[documentType];
  const holder = holderAddress || ctx.holder.address;
  const expirationDate = await CONSTANTS.getExpirationDate(docTemplate.validity);

  return ctx.registerDocument(docTemplate.contentHash, docTemplate.cid, holder, expirationDate, docTemplate.type);
}

/**
 * Creates a document that will expire after the specified duration
 * @param ctx Test context
 * @param durationInSeconds How long until the document expires
 * @returns Document ID
 */
export async function createExpiringDocument(ctx: TestContext, durationInSeconds: number): Promise<string> {
  const expirationDate = await CONSTANTS.getExpirationDate(durationInSeconds);

  return ctx.registerDocument(
    'expiring document content',
    'ipfs://QmExpiringCustomDoc',
    ctx.holder.address,
    expirationDate,
    DocumentType.GENERIC
  );
}

/**
 * Sets up a complete sharing flow: creates a verified document, requests sharing, and grants consent
 * @param ctx Test context
 * @param requester Address requesting access to document
 * @param consentDuration How long the consent should be valid
 * @returns Document ID ready for sharing
 */
export async function setupFullSharingFlow(
  ctx: TestContext,
  requester: AddressLike,
  consentDuration = CONSTANTS.DEFAULT_CONSENT_DURATION
): Promise<string> {
  // Create a document from the SHAREABLE scenario
  const documentId = await createScenarioDocument(ctx, 'SHAREABLE');

  // Verify the document if needed
  const info = await ctx.getDocumentInfo(documentId);
  if (!info.isVerified) {
    await ctx.verifyDocument(documentId);
  }

  // Request sharing
  await ctx.requestShare(documentId, requester);

  // Calculate consent expiration
  const consentValidUntil = await CONSTANTS.getExpirationDate(consentDuration);

  // Grant consent
  await ctx.giveConsent(documentId, requester, Consent.GRANTED, consentValidUntil);

  return documentId;
}

/**
 * Creates documents of all available types
 * @param ctx Test context
 * @returns Object mapping document type names to their document IDs
 */
export async function createAllDocumentTypes(
  ctx: TestContext
): Promise<Record<keyof typeof CONSTANTS.TEST_DOCUMENTS, string>> {
  const result: Partial<Record<keyof typeof CONSTANTS.TEST_DOCUMENTS, string>> = {};

  for (const documentType of Object.keys(CONSTANTS.TEST_DOCUMENTS) as Array<keyof typeof CONSTANTS.TEST_DOCUMENTS>) {
    result[documentType] = await createTypedDocument(ctx, documentType);
  }

  return result as Record<keyof typeof CONSTANTS.TEST_DOCUMENTS, string>;
}

/**
 * Updates a document using the UPDATEABLE scenario data
 * @param ctx Test context
 * @param documentId ID of document to update
 * @returns New document ID
 */
export async function updateScenarioDocument(ctx: TestContext, documentId: string): Promise<string> {
  const updateData = CONSTANTS.TEST_SCENARIOS.UPDATEABLE;
  const newExpirationDate = await CONSTANTS.getExpirationDate(updateData.updatedValidity);

  return ctx.updateDocument(
    documentId,
    updateData.updatedContentHash,
    updateData.updatedCid,
    newExpirationDate,
    updateData.type
  );
}

/**
 * Verifies a document and returns its updated info
 * @param ctx Test context
 * @param documentId ID of document to verify
 * @returns Updated document info
 */
export async function verifyAndGetDocument(ctx: TestContext, documentId: string) {
  await ctx.verifyDocument(documentId);
  return ctx.getDocumentInfo(documentId);
}

/**
 * Advances time and checks if a document is expired
 * @param ctx Test context
 * @param documentId Document to check
 * @param advanceTimeBy Seconds to advance blockchain time
 * @returns Whether the document is now expired
 */
export async function checkDocumentExpiration(
  ctx: TestContext,
  documentId: string,
  advanceTimeBy: number
): Promise<boolean> {
  await time.increase(advanceTimeBy);
  return ctx.isDocumentExpired(documentId);
}

/**
 * Tests the full document sharing flow by creating, verifying, granting consent, and sharing
 * @param ctx Test context
 * @param requester Who is requesting access to the document
 * @returns Object with document ID and shared document data
 */
export async function testFullSharingFlow(ctx: TestContext, requester: AddressLike) {
  // Create and setup document for sharing
  const documentId = await setupFullSharingFlow(ctx, requester);

  // Share the document
  const sharedDocument = await ctx.shareDocument(documentId, requester);

  return {
    documentId,
    sharedDocument,
  };
}

/**
 * Computes content hash from a string using the same method as in the tests
 * @param content Content string to hash
 * @returns Bytes32 hash
 */
export function hashContent(content: string): string {
  return CONSTANTS.computeContentHash(content);
}
