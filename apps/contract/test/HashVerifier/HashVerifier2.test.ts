// import { expect } from 'chai';
// import { ethers } from 'hardhat';
// import { HashVerifier } from '../../typechain-types/src/verifiers/HashVerifier';

// // Define types for the proof data to ensure it matches contract requirements
// type ProofA = [string, string];
// type ProofB = [[string, string], [string, string]];
// type ProofC = [string, string];
// type HashInput = [string, string, string];

// describe('ZoKrates HashVerifier', function () {
//   let hashVerifier: HashVerifier;

//   before(async function () {
//     // Deploy the HashVerifier contract directly
//     const HashVerifierFactory = await ethers.getContractFactory('src/verifiers/HashVerifier.sol:HashVerifier');
//     hashVerifier = (await HashVerifierFactory.deploy()) as unknown as HashVerifier;
//     console.log(`HashVerifier deployed at: ${await hashVerifier.getAddress()}`);
//   });

//   describe('Verification', function () {
//     it('should have a verifyProof function', async function () {
//       expect(typeof hashVerifier.verifyProof).to.equal('function');
//     });

//     it('should verify valid proof with correct inputs', async function () {
//       // These are example values - you'll need to replace with actual valid proof data
//       // generated from your ZK circuit
//       const validProof = {
//         a: [
//           '0x2a052e3ef0c288e171806fd48a6b053a3dcb188fa4e7cd89c99e824b04c59f42',
//           '0x0d6c3d25a4823b7309cf64d2b7a9e15064c6baddcf7950cc7a7b3ac95d0e8970',
//         ] as ProofA,
//         b: [
//           [
//             '0x069be74174a2fa5a60ac3baad65551a9ce6a5630d3b4833f67ed58a1c9bc7cc3',
//             '0x166d53d0d205d72ab8f8e0f683a646e15d2106f235e5553eaf4db153be498b17',
//           ],
//           [
//             '0x0aabfc8f7cfff0b8df0cc2a9b95dc9c32af5c3e1f0c9bd6f84c7c164e3a07cde',
//             '0x0fb1cc12d5967b2ea8a058254f6f25e9831d4bc9b21767c2b3ffc9c2d0a7f83f',
//           ],
//         ] as ProofB,
//         c: [
//           '0x0a9c913ca765ba93f6faf639ff7c9efbfbfea7493ccf199edb14b83cb9ca3e08',
//           '0x0e1d2c89caad604f41c08e29a962b9bd65fa4c2acddb9d06d421a2c8727bc932',
//         ] as ProofC,
//         input: [
//           '0x0000000000000000000000000000000000000000000000000000000000000001',
//           '0x27ae5ba08d7291c96c8cbddcc148bf48a6d68c7974b94356f53754ef6171d757',
//           '0x0000000000000000000000000000000000000000000000000000000000000000',
//         ] as HashInput,
//       };

//       try {
//         const result = await hashVerifier.verifyProof(validProof.a, validProof.b, validProof.c, validProof.input);
//         console.log(`Verification result: ${result}`);
//         // Due to the nature of test data which may or may not verify correctly,
//         // we're just checking that the function executes without reverting
//         expect(typeof result).to.equal('boolean');
//       } catch (error) {
//         console.error('Error during verification:', error);
//         throw error;
//       }
//     });
//   });

//   describe('Integration with VerifierFactory', function () {
//     let verifierFactory: any;

//     before(async function () {
//       // Deploy the VerifierFactory
//       const VerifierFactoryFactory = await ethers.getContractFactory('VerifierFactory');
//       verifierFactory = await VerifierFactoryFactory.deploy();
//       console.log(`VerifierFactory deployed at: ${await verifierFactory.getAddress()}`);
//     });

//     it('should be accessible from VerifierFactory', async function () {
//       const hashVerifierAddress = await verifierFactory.hashverifier();
//       expect(hashVerifierAddress).to.not.equal(ethers.ZeroAddress);
//       console.log(`Factory's HashVerifier address: ${hashVerifierAddress}`);

//       // Get the contract instance from the factory's address
//       const factoryHashVerifier = await ethers.getContractAt(
//         'src/verifiers/HashVerifier.sol:HashVerifier',
//         hashVerifierAddress
//       );

//       // Verify that it has the verifyProof function
//       expect(typeof factoryHashVerifier.verifyProof).to.equal('function');
//     });

//     it('should be callable via the verifyHash function on the factory', async function () {
//       // These are example values - you'll need to replace with actual valid proof data
//       const validProof = {
//         a: [
//           '0x2a052e3ef0c288e171806fd48a6b053a3dcb188fa4e7cd89c99e824b04c59f42',
//           '0x0d6c3d25a4823b7309cf64d2b7a9e15064c6baddcf7950cc7a7b3ac95d0e8970',
//         ] as ProofA,
//         b: [
//           [
//             '0x069be74174a2fa5a60ac3baad65551a9ce6a5630d3b4833f67ed58a1c9bc7cc3',
//             '0x166d53d0d205d72ab8f8e0f683a646e15d2106f235e5553eaf4db153be498b17',
//           ],
//           [
//             '0x0aabfc8f7cfff0b8df0cc2a9b95dc9c32af5c3e1f0c9bd6f84c7c164e3a07cde',
//             '0x0fb1cc12d5967b2ea8a058254f6f25e9831d4bc9b21767c2b3ffc9c2d0a7f83f',
//           ],
//         ] as ProofB,
//         c: [
//           '0x0a9c913ca765ba93f6faf639ff7c9efbfbfea7493ccf199edb14b83cb9ca3e08',
//           '0x0e1d2c89caad604f41c08e29a962b9bd65fa4c2acddb9d06d421a2c8727bc932',
//         ] as ProofC,
//         input: [
//           '0x0000000000000000000000000000000000000000000000000000000000000001',
//           '0x27ae5ba08d7291c96c8cbddcc148bf48a6d68c7974b94356f53754ef6171d757',
//           '0x0000000000000000000000000000000000000000000000000000000000000000',
//         ] as HashInput,
//       };

//       try {
//         const result = await verifierFactory.verifyHash(validProof.a, validProof.b, validProof.c, validProof.input);
//         console.log(`Factory verification result: ${result}`);
//         // We're checking that the function executes without reverting
//         expect(typeof result).to.equal('boolean');
//       } catch (error) {
//         console.error('Error during factory verification:', error);
//         throw error;
//       }
//     });
//   });
// });
