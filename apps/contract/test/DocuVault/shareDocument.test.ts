import { expect } from 'chai';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, Consent, DocumentType, isValidTimestamp } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - shareDocument', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  it('should correctly share document data with authorized requester', async function () {
    // Create a document for sharing
    const documentId = await docUtils.setupFullSharingFlow(ctx, ctx.pfa.address);

    // Get document info before sharing
    const infoBeforeSharing = await ctx.getDocumentInfo(documentId);

    // Share document
    const document = await ctx.shareDocument(documentId, ctx.pfa.address);

    // Verify shared data matches direct info
    expect(document.issuer).to.equal(infoBeforeSharing.issuer);
    expect(document.holder).to.equal(infoBeforeSharing.holder);
    expect(document.issuanceDate).to.equal(infoBeforeSharing.issuanceDate);
    expect(document.expirationDate).to.equal(infoBeforeSharing.expirationDate);
    expect(document.documentType).to.equal(infoBeforeSharing.documentType);
    expect(document.isVerified).to.equal(infoBeforeSharing.isVerified);
  });

  it('should revert when sharing an unverified document', async function () {
    // Register a document as holder (not auto-verified)
    const contentHash = CONSTANTS.computeContentHash('unverified document');
    const cid = 'ipfs://QmUnverifiedDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    const tx = await ctx.docuVault
      .connect(ctx.holder)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Give consent
    const validUntil = await CONSTANTS.getExpirationDate(CONSTANTS.DEFAULT_CONSENT_DURATION);
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, validUntil);

    // Attempt to share unverified document should fail
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotVerified');
  });

  it('should revert when sharing with requester without consent', async function () {
    // Create a verified document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Verify the document info shows it's verified
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;

    // Attempt to share without prior consent
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotGranted');
  });

  it('should revert when sharing with requester after consent expiration', async function () {
    // Create a document for sharing with short consent duration
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Give short-lived consent (1 minute)
    const validUntil = await CONSTANTS.getExpirationDate(60); // 60 seconds
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, validUntil);

    // Advance time beyond consent validity
    await time.increase(120); // 2 minutes

    // Attempt to share after consent expiration
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__Expired');
  });

  it('should revert when sharing an expired document', async function () {
    // Create a document that expires soon
    const documentId = await docUtils.createExpiringDocument(ctx, 60); // 60 seconds

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Give consent
    const validUntil = await CONSTANTS.getExpirationDate(120); // 2 minutes
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, validUntil);

    // Advance time beyond document expiration
    await time.increase(90); // 1.5 minutes

    // Attempt to share expired document
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__Expired');
  });

  it('should revert when non-holder attempts to share document', async function () {
    // Create a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Give consent
    const validUntil = await CONSTANTS.getExpirationDate(CONSTANTS.DEFAULT_CONSENT_DURATION);
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, validUntil);

    // Attempt to share from non-holder account
    await expect(
      ctx.docuVault.connect(ctx.unauthorized).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotHolder');
  });

  it('should emit DocumentShared event when sharing successfully', async function () {
    // Set up sharing
    const documentId = await docUtils.setupFullSharingFlow(ctx, ctx.pfa.address);

    // Share and check for event
    await expect(ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address))
      .to.emit(ctx.docuVault, 'DocumentShared')
      .withArgs(documentId, ctx.pfa.address, () => true); // Accept any timestamp
  });

  it('should allow sharing after consent was revoked then granted again', async function () {
    // Set up sharing
    const documentId = await docUtils.setupFullSharingFlow(ctx, ctx.pfa.address);

    // Revoke consent
    await ctx.revokeConsent(documentId, ctx.pfa.address);

    // Attempt to share after revocation
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotGranted');

    // Grant consent again
    const validUntil = await CONSTANTS.getExpirationDate(CONSTANTS.DEFAULT_CONSENT_DURATION);
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, validUntil);

    // Should be able to share again
    const document = await ctx.shareDocument(documentId, ctx.pfa.address);
    expect(document.issuer).to.equal(ctx.issuer.address);
  });

  it('should work with the test helper in common.ts', async function () {
    // Set up sharing
    const documentId = await docUtils.setupFullSharingFlow(ctx, ctx.pfa.address);

    // Use the shareDocument helper
    const document = await ctx.shareDocument(documentId, ctx.pfa.address);

    // Get document info directly
    const info = await ctx.getDocumentInfo(documentId);

    // Verify the helper returns the correct data
    expect(document.issuer).to.equal(info.issuer);
    expect(document.holder).to.equal(info.holder);
    expect(document.issuanceDate).to.equal(info.issuanceDate);
    expect(document.expirationDate).to.equal(info.expirationDate);
    expect(document.isVerified).to.equal(info.isVerified);
    expect(document.documentType).to.equal(info.documentType);
  });

  // New tests to improve coverage
  it('should revert when consent validation is successful but document has just expired', async function () {
    // Get current time
    const currentTime = await time.latest();

    // Create a document expiring in 120 seconds
    const contentHash = CONSTANTS.computeContentHash('document with near expiration');
    const cid = 'ipfs://QmNearExpiryDoc';
    const documentExpiration = currentTime + 120; // 2 minutes

    const tx = await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, documentExpiration, DocumentType.GENERIC);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const documentId = ctx.docuVault.interface.parseLog(event as any)?.args.documentId;

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Give consent with longer validity than document expiration
    const consentValidUntil = currentTime + 180; // 3 minutes (longer than document expiration)
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, consentValidUntil);

    // Verify consent is valid and properly capped
    const [consentStatus, actualValidUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.GRANTED);
    // Consent validity should be capped at document expiration
    expect(actualValidUntil).to.equal(documentExpiration);

    // Share document successfully
    const sharedDoc = await ctx.shareDocument(documentId, ctx.pfa.address);
    expect(sharedDoc.issuer).to.equal(ctx.issuer.address);

    // Advance time to just after document expiration
    await time.increaseTo(documentExpiration + 1);

    // Attempt to share again - should fail due to document expiration
    // This tests the onlyActiveDocument modifier
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__Expired');

    // Check that both document and consent are valid
    const [consentStatusAfter, validUntilAfter] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatusAfter).to.equal(Consent.GRANTED);
    // Consent should still be recorded as valid, even though document expired
    expect(validUntilAfter).to.equal(documentExpiration);

    // Document should be shown as expired in getDocumentInfo
    const docInfo = await ctx.getDocumentInfo(documentId);
    expect(docInfo.isExpired).to.be.true;
  });

  it('should handle consent with exactly same expiration as document correctly', async function () {
    // Current time
    const currentTime = await time.latest();

    // Create document with 60 second expiration
    const documentExpiration = currentTime + 60;
    const contentHash = CONSTANTS.computeContentHash('exact expiration test');
    const cid = 'ipfs://QmExactExpiryDoc';

    const tx = await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, documentExpiration, DocumentType.GENERIC);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const documentId = ctx.docuVault.interface.parseLog(event as any)?.args.documentId;

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Give consent with exact same expiration as document
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, documentExpiration);

    // Check consent validity
    const [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.GRANTED);
    expect(validUntil).to.equal(documentExpiration);

    // Should be able to share document
    const document = await ctx.shareDocument(documentId, ctx.pfa.address);
    expect(document.issuer).to.equal(ctx.issuer.address);

    // Advance time to exactly the expiration time
    await time.increaseTo(documentExpiration);

    // At this point both document and consent are expired (block.timestamp == expiration)
    await expect(
      ctx.docuVault.connect(ctx.holder).shareDocument(documentId, ctx.pfa.address)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__Expired');

    // Verify document is expired
    expect(await ctx.docuVault.isDocumentExpired(documentId)).to.be.true;
  });
});
