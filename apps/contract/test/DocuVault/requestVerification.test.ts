import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, DocumentType, isValidTimestamp } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - requestVerification', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  it('should allow holder to request verification for an unverified document', async function () {
    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('document for verification request');
    const cid = 'ipfs://QmVerificationReqDoc';
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

    // Verify initial state
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.false;

    // Request verification and check for event
    await expect(ctx.docuVault.connect(ctx.holder).requestVerification(documentId))
      .to.emit(ctx.docuVault, 'VerificationRequested')
      .withArgs(documentId, ctx.holder.address, () => true); // Accept any timestamp
  });

  it('should revert when requesting verification for an already verified document', async function () {
    // Create a verified document (registered by issuer, so auto-verified)
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Verify the document is verified
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;

    // Attempt to request verification for an already verified document
    await expect(ctx.docuVault.connect(ctx.holder).requestVerification(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__AlreadyVerified'
    );
  });

  it('should revert when non-holder requests verification', async function () {
    // Register a document as holder (not auto-verified)
    const contentHash = CONSTANTS.computeContentHash('document for non-holder test');
    const cid = 'ipfs://QmNonHolderDoc';
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

    // Attempt to request verification as unauthorized user
    await expect(ctx.docuVault.connect(ctx.unauthorized).requestVerification(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__NotHolder'
    );
  });

  it('should revert when requesting verification for a non-existent document', async function () {
    // Generate a document ID that would belong to the holder but doesn't exist in the system
    const contentHash = CONSTANTS.computeContentHash('non-existent document test');
    const cid = 'ipfs://QmNonExistentDoc';

    // Use the contract's own document ID generation function
    const fakeDocumentId = await ctx.docuVault.generateDocumentId(contentHash, ctx.holder.address, cid);

    // The contract now checks if the document exists before checking if sender is the document holder,
    // so we expect DocuVault__NotRegistered error
    await expect(ctx.docuVault.connect(ctx.holder).requestVerification(fakeDocumentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__NotRegistered'
    );
  });

  it('should revert when requesting verification for an expired document', async function () {
    // Create a document that expires soon
    const documentId = await docUtils.createExpiringDocument(ctx, 60); // 60 seconds

    // Verify initial state (not expired)
    let info = await ctx.getDocumentInfo(documentId);
    expect(info.isExpired).to.be.false;

    // Advance time beyond document expiration
    await time.increase(120); // 2 minutes

    // Verify document is expired
    info = await ctx.getDocumentInfo(documentId);
    expect(info.isExpired).to.be.true;

    // Attempt to request verification for an expired document
    await expect(ctx.docuVault.connect(ctx.holder).requestVerification(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__Expired'
    );
  });

  it('should not be possible to request verification when contract is paused', async function () {
    // Register a document as holder (not auto-verified)
    const contentHash = CONSTANTS.computeContentHash('document for pause test');
    const cid = 'ipfs://QmPauseDoc';
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

    // Pause the contract
    await ctx.docuVault.connect(ctx.admin).pause();

    // Attempt to request verification while contract is paused
    await expect(ctx.docuVault.connect(ctx.holder).requestVerification(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'EnforcedPause'
    );

    // Unpause the contract
    await ctx.docuVault.connect(ctx.admin).unpause();

    // Should be able to request verification after unpausing
    await expect(ctx.docuVault.connect(ctx.holder).requestVerification(documentId)).to.emit(
      ctx.docuVault,
      'VerificationRequested'
    );
  });
});
