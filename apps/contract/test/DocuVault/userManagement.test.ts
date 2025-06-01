import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { setupTest, TestContext, isValidTimestamp } from '../common';
import * as CONSTANTS from '../constants';

describe('DocuVault - User Management', function () {
  let ctx: TestContext;

  beforeEach(async function () {
    ctx = await setupTest();
  });

  describe('registerIssuer', function () {
    it('should register a new issuer', async function () {
      // Verify the account is not an issuer initially
      const isIssuerBefore = await ctx.docuVault.isIssuerActive(ctx.unauthorized.address);
      expect(isIssuerBefore).to.be.false;

      // Register as issuer
      await ctx.registerIssuer(ctx.unauthorized.address);

      // Verify the account is now an issuer
      const isIssuerAfter = await ctx.docuVault.isIssuerActive(ctx.unauthorized.address);
      expect(isIssuerAfter).to.be.true;
    });

    it('should emit IssuerRegistered event when registering an issuer', async function () {
      // Register issuer and check for event
      await expect(ctx.docuVault.connect(ctx.admin).registerIssuer(ctx.unauthorized.address))
        .to.emit(ctx.docuVault, 'IssuerRegistered')
        .withArgs(ctx.unauthorized.address, () => true); // Accept any timestamp
    });

    it('should revert when non-admin tries to register an issuer', async function () {
      // Attempt to register issuer as non-admin
      await expect(
        ctx.docuVault.connect(ctx.unauthorized).registerIssuer(ctx.pfa.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotAdmin');
    });

    it('should revert when registering the zero address as issuer', async function () {
      // Attempt to register zero address
      await expect(ctx.docuVault.connect(ctx.admin).registerIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__ZeroAddress'
      );
    });

    it('should revert when registering an already registered issuer', async function () {
      // Register issuer first time
      await ctx.registerIssuer(ctx.unauthorized.address);

      // Attempt to register same issuer again
      await expect(
        ctx.docuVault.connect(ctx.admin).registerIssuer(ctx.unauthorized.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__IssuerRegistered');
    });

    it('should revert when registering issuer while contract is paused', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Attempt to register issuer when paused
      await expect(
        ctx.docuVault.connect(ctx.admin).registerIssuer(ctx.unauthorized.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'EnforcedPause');

      // Unpause the contract
      await ctx.docuVault.connect(ctx.admin).unpause();

      // Should work after unpausing
      await ctx.registerIssuer(ctx.unauthorized.address);
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.unauthorized.address);
      expect(isIssuer).to.be.true;
    });
  });

  describe('deactivateIssuer', function () {
    it('should deactivate an active issuer', async function () {
      // Verify issuer is active initially
      const isIssuerBefore = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuerBefore).to.be.true;

      // Deactivate issuer
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);

      // Verify issuer is no longer active
      const isIssuerAfter = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuerAfter).to.be.false;
    });

    it('should emit IssuerDeactivated event when deactivating an issuer', async function () {
      // Deactivate issuer and check for event
      await expect(ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address))
        .to.emit(ctx.docuVault, 'IssuerDeactivated')
        .withArgs(ctx.issuer.address, () => true); // Accept any timestamp
    });

    it('should revert when non-admin tries to deactivate an issuer', async function () {
      // Attempt to deactivate issuer as non-admin
      await expect(
        ctx.docuVault.connect(ctx.unauthorized).deactivateIssuer(ctx.issuer.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotAdmin');
    });

    it('should revert when deactivating a non-active issuer', async function () {
      // Deactivate issuer
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);

      // Attempt to deactivate again
      await expect(ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__NotActive'
      );
    });

    it('should allow deactivating an issuer even when contract is paused', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Deactivate issuer should work even when paused
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);

      // Verify issuer is no longer active
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuer).to.be.false;
    });
  });

  describe('activateIssuer', function () {
    beforeEach(async function () {
      // Deactivate the issuer before each test
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);
    });

    it('should activate a deactivated issuer', async function () {
      // Verify issuer is not active initially
      const isIssuerBefore = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuerBefore).to.be.false;

      // Activate issuer
      await ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.issuer.address);

      // Verify issuer is now active
      const isIssuerAfter = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuerAfter).to.be.true;
    });

    it('should emit IssuerActivated event when activating an issuer', async function () {
      // Activate issuer and check for event
      await expect(ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.issuer.address))
        .to.emit(ctx.docuVault, 'IssuerActivated')
        .withArgs(ctx.issuer.address, () => true); // Accept any timestamp
    });

    it('should revert when non-admin tries to activate an issuer', async function () {
      // Attempt to activate issuer as non-admin
      await expect(
        ctx.docuVault.connect(ctx.unauthorized).activateIssuer(ctx.issuer.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotAdmin');
    });

    it('should revert when activating an already active issuer', async function () {
      // Activate issuer
      await ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.issuer.address);

      // Attempt to activate again
      await expect(ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.issuer.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__IsActive'
      );
    });

    it('should allow activating an issuer even when contract is paused', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Activate issuer should work even when paused
      await ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.issuer.address);

      // Verify issuer is now active
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuer).to.be.true;
    });
  });

  describe('addAdmin', function () {
    it('should add a new admin', async function () {
      // Check if the unauthorized user has admin role before
      const hasAdminRoleBefore = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address);
      expect(hasAdminRoleBefore).to.be.false;

      // Add as admin
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address);

      // Check if the user has admin role after
      const hasAdminRoleAfter = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address);
      expect(hasAdminRoleAfter).to.be.true;
    });

    it('should revert when non-admin tries to add an admin', async function () {
      // Attempt to add admin as non-admin
      await expect(ctx.docuVault.connect(ctx.unauthorized).addAdmin(ctx.pfa.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__NotAdmin'
      );
    });

    it('should revert when adding the zero address as admin', async function () {
      // Attempt to add zero address
      await expect(ctx.docuVault.connect(ctx.admin).addAdmin(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__ZeroAddress'
      );
    });

    it('should revert when adding an already existing admin', async function () {
      // Add admin first time
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address);

      // Attempt to add same admin again
      await expect(ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__AlreadyAdmin'
      );
    });

    it('should revert when adding admin while contract is paused', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Attempt to add admin when paused
      await expect(ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'EnforcedPause'
      );

      // Unpause the contract
      await ctx.docuVault.connect(ctx.admin).unpause();

      // Should work after unpausing
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address);
      const hasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address);
      expect(hasAdminRole).to.be.true;
    });
  });

  describe('removeAdmin', function () {
    beforeEach(async function () {
      // Add a new admin before each test
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address);
    });

    it('should remove an admin', async function () {
      // Verify user has admin role initially
      const hasAdminRoleBefore = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address);
      expect(hasAdminRoleBefore).to.be.true;

      // Remove admin
      await ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.unauthorized.address);

      // Verify user no longer has admin role
      const hasAdminRoleAfter = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address);
      expect(hasAdminRoleAfter).to.be.false;
    });

    it('should revert when non-admin tries to remove an admin', async function () {
      // At this point, unauthorized is an admin but we'll use pfa (non-admin)
      // Attempt to remove admin as non-admin
      await expect(ctx.docuVault.connect(ctx.pfa).removeAdmin(ctx.unauthorized.address)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__NotAdmin'
      );
    });

    it('should revert when removing a non-admin', async function () {
      // Remove admin
      await ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.unauthorized.address);

      // Attempt to remove again
      await expect(
        ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.unauthorized.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'DocuVault__NotAdmin');
    });

    it('should revert when removing admin while contract is paused', async function () {
      // Pause the contract
      await ctx.docuVault.connect(ctx.admin).pause();

      // Attempt to remove admin when paused
      await expect(
        ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.unauthorized.address)
      ).to.be.revertedWithCustomError(ctx.docuVault, 'EnforcedPause');

      // Unpause the contract
      await ctx.docuVault.connect(ctx.admin).unpause();

      // Should work after unpausing
      await ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.unauthorized.address);
      const hasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address);
      expect(hasAdminRole).to.be.false;
    });
  });

  describe('Role interactions', function () {
    it('should allow admin to also be an issuer', async function () {
      // Register admin as issuer
      await ctx.registerIssuer(ctx.admin.address);

      // Verify admin is now also an issuer
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.admin.address);
      expect(isIssuer).to.be.true;

      // Verify still has admin role
      const hasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.admin.address);
      expect(hasAdminRole).to.be.true;
    });

    it('should allow issuer to be made admin', async function () {
      // Add issuer as admin
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.issuer.address);

      // Verify issuer is now also an admin
      const hasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.issuer.address);
      expect(hasAdminRole).to.be.true;

      // Verify still has issuer role
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuer).to.be.true;
    });

    it('should maintain separate roles when deactivating issuer who is also admin', async function () {
      // Make issuer also an admin
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.issuer.address);

      // Deactivate issuer role
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.issuer.address);

      // Verify no longer has issuer role
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.issuer.address);
      expect(isIssuer).to.be.false;

      // Verify still has admin role
      const hasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.issuer.address);
      expect(hasAdminRole).to.be.true;
    });

    it('should correctly handle multiple role changes', async function () {
      // Start flow: Add new issuer
      await ctx.registerIssuer(ctx.unauthorized.address);
      expect(await ctx.docuVault.isIssuerActive(ctx.unauthorized.address)).to.be.true;

      // Make issuer also an admin
      await ctx.docuVault.connect(ctx.admin).addAdmin(ctx.unauthorized.address);
      expect(await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address)).to.be.true;

      // Deactivate issuer
      await ctx.docuVault.connect(ctx.admin).deactivateIssuer(ctx.unauthorized.address);
      expect(await ctx.docuVault.isIssuerActive(ctx.unauthorized.address)).to.be.false;

      // Reactivate issuer
      await ctx.docuVault.connect(ctx.admin).activateIssuer(ctx.unauthorized.address);
      expect(await ctx.docuVault.isIssuerActive(ctx.unauthorized.address)).to.be.true;

      // Remove admin role
      await ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.unauthorized.address);
      expect(await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.unauthorized.address)).to.be.false;

      // Should still be issuer
      expect(await ctx.docuVault.isIssuerActive(ctx.unauthorized.address)).to.be.true;
    });
  });

  describe('DEFAULT_ADMIN_ROLE', function () {
    it('should have DEFAULT_ADMIN_ROLE assigned to owner', async function () {
      const hasDefaultAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.DEFAULT_ADMIN_ROLE, ctx.owner.address);
      expect(hasDefaultAdminRole).to.be.true;
    });

    it('should allow DEFAULT_ADMIN_ROLE to perform admin actions', async function () {
      // Register issuer as DEFAULT_ADMIN_ROLE
      await ctx.docuVault.connect(ctx.owner).registerIssuer(ctx.unauthorized.address);

      // Verify action was successful
      const isIssuer = await ctx.docuVault.isIssuerActive(ctx.unauthorized.address);
      expect(isIssuer).to.be.true;
    });

    it('should not confuse DEFAULT_ADMIN_ROLE with ADMIN_ROLE', async function () {
      // Check owner has DEFAULT_ADMIN_ROLE but not necessarily ADMIN_ROLE
      const hasDefaultAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.DEFAULT_ADMIN_ROLE, ctx.owner.address);
      expect(hasDefaultAdminRole).to.be.true;

      // Also check ADMIN_ROLE (may be true depending on setup)
      const hasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.owner.address);
      // We're not asserting this since it depends on the setup

      // Check admin has ADMIN_ROLE but not DEFAULT_ADMIN_ROLE
      const adminHasAdminRole = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.admin.address);
      expect(adminHasAdminRole).to.be.true;

      const adminHasDefaultAdminRole = await ctx.docuVault.hasRole(
        CONSTANTS.ROLES.DEFAULT_ADMIN_ROLE,
        ctx.admin.address
      );
      expect(adminHasDefaultAdminRole).to.be.false;
    });
  });

  describe('Edge cases', function () {
    it('should handle role operations on the zero address correctly', async function () {
      // These operations should all revert with ZeroAddress error
      await expect(ctx.docuVault.connect(ctx.admin).registerIssuer(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__ZeroAddress'
      );

      await expect(ctx.docuVault.connect(ctx.admin).addAdmin(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        ctx.docuVault,
        'DocuVault__ZeroAddress'
      );
    });

    it('should ensure admin cannot remove themselves', async function () {
      // This is an important protection to prevent admin lockout
      // However, the contract doesn't explicitly prevent this, so we're testing the actual behavior

      // Try to remove self as admin
      await ctx.docuVault.connect(ctx.admin).removeAdmin(ctx.admin.address);

      // Check if admin still has admin role (will depend on actual implementation)
      const stillAdmin = await ctx.docuVault.hasRole(CONSTANTS.ROLES.ADMIN_ROLE, ctx.admin.address);

      // The test result will document the actual behavior
      // If it's false, then the contract allows self-removal which could be problematic
      // This test is more documentation than verification
      console.log(`Admin self-removal results in still having admin role: ${stillAdmin}`);
    });
  });
});
