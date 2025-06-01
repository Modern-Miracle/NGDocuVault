import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, DocumentType, isValidTimestamp } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - registerDocument', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  afterEach(async function () {
    if (await ctx.docuVault.paused()) {
      await ctx.docuVault.connect(ctx.admin).unpause();
    }
  });

  it('should register a document with proper parameters', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('standard document content');
    const cid = 'ipfs://QmStandardDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Register document
    const tx = await ctx.docuVault.connect(ctx.issuer).registerDocument(
      contentHash,
      cid,
      ctx.holder.address,
      0, // issuanceDate (0 means current timestamp)
      expirationDate,
      DocumentType.GENERIC
    );

    // Get transaction receipt and extract documentId from event
    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Verify document was registered
    expect(documentId).to.not.be.undefined;

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);

    // Verify document properties
    expect(info.issuer).to.equal(ctx.issuer.address);
    expect(info.holder).to.equal(ctx.holder.address);
    expect(info.issuanceDate).to.be.a('number');
    expect(info.expirationDate).to.equal(expirationDate);
    expect(info.isVerified).to.be.true; // Auto-verified when registered by issuer
    expect(info.isExpired).to.be.false;
    expect(info.documentType).to.equal(DocumentType.GENERIC);
  });

  it('should register a document with custom issuance date', async function () {
    // Prepare document data
    const contentHashStr = 'document with custom issuance date';
    const contentHash = CONSTANTS.computeContentHash(contentHashStr);
    const cid = 'ipfs://QmCustomIssuanceDoc';
    const issuanceDate = (await time.latest()) - CONSTANTS.SECONDS_PER_DAY; // 1 day ago
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Register document
    const tx = await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, ctx.holder.address, issuanceDate, expirationDate, DocumentType.GENERIC);

    // Get transaction receipt and extract documentId from event
    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);

    // Verify document properties
    expect(info.issuanceDate).to.equal(issuanceDate);
  });

  it('should allow a holder to register their own document', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('holder-registered document');
    const cid = 'ipfs://QmHolderRegisteredDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Register document as holder
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

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);

    // Verify document properties
    expect(info.issuer).to.equal(ctx.holder.address);
    expect(info.holder).to.equal(ctx.holder.address);
    expect(info.isVerified).to.be.false; // Not auto-verified when registered by holder
  });

  it('should emit DocumentRegistered event with correct parameters', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('event test document');
    const cid = 'ipfs://QmEventTestDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Register document and check for event
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC)
    )
      .to.emit(ctx.docuVault, 'DocumentRegistered')
      .withArgs(
        // We don't know the exact documentId here, so we use the wildcard pattern
        ethers.isHexString, // documentId will be a hex string
        ctx.issuer.address,
        ctx.holder.address,
        () => true // Accept any timestamp to avoid test flakiness
      );
  });

  it('should register documents with different document types', async function () {
    // For each document type, register a document and check its type
    for (const [typeName, docData] of Object.entries(CONSTANTS.TEST_DOCUMENTS)) {
      const contentHash = CONSTANTS.computeContentHash(`${typeName.toLowerCase()} test`);
      const cid = `ipfs://Qm${typeName}TypeTest`;
      const expirationDate = await CONSTANTS.getExpirationDate(docData.validity);

      // Register document
      const tx = await ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, docData.type);

      // Get transaction receipt and extract documentId from event
      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
      );
      const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
      const documentId = parsedEvent?.args.documentId;

      // Get document info
      const info = await ctx.getDocumentInfo(documentId);

      // Verify document type
      expect(info.documentType).to.equal(docData.type);
    }
  });

  it('should revert when registering document with zero address holder', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('zero address holder test');
    const cid = 'ipfs://QmZeroAddressTest';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Attempt to register with zero address holder
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ethers.ZeroAddress, 0, expirationDate, DocumentType.GENERIC)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__ZeroAddress');
  });

  it('should revert when registering document with empty content hash', async function () {
    // Prepare document data
    const cid = 'ipfs://QmEmptyHashTest';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Attempt to register with empty content hash
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          cid,
          ctx.holder.address,
          0,
          expirationDate,
          DocumentType.GENERIC
        )
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__InvalidHash');
  });

  it('should revert when registering document with empty CID', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('empty cid test');
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Attempt to register with empty CID
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, '', ctx.holder.address, 0, expirationDate, DocumentType.GENERIC)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__InvalidHash');
  });

  it('should revert when registering document with expiration date in the past', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('expired document test');
    const cid = 'ipfs://QmExpiredTest';
    const pastExpirationDate = (await time.latest()) - CONSTANTS.SECONDS_PER_DAY; // 1 day ago

    // Attempt to register with past expiration date
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ctx.holder.address, 0, pastExpirationDate, DocumentType.GENERIC)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__Expired');
  });

  it('should revert when registering document with expiration date before issuance date', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('invalid dates test');
    const cid = 'ipfs://QmInvalidDatesTest';
    const issuanceDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_DAY * 2); // 2 days from now
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_DAY); // 1 day from now

    // Attempt to register with expiration before issuance
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ctx.holder.address, issuanceDate, expirationDate, DocumentType.GENERIC)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__InvalidDate');
  });

  it('should revert when registering the same document twice', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('duplicate document test');
    const cid = 'ipfs://QmDuplicateTest';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Register document first time
    await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC);

    // Attempt to register same document again
    await expect(
      ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC)
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__AlreadyRegistered');
  });

  it('should revert when unauthorized user registers document for another holder', async function () {
    // Prepare document data
    const contentHash = CONSTANTS.computeContentHash('unauthorized registration test');
    const cid = 'ipfs://QmUnauthorizedTest';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Attempt to register document as unauthorized user
    await expect(
      ctx.docuVault.connect(ctx.unauthorized).registerDocument(
        contentHash,
        cid,
        ctx.holder.address, // Different from sender
        0,
        expirationDate,
        DocumentType.GENERIC
      )
    ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotAuthorized');
  });

  it('should correctly generate deterministic document ID', async function () {
    // Prepare document data
    const contentHashStr = 'deterministic id test';
    const contentHash = CONSTANTS.computeContentHash(contentHashStr);
    const cid = 'ipfs://QmDeterministicTest';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Pre-compute expected document ID
    const expectedDocumentId = await ctx.docuVault.generateDocumentId(contentHash, ctx.holder.address, cid);

    // Register document
    const tx = await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC);

    // Get transaction receipt and extract documentId from event
    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const actualDocumentId = parsedEvent?.args.documentId;

    // Verify document ID matches expected
    expect(actualDocumentId).to.equal(expectedDocumentId);
  });

  it("should store the document ID in holder's document list", async function () {
    // Register document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Get holder's document list
    const documents = await ctx.docuVault.getDocuments(ctx.holder.address);

    // Check that the document ID is in the list
    expect(documents).to.include(documentId);
  });
});
