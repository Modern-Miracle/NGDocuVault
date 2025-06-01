import { expect } from 'chai';
import { ethers } from 'hardhat';
import { setupTest, TestContext, DocumentType } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - verifyCid', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  it('should return true when the CID matches the document ID', async function () {
    // Define document parameters
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes('verified content hash'));
    const cid = 'ipfs://QmVerifiedCid';
    const holder = ctx.holder.address;

    // Use the contract to generate the document ID
    const documentId = await ctx.docuVault.generateDocumentId(contentHash, holder, cid);

    // Verify the CID matches
    const result = await ctx.docuVault.verifyCid(contentHash, holder, cid, documentId);
    expect(result).to.be.true;
  });

  it('should return false when the CID does not match the document ID', async function () {
    // Define document parameters
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes('verified content hash'));
    const originalCid = 'ipfs://QmOriginalCid';
    const differentCid = 'ipfs://QmDifferentCid';
    const holder = ctx.holder.address;

    // Generate document ID with the original CID
    const documentId = await ctx.docuVault.generateDocumentId(contentHash, holder, originalCid);

    // Verify with a different CID should fail
    const result = await ctx.docuVault.verifyCid(contentHash, holder, differentCid, documentId);
    expect(result).to.be.false;
  });

  it('should return false when content hash does not match', async function () {
    // Define document parameters
    const originalContentHash = ethers.keccak256(ethers.toUtf8Bytes('original content hash'));
    const differentContentHash = ethers.keccak256(ethers.toUtf8Bytes('different content hash'));
    const cid = 'ipfs://QmContentHashTest';
    const holder = ctx.holder.address;

    // Generate document ID with original content hash
    const documentId = await ctx.docuVault.generateDocumentId(originalContentHash, holder, cid);

    // Verify with different content hash should fail
    const result = await ctx.docuVault.verifyCid(differentContentHash, holder, cid, documentId);
    expect(result).to.be.false;
  });

  it('should return false when holder address does not match', async function () {
    // Define document parameters
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes('holder test content hash'));
    const cid = 'ipfs://QmHolderTest';
    const originalHolder = ctx.holder.address;
    const differentHolder = ctx.unauthorized.address;

    // Generate document ID with original holder
    const documentId = await ctx.docuVault.generateDocumentId(contentHash, originalHolder, cid);

    // Verify with different holder should fail
    const result = await ctx.docuVault.verifyCid(contentHash, differentHolder, cid, documentId);
    expect(result).to.be.false;
  });

  it('should verify CID for a real registered document', async function () {
    // Define document parameters
    const contentHashStr = 'real document content';
    const contentHash = CONSTANTS.computeContentHash(contentHashStr);
    const cid = 'ipfs://QmRealDoc';
    const holder = ctx.holder.address;
    const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

    // Register the document
    const tx = await ctx.docuVault
      .connect(ctx.issuer)
      .registerDocument(contentHash, cid, holder, 0, expirationDate, DocumentType.GENERIC);

    const receipt = await tx.wait();
    const event = receipt?.logs.find(
      (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
    );
    const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
    const documentId = parsedEvent?.args.documentId;

    // Verify the CID matches
    const result = await ctx.docuVault.verifyCid(contentHash, holder, cid, documentId);
    expect(result).to.be.true;
  });

  it('should use the helper function correctly in common.ts', async function () {
    // Define document parameters
    const contentHashStr = 'helper test content';
    const cid = 'ipfs://QmHelperTest';
    const holder = ctx.holder.address;

    // Generate document ID using generateDocumentId function
    const documentId = await ctx.generateDocumentId(contentHashStr, holder, cid);

    // Verify CID using verifyCid helper
    const result = await ctx.verifyCid(contentHashStr, holder, cid, documentId);
    expect(result).to.be.true;
  });

  it('should be case-sensitive for CIDs', async function () {
    // Define document parameters
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes('case sensitive test'));
    const originalCid = 'ipfs://QmCaseSensitive';
    const differentCasesCid = 'ipfs://QmcAsEsEnSiTiVe';
    const holder = ctx.holder.address;

    // Generate document ID with the original CID
    const documentId = await ctx.docuVault.generateDocumentId(contentHash, holder, originalCid);

    // Verify with a CID with different casing should fail
    const result = await ctx.docuVault.verifyCid(contentHash, holder, differentCasesCid, documentId);
    expect(result).to.be.false;
  });

  it('should handle empty CID correctly', async function () {
    // Define document parameters
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes('empty cid test'));
    const emptyCid = '';
    const holder = ctx.holder.address;

    // Generate document ID with empty CID
    const documentId = await ctx.docuVault.generateDocumentId(contentHash, holder, emptyCid);

    // Verify with the same empty CID should pass
    const result = await ctx.docuVault.verifyCid(contentHash, holder, emptyCid, documentId);
    expect(result).to.be.true;
  });

  it('should work with very long CIDs', async function () {
    // Define document parameters
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes('long cid test'));
    const longCid = 'ipfs://Qm' + '1'.repeat(200); // A very long CID
    const holder = ctx.holder.address;

    // Generate document ID with the long CID
    const documentId = await ctx.docuVault.generateDocumentId(contentHash, holder, longCid);

    // Verify with the same long CID should pass
    const result = await ctx.docuVault.verifyCid(contentHash, holder, longCid, documentId);
    expect(result).to.be.true;
  });
});
