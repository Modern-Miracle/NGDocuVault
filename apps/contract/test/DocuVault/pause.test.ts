import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, DocumentType } from '../common';
import * as CONSTANTS from '../constants';
import * as docUtils from '../documentUtils';

describe('DocuVault - Pause Functionality', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  // Add afterEach hook to ensure clean state between tests
  afterEach(async function () {
    // Clean up any paused state that might affect other tests
    if (await ctx.docuVault.paused()) {
      await ctx.docuVault.connect(ctx.admin).unpause();
    }
  });

  describe('pause', function () {
    it('should pause the contract when called by admin', async function () {
      // Check contract is not paused initially
      expect(await ctx.docuVault.paused()).to.be.false;

      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Verify contract is now paused
      expect(await ctx.docuVault.paused()).to.be.true;
    });

    it('should revert when non-admin tries to pause', async function () {
      // Attempt to pause as non-admin
      await expect(ctx.docuVault.connect(ctx.unauthorized).pause()).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__NotAdmin'
      );
    });

    it('should revert when already paused', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Attempt to pause again
      await expect(ctx.docuVault.connect(ctx.admin).pause()).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );
    });
  });

  describe('unpause', function () {
    beforeEach(async function () {
      // Pause the contract before each test
      await ctx.docuVault.connect(ctx.admin).pause();
      expect(await ctx.docuVault.paused()).to.be.true;
    });

    it('should unpause the contract when called by admin', async function () {
      // Unpause the contract
      await ctx.docuVault.connect(ctx.admin).unpause();

      // Verify contract is now unpaused
      expect(await ctx.docuVault.paused()).to.be.false;
    });

    it('should revert when non-admin tries to unpause', async function () {
      // Attempt to unpause as non-admin
      await expect(ctx.docuVault.connect(ctx.unauthorized).unpause()).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__NotAdmin'
      );
    });

    it('should revert when already unpaused', async function () {
      // Unpause the contract
      await ctx.docuVault.connect(ctx.admin).unpause();

      // Attempt to unpause again
      await expect(ctx.docuVault.connect(ctx.admin).unpause()).to.be.revertedWithCustomError(
        ctx.docuVault,
        'ExpectedPause'
      );
    });
  });

  describe('Restricted functions when paused', function () {
    beforeEach(async function () {
      // Pause the contract before each test
      await ctx.docuVault.connect(ctx.admin).pause();
    });

    it('should prevent registerDocument when paused', async function () {
      const contentHash = CONSTANTS.computeContentHash('paused test document');
      const cid = 'ipfs://QmPausedDoc';
      const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

      await expect(
        ctx.docuVault
          .connect(ctx.issuer)
          .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'EnforcedPause');
    });

    it('should prevent registerDocuments (batch) when paused', async function () {
      const contentHashes = [CONSTANTS.computeContentHash('batch doc 1'), CONSTANTS.computeContentHash('batch doc 2')];
      const cids = ['ipfs://QmBatchPaused1', 'ipfs://QmBatchPaused2'];
      const holders = [ctx.holder.address, ctx.holder.address];
      const issuanceDates = [0, 0];
      const expirationDates = [
        await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR),
        await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR),
      ];
      const documentTypes = [DocumentType.GENERIC, DocumentType.GENERIC];

      await expect(
        ctx.docuVault
          .connect(ctx.issuer)
          .registerDocuments(contentHashes, cids, holders, issuanceDates, expirationDates, documentTypes)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'EnforcedPause');
    });

    it('should prevent verifyDocument when paused', async function () {
      // Create a document before pausing
      await ctx.docuVault.connect(ctx.admin).unpause();
      const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD', ctx.holder.address);
      await ctx.docuVault.connect(ctx.admin).pause();

      // Try to verify the document
      await expect(ctx.docuVault.connect(ctx.issuer).verifyDocument(documentId)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );
    });

    it('should prevent verifyDocuments (batch) when paused', async function () {
      // Create documents before pausing
      await ctx.docuVault.connect(ctx.admin).unpause();
      const documentIds = await docUtils.createBatchDocuments(ctx, 2);
      await ctx.docuVault.connect(ctx.admin).pause();

      // Try to batch verify the documents
      await expect(ctx.docuVault.connect(ctx.issuer).verifyDocuments(documentIds)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );
    });

    it('should prevent registerIssuer when paused', async function () {
      await expect(ctx.docuVault.connect(ctx.admin).registerIssuer(ctx.pfa.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );
    });

    it('should prevent addAdmin when paused', async function () {
      await expect(ctx.docuVault.connect(ctx.admin).addAdmin(ctx.pfa.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );
    });

    it('should prevent removeAdmin when paused', async function () {
      await expect(ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.admin.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );
    });

    it('should prevent updateDocument when paused', async function () {
      // Create a document before pausing
      await ctx.docuVault.connect(ctx.admin).unpause();
      const oldDocumentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');
      await ctx.docuVault.connect(ctx.admin).pause();

      // Try to update the document
      const contentHash = CONSTANTS.computeContentHash('updated test document');
      const cid = 'ipfs://QmUpdatedDoc';
      const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

      await expect(
        ctx.docuVault
          .connect(ctx.issuer)
          .updateDocument(oldDocumentId, contentHash, cid, expirationDate, DocumentType.GENERIC)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'EnforcedPause');
    });
  });

  describe('Allowed functions when paused', function () {
    beforeEach(async function () {
      // Pause the contract before each test
      await ctx.docuVault.connect(ctx.admin).pause();
    });

    it('should allow deactivateIssuer when paused', async function () {
      const isActiveBefore = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isActiveBefore).to.be.true;

      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);

      const isActiveAfter = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isActiveAfter).to.be.false;
    });

    it('should allow activateIssuer when paused', async function () {
      // First deactivate an issuer
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);

      // Check it was deactivated
      const isActiveBefore = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isActiveBefore).to.be.false;

      // Now activate it again while paused
      await ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.issuer.address);

      // Check it was activated
      const isActiveAfter = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isActiveAfter).to.be.true;
    });

    it('should allow view functions when paused', async function () {
      // Create a document before pausing
      await ctx.docuVault.connect(ctx.admin).unpause();
      const documentId = await docUtils.createScenarioDocument(ctx, 'STANDARD');
      await ctx.docuVault.connect(ctx.admin).pause();

      // Check that view functions still work
      const isIssuerActive = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuerActive).to.be.true;

      const info = await ctx.getDocumentInfo(documentId);
      expect(info.issuer).to.equal(ctx.issuer.address);

      const holderDocs = await ctx.docuVault.getDocuments(ctx.holder.address);
      expect(holderDocs).to.include(documentId);

      const isExpired = await ctx.docuVault.isDocumentExpired(documentId);
      expect(isExpired).to.be.false;
    });
  });

  describe('DEFAULT_ADMIN_ROLE pause/unpause', function () {
    it('should allow DEFAULT_ADMIN_ROLE to pause', async function () {
      // Confirm owner has DEFAULT_ADMIN_ROLE
      const hasDefaultAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.DEFAULT_ADMIN_ROLE, ctx.owner.address);
      expect(hasDefaultAdminRole).to.be.true;

      // Pause as DEFAULT_ADMIN_ROLE
      await ctx.docuVault.connect(ctx.owner).pause();

      // Verify contract is paused
      expect(await ctx.docuVault.paused()).to.be.true;
    });

    it('should allow DEFAULT_ADMIN_ROLE to unpause', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Unpause as DEFAULT_ADMIN_ROLE
      await ctx.docuVault.connect(ctx.owner).unpause();

      // Verify contract is unpaused
      expect(await ctx.docuVault.paused()).to.be.false;
    });
  });

  describe('Re-enabling functions after unpause', function () {
    it('should allow operations again after unpausing', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Verify paused
      expect(await ctx.docuVault.paused()).to.be.true;

      // Unpause the contract
      await ctx.docuVault.connect(ctx.admin).unpause();

      // Verify unpaused
      expect(await ctx.docuVault.paused()).to.be.false;

      // Test operations are working again

      // Register issuer
      await ctx.registerIssuer(ctx.pfa.address);
      expect(await ctx.docuVault.isIssuerActive(ctx.pfa.address)).to.be.true;

      // Register document
      const contentHash = CONSTANTS.computeContentHash('post-pause document');
      const cid = 'ipfs://QmPostPauseDoc';
      const expirationDate = await CONSTANTS.getExpirationDate(CONSTANTS.SECONDS_PER_YEAR);

      const tx = await ctx.docuVault
        .connect(ctx.issuer)
        .registerDocument(contentHash, cid, ctx.holder.address, 0, expirationDate, DocumentType.GENERIC);

      const receipt = await tx.wait();
      const event = receipt?.logs.find(
        (log) => ctx.docuVault.interface.parseLog(log as any)?.name === 'DocumentRegistered'
      );
      const parsedEvent = ctx.docuVault.interface.parseLog(event as any);
      const documentId = parsedEvent?.args.documentId;

      // Verify document exists
      const info = await ctx.getDocumentInfo(documentId);
      expect(info.issuer).to.equal(ctx.issuer.address);
    });
  });
});
