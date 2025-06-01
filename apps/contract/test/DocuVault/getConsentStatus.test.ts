import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, Consent, DocumentType } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - getConsentStatus', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  it('should return PENDING status for newly requested share', async function () {
    // Create a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Check consent status
    const [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.PENDING);
    expect(validUntil).to.equal(0); // Validity period is 0 for pending requests
  });

  it('should return GRANTED status with correct validity period after granting consent', async function () {
    // Create a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Set consent validity period (30 days)
    const validityPeriod = (await time.latest()) + 30 * 24 * 60 * 60;

    // Grant consent
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, validityPeriod);

    // Check consent status
    const [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.GRANTED);
    expect(validUntil).to.equal(validityPeriod);
  });

  it('should return REJECTED status after rejecting consent', async function () {
    // Create a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Explicitly set validUntil to 0 when rejecting
    const validUntil = 0;

    // Reject consent
    await ctx.docuVault.connect(ctx.holder).giveConsent(documentId, ctx.pfa.address, Consent.REJECTED, validUntil);

    // Check consent status
    const [consentStatus, validPeriod] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.REJECTED);
    expect(validPeriod).to.equal(0); // Validity period is 0 for rejected requests
  });

  it('should return REJECTED status with zero validity period after revoking consent', async function () {
    // Create a document and set up sharing with consent
    const documentId = await docUtils.setupFullSharingFlow(ctx, ctx.pfa.address);

    // Check initial status (should be GRANTED)
    let [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.GRANTED);
    expect(validUntil).to.be.gt(0); // Should have a non-zero validity period

    // Revoke consent
    await ctx.revokeConsent(documentId, ctx.pfa.address);

    // Check updated status
    [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.REJECTED);
    expect(validUntil).to.equal(0); // Validity period is cleared after revocation
  });

  it('should adjust validity period to document expiration date if consent period is longer', async function () {
    // Create a document that expires in 10 days
    const expirationTime = (await time.latest()) + 10 * 24 * 60 * 60;
    const contentHash = CONSTANTS.computeContentHash('document for expiration test');
    const cid = 'ipfs://QmExpirationDoc';

    const tx = await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationTime, DocumentType.GENERIC);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Request share
    await ctx.requestShare(documentId, ctx.pfa.address);

    // Try to grant consent for a period longer than document expiration (30 days)
    const consentPeriod = (await time.latest()) + 30 * 24 * 60 * 60;
    await ctx.giveConsent(documentId, ctx.pfa.address, Consent.GRANTED, consentPeriod);

    // Check that consent validity period was capped at document expiration
    const [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.GRANTED);
    expect(validUntil).to.equal(expirationTime); // Should be capped at document expiration
  });

  it('should return default/empty values for requests that were never made', async function () {
    // Create a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Check consent status for an address that never requested access
    const randomAddress = ethers.Wallet.createRandom().address;
    const [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, randomAddress);

    // For never-requested shares, status should be the default enum value (PENDING = 0)
    expect(consentStatus).to.equal(Consent.PENDING);
    expect(validUntil).to.equal(0);
  });

  it('should work correctly with non-existent documents', async function () {
    // Create a non-existent document ID
    const fakeDocumentId = ethers.keccak256(ethers.toUtf8Bytes('non-existent document'));

    // Should still return a result without reverting
    const [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(fakeDocumentId, ctx.pfa.address);
    expect(consentStatus).to.equal(Consent.PENDING);
    expect(validUntil).to.equal(0);
  });

  it('should handle multiple consent requests for the same document', async function () {
    // Create a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Set up multiple requesters
    const requester1 = ctx.pfa.address;
    const requester2 = ctx.unauthorized.address;

    // Request share for both requesters
    await ctx.requestShare(documentId, requester1);
    await ctx.requestShare(documentId, requester2);

    // Grant consent to requester1
    const validityPeriod = (await time.latest()) + 30 * 24 * 60 * 60;
    await ctx.giveConsent(documentId, requester1, Consent.GRANTED, validityPeriod);

    // Reject requester2 with explicit 0 validity
    await ctx.docuVault.connect(ctx.holder).giveConsent(documentId, requester2, Consent.REJECTED, 0);

    // Check consent status for requester1
    let [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, requester1);
    expect(consentStatus).to.equal(Consent.GRANTED);
    expect(validUntil).to.equal(validityPeriod);

    // Check consent status for requester2
    [consentStatus, validUntil] = await ctx.docuVault.getConsentStatus(documentId, requester2);
    expect(consentStatus).to.equal(Consent.REJECTED);
    expect(validUntil).to.equal(0);
  });
});
