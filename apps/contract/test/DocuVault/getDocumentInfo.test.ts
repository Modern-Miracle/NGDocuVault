import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { DocumentType } from '../common';
import { setupTest, TestContext } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - getDocumentInfo', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  it('should return correct information for a newly registered document', async function () {
    // Register a document
    const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);

    // Verify document info reflects registration state
    expect(info.issuer).to.equal(ctx.issuer.address);
    expect(info.holder).to.equal(ctx.holder.address);
    expect(info.issuanceDate).to.be.a('number');
    expect(info.expirationDate).to.be.a('number');
    expect(info.isVerified).to.be.true; // Auto-verified when registered by issuer
    expect(info.isExpired).to.be.false;
    expect(info.documentType).to.equal(DocumentType.GENERIC);
  });

  it('should return correct information for a document registered by holder', async function () {
    // Register a document as holder
    const contentHash = CONSTANTS.computeContentHash('holder document content');
    const cid = 'ipfs://QmHolderDoc';
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    const tx = await ctx.docuVault.connect(ctx.holder).registerDocument(
      contentHash,
      cid,
      ctx.holder.address,
      0, // issuanceDate (0 means current timestamp)
      expirationDate,
      DocumentType.GENERIC
    );

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Get document info
    const info = await ctx.getDocumentInfo(documentId);

    // Verify document info reflects registration state
    expect(info.issuer).to.equal(ctx.holder.address);
    expect(info.holder).to.equal(ctx.holder.address);
    expect(info.issuanceDate).to.be.a('number');
    expect(info.expirationDate).to.equal(expirationDate);
    expect(info.isVerified).to.be.false; // Not auto-verified when registered by holder
    expect(info.isExpired).to.be.false;
    expect(info.documentType).to.equal(DocumentType.GENERIC);
  });

  it('should update isVerified status after document verification', async function () {
    // Create document from holder which will not be auto-verified
    const contentHash = CONSTANTS.computeContentHash('holder document for verification');
    const cid = 'ipfs://QmHolderVerifyDoc';
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
    let info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.false;

    // Verify the document
    await ctx.verifyDocument(documentId);

    // Check updated state
    info = await ctx.getDocumentInfo(documentId);
    expect(info.isVerified).to.be.true;
  });

  it('should reflect expired status for documents past expiration date', async function () {
    // Create a document that expires soon
    const documentId = await docUtils.createExpiringDocument(ctx, CONSTANTS.SECONDS_PER_DAY);

    // Verify initial state
    let info = await ctx.getDocumentInfo(documentId);
    expect(info.isExpired).to.be.false;
    expect(info.isVerified).to.be.true; // Registered by issuer, so auto-verified

    // Advance time beyond expiration
    await time.increase(CONSTANTS.SECONDS_PER_DAY + 100);

    // Check updated state
    info = await ctx.getDocumentInfo(documentId);
    expect(info.isExpired).to.be.true;
    expect(info.isVerified).to.be.false; // Should not be valid if expired
  });

  it('should return correct document type for each document type', async function () {
    // Create a document of each type
    const documentIds = await docUtils.createAllDocumentTypes(ctx);

    // Verify each document type
    for (const [typeName, documentId] of Object.entries(documentIds)) {
      const info = await ctx.getDocumentInfo(documentId);
      const expectedType = CONSTANTS.TEST_DOCUMENTS[typeName as keyof typeof CONSTANTS.TEST_DOCUMENTS].type;
      expect(info.documentType).to.equal(expectedType);
    }
  });

  it('should handle document updates correctly', async function () {
    // Create an original document
    const originalDocId = await docUtils.createScenarioDocument(ctx, 'UPDATEABLE');

    // Update the document
    const newDocId = await docUtils.updateScenarioDocument(ctx, originalDocId);

    // Get info for both documents
    const originalInfo = await ctx.getDocumentInfo(originalDocId);
    const newInfo = await ctx.getDocumentInfo(newDocId);

    // Verify the original document info
    expect(originalInfo.issuer).to.equal(ctx.issuer.address);
    expect(originalInfo.holder).to.equal(ctx.holder.address);

    // Verify the updated document info
    expect(newInfo.issuer).to.equal(ctx.issuer.address);
    expect(newInfo.holder).to.equal(ctx.holder.address);
    expect(newInfo.issuanceDate).to.be.gt(originalInfo.issuanceDate);
    expect(newInfo.expirationDate).to.be.gt(originalInfo.expirationDate);
    expect(newInfo.isVerified).to.be.true; // Updated by issuer, so auto-verified
  });

  it('should integrate with document sharing flow', async function () {
    // Set up full sharing flow
    const { documentId, sharedDocument } = await docUtils.testFullSharingFlow(ctx, ctx.pfa.address);

    // Get the document info directly
    const info = await ctx.getDocumentInfo(documentId);

    // Compare shared document with direct info
    expect(sharedDocument.issuer).to.equal(info.issuer);
    expect(sharedDocument.holder).to.equal(info.holder);
    expect(sharedDocument.issuanceDate).to.equal(info.issuanceDate);
    expect(sharedDocument.expirationDate).to.equal(info.expirationDate);
    expect(sharedDocument.isVerified).to.equal(info.isVerified);
    expect(sharedDocument.documentType).to.equal(info.documentType);
  });

  it('should return default values for non-existent document', async function () {
    // Create a non-existent document ID
    const fakeDocumentId = ethers.keccak256(ethers.toUtf8Bytes('non-existent document'));

    // Get document info for non-existent document
    const info = await ctx.docuVault.getDocumentInfo(fakeDocumentId);

    // Check that default values are returned
    expect(info[0]).to.be.false; // isVerified should be false
    expect(info[1]).to.be.true; // isExpired should be true (since expirationDate is 0, and 0 <= current timestamp)
    expect(info[2]).to.equal(ethers.ZeroAddress); // issuer should be zero address
    expect(info[3]).to.equal(ethers.ZeroAddress); // holder should be zero address
    expect(info[4]).to.equal(0); // issuanceDate should be 0
    expect(info[5]).to.equal(0); // expirationDate should be 0
    expect(info[6]).to.equal(0); // documentType should be 0 (GENERIC)
  });
});
