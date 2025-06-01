// import { ethers } from 'hardhat';
// import { HashVerifier } from '../../typechain-types';
// import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

// export interface HashVerifierTestContext {
//   // Signers
//   owner: HardhatEthersSigner;
//   user1: HardhatEthersSigner;
//   user2: HardhatEthersSigner;

//   // Contract
//   hashVerifier: HashVerifier;
//   mockVerifierAddress: string;

//   // Mock proof data
//   mockProof: {
//     a: [bigint, bigint];
//     b: [[bigint, bigint], [bigint, bigint]];
//     c: [bigint, bigint];
//     input: bigint[];
//   };
// }

// /**
//  * Setup function for HashVerifier tests
//  */
// export async function setupHashVerifierTest(): Promise<HashVerifierTestContext> {
//   // Get signers
//   const [owner, user1, user2] = await ethers.getSigners();

//   // First, deploy a mock verifier contract that will be used by HashVerifier
//   const mockVerifierFactory = await ethers.getContractFactory('MockZoKratesVerifier');
//   const mockVerifier = await mockVerifierFactory.deploy();
//   const mockVerifierAddress = await mockVerifier.getAddress();

//   // Deploy HashVerifier with the mock verifier address
//   const hashVerifierFactory = await ethers.getContractFactory('HashVerifier');
//   const hashVerifier = await hashVerifierFactory.deploy(mockVerifierAddress);

//   // Create mock proof data
//   const mockProof = {
//     a: [BigInt(1), BigInt(2)] as [bigint, bigint],
//     b: [
//       [BigInt(3), BigInt(4)],
//       [BigInt(5), BigInt(6)],
//     ] as [[bigint, bigint], [bigint, bigint]],
//     c: [BigInt(7), BigInt(8)] as [bigint, bigint],
//     input: [BigInt(9), BigInt(10)],
//   };

//   return {
//     owner,
//     user1,
//     user2,
//     hashVerifier,
//     mockVerifierAddress,
//     mockProof,
//   };
// }
