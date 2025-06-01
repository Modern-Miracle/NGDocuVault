// import { expect } from 'chai';
// import { ethers } from 'hardhat';
// import { setupHashVerifierTest, HashVerifierTestContext } from './hashVerifierTestHelpers';

// describe('HashVerifier', function () {
//   let context: HashVerifierTestContext;
//   let mockZoKratesVerifier: any;

//   beforeEach(async function () {
//     context = await setupHashVerifierTest();
//     mockZoKratesVerifier = await ethers.getContractAt('MockZoKratesVerifier', context.mockVerifierAddress);
//   });

//   describe('Constructor', function () {
//     it('should set the verifier address correctly', async function () {
//       // Deploy a new HashVerifier to test constructor
//       const hashVerifierFactory = await ethers.getContractFactory('HashVerifier');
//       const newHashVerifier = await hashVerifierFactory.deploy(context.mockVerifierAddress);

//       // We can't directly check the private verifierAddress, but we can test functionality
//       const result = await newHashVerifier.verify(
//         context.mockProof.a,
//         context.mockProof.b,
//         context.mockProof.c,
//         context.mockProof.input
//       );

//       // The mock verifier returns true by default
//       expect(result).to.be.true;
//     });

//     it('should revert if initialized with zero address', async function () {
//       const hashVerifierFactory = await ethers.getContractFactory('HashVerifier');
//       await expect(hashVerifierFactory.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
//         hashVerifierFactory,
//         'HashVerifier__InvalidVerifierAddress'
//       );
//     });
//   });

//   describe('verify', function () {
//     it('should pass verification when the underlying verifier returns true', async function () {
//       await mockZoKratesVerifier.setShouldVerificationPass(true);

//       const result = await context.hashVerifier.verify(
//         context.mockProof.a,
//         context.mockProof.b,
//         context.mockProof.c,
//         context.mockProof.input
//       );

//       expect(result).to.be.true;
//     });

//     it('should fail verification when the underlying verifier returns false', async function () {
//       await mockZoKratesVerifier.setShouldVerificationPass(false);

//       const result = await context.hashVerifier.verify(
//         context.mockProof.a,
//         context.mockProof.b,
//         context.mockProof.c,
//         context.mockProof.input
//       );

//       expect(result).to.be.false;
//     });

//     it('should revert when input length is not 2', async function () {
//       const invalidInput = [BigInt(1)]; // Only 1 element

//       await expect(
//         context.hashVerifier.verify(context.mockProof.a, context.mockProof.b, context.mockProof.c, invalidInput)
//       ).to.be.revertedWithCustomError(context.hashVerifier, 'HashVerifier__InvalidInputLength');
//     });

//     it('should revert when verification call fails', async function () {
//       // Deploy a broken verifier that will cause the call to fail
//       const brokenVerifierFactory = await ethers.getContractFactory('BrokenVerifier');
//       const brokenVerifier = await brokenVerifierFactory.deploy();

//       // Deploy HashVerifier with the broken verifier
//       const hashVerifierFactory = await ethers.getContractFactory('HashVerifier');
//       const hashVerifier = await hashVerifierFactory.deploy(await brokenVerifier.getAddress());

//       // Try to verify, which should revert
//       await expect(
//         hashVerifier.verify(context.mockProof.a, context.mockProof.b, context.mockProof.c, context.mockProof.input)
//       ).to.be.revertedWithCustomError(hashVerifier, 'HashVerifier__VerificationCallFailed');
//     });
//   });

//   describe('verifyHash', function () {
//     it('should emit HashVerified event with correct parameters when verification passes', async function () {
//       await mockZoKratesVerifier.setShouldVerificationPass(true);

//       const expectedHash: [bigint, bigint] = [BigInt(9), BigInt(10)];

//       await expect(
//         context.hashVerifier.verifyHash(context.mockProof.a, context.mockProof.b, context.mockProof.c, expectedHash)
//       )
//         .to.emit(context.hashVerifier, 'HashVerified')
//         .withArgs(context.owner.address, expectedHash, true);
//     });

//     it('should emit HashVerified event with result=false when verification fails', async function () {
//       await mockZoKratesVerifier.setShouldVerificationPass(false);

//       const expectedHash: [bigint, bigint] = [BigInt(9), BigInt(10)];

//       await expect(
//         context.hashVerifier.verifyHash(context.mockProof.a, context.mockProof.b, context.mockProof.c, expectedHash)
//       )
//         .to.emit(context.hashVerifier, 'HashVerified')
//         .withArgs(context.owner.address, expectedHash, false);
//     });

//     it('should return the correct verification result', async function () {
//       await mockZoKratesVerifier.setShouldVerificationPass(true);

//       const expectedHash: [bigint, bigint] = [BigInt(9), BigInt(10)];

//       const result = await context.hashVerifier.verifyHash.staticCall(
//         context.mockProof.a,
//         context.mockProof.b,
//         context.mockProof.c,
//         expectedHash
//       );

//       expect(result).to.be.true;

//       await mockZoKratesVerifier.setShouldVerificationPass(false);

//       const result2 = await context.hashVerifier.verifyHash.staticCall(
//         context.mockProof.a,
//         context.mockProof.b,
//         context.mockProof.c,
//         expectedHash
//       );

//       expect(result2).to.be.false;
//     });
//   });
// });
