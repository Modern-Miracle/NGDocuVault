import { expect } from 'chai';
import { setupDidVerifierTest, DidVerifierTestContext } from './didVerifierTestHelpers';
import { ethers } from 'hardhat';
import { EventLog } from 'ethers';

describe('DidVerifier', function () {
  let ctx: DidVerifierTestContext;

  beforeEach(async function () {
    ctx = await setupDidVerifierTest();
  });

  describe('Issuer Trust Management', function () {
    it('should set issuer trust status correctly', async function () {
      // Set issuer1 as trusted for CONSUMER_CREDENTIAL
      const tx = await ctx.didVerifier
        .connect(ctx.owner)
        .setIssuerTrustStatus(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, true);
      const receipt = await tx.wait();

      // Check event emission
      if (receipt) {
        const events = receipt.logs
          .filter((log): log is EventLog => 'fragment' in log)
          .filter((log) => log.fragment.name === 'IssuerTrustStatusUpdated');

        expect(events.length).to.equal(1);
        expect(events[0].args[0]).to.equal(ctx.CONSUMER_CREDENTIAL); // credentialType
        expect(events[0].args[1]).to.equal(ctx.issuer1.address); // issuer
        expect(events[0].args[2]).to.be.true; // trusted
      }

      // Verify trust status
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.true;

      // Set issuer1 as untrusted
      await ctx.didVerifier
        .connect(ctx.owner)
        .setIssuerTrustStatus(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, false);

      // Verify trust status updated
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.false;
    });

    it('should prevent setting zero address as trusted issuer', async function () {
      await expect(
        ctx.didVerifier.connect(ctx.owner).setIssuerTrustStatus(ctx.CONSUMER_CREDENTIAL, ethers.ZeroAddress, true)
      ).to.be.revertedWithCustomError(ctx.didVerifier, 'DidVerifier__InvalidIssuer');
    });

    it('should handle different credential types independently', async function () {
      // Set issuer1 as trusted for CONSUMER_CREDENTIAL
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer1, true);

      // Set issuer2 as trusted for PROVIDER_CREDENTIAL
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.PROVIDER_CREDENTIAL, ctx.issuer2, true);

      // Verify trust status for each combination
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.true;
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.PROVIDER_CREDENTIAL, ctx.issuer2.address)).to.be.true;

      // issuer1 should not be trusted for PROVIDER_CREDENTIAL
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.PROVIDER_CREDENTIAL, ctx.issuer1.address)).to.be.false;

      // issuer2 should not be trusted for CONSUMER_CREDENTIAL
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer2.address)).to.be.false;
    });

    it('should allow multiple trusted issuers for the same credential type', async function () {
      // Set issuer1 as trusted for CONSUMER_CREDENTIAL
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer1, true);

      // Set issuer2 as trusted for the same credential type
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer2, true);

      // Both issuers should be trusted for the credential type
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.true;
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer2.address)).to.be.true;
    });
  });

  describe('Credential Verification', function () {
    beforeEach(async function () {
      // Set issuer1 as trusted for CONSUMER_CREDENTIAL
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer1, true);

      // Set issuer2 as trusted for PROVIDER_CREDENTIAL
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.PROVIDER_CREDENTIAL, ctx.issuer2, true);
    });

    it('should verify credentials successfully for active subjects and trusted issuers', async function () {
      // Verify a credential with trusted issuer and active subject
      expect(await ctx.didVerifier.verifyCredential(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, ctx.user1Did)).to.be
        .true;
    });

    it('should reject verification for untrusted issuers', async function () {
      // issuer2 is not trusted for CONSUMER_CREDENTIAL
      await expect(
        ctx.didVerifier.verifyCredential(ctx.CONSUMER_CREDENTIAL, ctx.issuer2.address, ctx.user1Did)
      ).to.be.revertedWithCustomError(ctx.didVerifier, 'DidVerifier__UntrustedIssuer');
    });

    it('should reject verification for inactive subjects', async function () {
      // Deactivate user1's DID
      await ctx.deactivateDid(ctx.user1, ctx.user1Did);

      // Try to verify credential for inactive subject
      await expect(
        ctx.didVerifier.verifyCredential(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, ctx.user1Did)
      ).to.be.revertedWithCustomError(ctx.didVerifier, 'DidVerifier__InvalidCredential');
    });

    it('should verify credentials for reactivated subjects', async function () {
      // Deactivate user1's DID
      await ctx.deactivateDid(ctx.user1, ctx.user1Did);

      // Try to verify credential for inactive subject should fail
      await expect(
        ctx.didVerifier.verifyCredential(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, ctx.user1Did)
      ).to.be.revertedWithCustomError(ctx.didVerifier, 'DidVerifier__InvalidCredential');

      // Reactivate user1's DID
      await ctx.reactivateDid(ctx.user1, ctx.user1Did);

      // Now verification should succeed
      expect(await ctx.didVerifier.verifyCredential(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, ctx.user1Did)).to.be
        .true;
    });
  });

  describe('Edge Cases', function () {
    it('should handle empty credential types correctly', async function () {
      // Set issuer1 as trusted for an empty credential type
      await ctx.didVerifier.connect(ctx.owner).setIssuerTrustStatus('', ctx.issuer1.address, true);

      // Verify empty credential type
      expect(await ctx.didVerifier.isIssuerTrusted('', ctx.issuer1.address)).to.be.true;

      // Verification should succeed with empty credential type
      expect(await ctx.didVerifier.verifyCredential('', ctx.issuer1.address, ctx.user1Did)).to.be.true;
    });

    it('should handle non-existent DIDs correctly', async function () {
      const nonExistentDid = 'did:example:nonexistent';

      // Try to verify with non-existent subject
      await expect(ctx.didVerifier.verifyCredential(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address, nonExistentDid)).to.be
        .reverted; // Just check it reverts, not the specific error
    });

    it('should handle multiple trust status changes correctly', async function () {
      // Set issuer1 as trusted
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer1, true);
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.true;

      // Set issuer1 as untrusted
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer1, false);
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.false;

      // Set issuer1 as trusted again
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.CONSUMER_CREDENTIAL, ctx.issuer1, true);
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.CONSUMER_CREDENTIAL, ctx.issuer1.address)).to.be.true;
    });

    it('should handle verification after trust status changes', async function () {
      // Initially issuer1 is not trusted for ADMIN_CREDENTIAL
      expect(await ctx.didVerifier.isIssuerTrusted(ctx.ADMIN_CREDENTIAL, ctx.issuer1.address)).to.be.false;

      // Verification should fail
      await expect(
        ctx.didVerifier.verifyCredential(ctx.ADMIN_CREDENTIAL, ctx.issuer1.address, ctx.user1Did)
      ).to.be.revertedWithCustomError(ctx.didVerifier, 'DidVerifier__UntrustedIssuer');

      // Set issuer1 as trusted for ADMIN_CREDENTIAL
      await ctx.setIssuerTrustStatus(ctx.owner, ctx.ADMIN_CREDENTIAL, ctx.issuer1, true);

      // Now verification should succeed
      expect(await ctx.didVerifier.verifyCredential(ctx.ADMIN_CREDENTIAL, ctx.issuer1.address, ctx.user1Did)).to.be
        .true;
    });
  });
});
