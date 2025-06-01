import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, DocumentType, isValidTimestamp } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - verifyDocument', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  afterEach(async function () {
    if (await ctx.docuVault.paused()) {
      await ctx.docuVault.connect(ctx.admin).unpause();
    }
  });

  it('should verify a document registered by a holder', async function () {
    // Register a document as holder (not auto-verified)
    const contentHash = CONSTANTS.computeContentHash('holder document for verification');
    const cid = 'ipfs://QmHolderVerifyDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    const tx = await ctx.docuVault
      .connect(ctx.holder)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC);

    // Get transaction receipt and extract documentId from event
    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Verify initial state
    let info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.false;

    // Verify the document as issuer
    await ctx.verifyDocument(documentId);

    // Check updated state
    info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;
  });

  it('should emit DocumentVerified event when verifying a document', async function () {
    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('event test document');
    const cid = 'ipfs://QmEventVerifyDoc';
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

    // Verify document and check for event
    await expect(ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId))
      .to.emit(ctx.docuVault, 'DocumentVerified')
      .withArgs(documentId, ctx.issuer.address, () => true); // Accept any timestamp
  });

  it('should revert when non-issuer tries to verify a document', async function () {
    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('unauthorized verify test');
    const cid = 'ipfs://QmUnauthorizedVerifyDoc';
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

    // Attempt to verify document as non-issuer
    await expect(ctx.docuVault.connect(ctx.unauthorized).verifyDocument(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__NotIssuer'
    );
  });

  it('should revert when verifying an already verified document', async function () {
    // Create document that's already verified (registered by issuer)
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Verify the document is already verified
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;

    // Attempt to verify again
    await expect(ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__AlreadyVerified'
    );
  });

  it('should revert when verifying a non-existent document', async function () {
    // Create a non-existent document ID
    const fakeDocumentId = ethers.keccak256(ethers.toUtf8Bytes('non-existent document'));

    // Attempt to verify non-existent document
    await expect(ctx.docuVault.connect(ctx.issuer).verifyDocument(fakeDocumentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__NotRegistered'
    );
  });

  it('should revert when verifying an expired document', async function () {
    // Create a document that expires soon
    const contentHash = CONSTANTS.computeContentHash('expiring document for verify test');
    const cid = 'ipfs://QmExpiringVerifyDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(60); // 60 seconds

    const tx = await ctx.docuVault
      .connect(ctx.holder)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Advance time beyond document expiration
    await time.increase(90); // 1.5 minutes

    // Attempt to verify expired document
    await expect(ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'DocuVault__Expired'
    );
  });

  it('should allow verification when contract is not paused', async function () {
    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('pause test document');
    const cid = 'ipfs://QmPauseVerifyDoc';
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

    // Verify document should work when not paused
    await ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId);

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;
  });

  it('should revert verification when contract is paused', async function () {
    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('pause test document 2');
    const cid = 'ipfs://QmPauseVerifyDoc2';
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

    // Attempt to verify document when paused
    // Using correct error format for OpenZeppelin's Pausable contract
    await expect(ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId)).to.be.revertedWithCustomError(
      ctx.docuVault,
      'EnforcedPause'
    );

    // Unpause the contract
    await ctx.docuVault.connect(ctx.admin).unpause();

    // Verification should work after unpausing
    await ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId);

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;
  });

  it('should allow any issuer to verify document (not just the document creator)', async function () {
    // Create a second issuer
    await ctx.docuVault.connect(ctx.admin).registerIssuer(ctx.pfa.address);

    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('multi-issuer test');
    const cid = 'ipfs://QmMultiIssuerDoc';
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

    // Verify document with second issuer
    await ctx.docuVault.connect(ctx.pfa).verifyDocument(documentId);

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;
  });

  it('should use the verifyAndGetDocument utility correctly', async function () {
    // Create unverified document
    const contentHash = CONSTANTS.computeContentHash('utility test document');
    const cid = 'ipfs://QmUtilityVerifyDoc';
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

    // Use the utility function
    const info = await docUtils.verifyAndGetDocument(ctx, documentId);

    // Verify result
    expect(info.isVerified).to.be.true;
    expect(info.holder).to.equal(ctx.holder.address);
    expect(info.expirationDate).to.equal(expirationDate);
  });
});
