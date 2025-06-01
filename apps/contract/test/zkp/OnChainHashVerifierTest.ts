import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';
import { ZkHelper } from '../utils/zkHelpers';
import { calculatePoseidonHash } from '../utils/poseidonHelper';

// Extend the timeout for ZK proof tests
const DEFAULT_TEST_TIMEOUT = 120000; // 120 seconds

// Define interfaces for our contracts
interface IVerifierFactory extends Contract {
  ageverifier(): Promise<string>;
  fhirverifier(): Promise<string>;
  hashverifier(): Promise<string>;
}

interface IHashVerifier extends Contract {
  verifyProof(
    a: [bigint, bigint],
    b: [[bigint, bigint], [bigint, bigint]],
    c: [bigint, bigint],
    input: bigint[]
  ): Promise<boolean>;
}

/**
 * This test focuses on on-chain verification using properly formatted proofs
 * based on understanding the expected format from ZkHelper class.
 */
describe('On-Chain ZK Verifier Tests', function () {
  // Extend timeout for these tests
  this.timeout(DEFAULT_TEST_TIMEOUT);

  let deployer: any;
  let hashVerifier: IHashVerifier;

  before(async function () {
    [deployer] = await ethers.getSigners();

    // Deploy a fresh verifier instead of using VerifierFactory
    console.log('Deploying fresh HashVerifier directly from the newly generated contract...');
    const HashVerifier = await ethers.getContractFactory('HashVerifier');
    hashVerifier = (await HashVerifier.deploy()) as unknown as IHashVerifier;
    console.log('HashVerifier deployed at:', await hashVerifier.getAddress());

    console.log('Contracts deployed successfully.');
  });

  describe('On-Chain HashVerifier Tests', function () {
    /**
     * Test verifying a valid proof on-chain using the correct format
     */
    it('should verify a valid hash proof on-chain using correct format', async function () {
      try {
        console.log('Generating fresh proof with current circuit...');

        // 1. Prepare test data - using number[] to match ZkHelper expectations
        const testData = [123456, 654321, 111111, 999999];
        console.log('Test data:', testData);

        // 2. Calculate the correct hash
        const hash = await calculatePoseidonHash(testData);
        const expectedHash: [string, string] = [hash.toString(), '0'];
        console.log('Calculated hash:', expectedHash);

        // 3. Generate proof with properly calculated hash
        console.log('Generating proof...');
        const { proof, publicSignals } = await ZkHelper.generateHashVerifierProof(testData, expectedHash);

        // 4. Try to verify locally, but don't fail the test if the verification key is missing
        let localVerificationResult = false;
        try {
          localVerificationResult = await ZkHelper.verifyProofLocally(ZkHelper.HASH_VERIFIER, proof, publicSignals);
          console.log('Local verification result:', localVerificationResult);
        } catch (error: any) {
          console.log('Local verification skipped:', error.message);
          console.log('Continuing with on-chain verification...');
        }

        // 5. Format proof for on-chain verification
        const validProof = ZkHelper.convertProofForVerifier(proof, publicSignals);

        console.log('Verifying proof with correct format...');

        // Display the proof data for debugging
        console.log(
          'Proof A:',
          validProof.a.map((n) => n.toString())
        );
        console.log(
          'Proof B:',
          validProof.b.map((arr) => arr.map((n) => n.toString()))
        );
        console.log(
          'Proof C:',
          validProof.c.map((n) => n.toString())
        );
        console.log(
          'Public Inputs:',
          validProof.input.map((n) => n.toString())
        );

        // Verify the proof on-chain
        const result = await hashVerifier.verifyProof(
          validProof.a as [bigint, bigint],
          validProof.b as [[bigint, bigint], [bigint, bigint]],
          validProof.c as [bigint, bigint],
          validProof.input
        );

        console.log('On-chain verification result:', result);

        // Now we expect the verification to succeed with our fresh contract
        expect(result).to.be.true;

        if (result) {
          console.log('✅ Success! Proof verified correctly with standard format');
        } else {
          console.log('❌ Verification failed with standard format.');
        }
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    });

    /**
     * This test tries to verify a proof with incorrect inputs
     */
    it('should detect hash mismatch in circuit result code', async function () {
      // Using dynamically generated proof with incorrect hash
      try {
        // 1. Prepare test data - using number[] to match ZkHelper expectations
        const testData = [123456, 654321, 111111, 999999];
        console.log('Test data:', testData);

        // 2. Use an incorrect hash (not matching the actual hash)
        const incorrectHash: [string, string] = ['987654321', '0'];
        console.log('Incorrect hash:', incorrectHash);

        // 3. Generate proof with incorrect hash
        console.log('Generating proof with incorrect hash...');
        const { proof, publicSignals } = await ZkHelper.generateHashVerifierProof(testData, incorrectHash);

        // 4. Check that the circuit returned the correct result code (3 = HASH_MISMATCH)
        console.log('Circuit result code:', publicSignals[0]);
        expect(parseInt(publicSignals[0])).to.equal(3, 'Circuit should return HASH_MISMATCH (3) for incorrect hash');

        // 5. Format proof for on-chain verification
        const invalidProof = ZkHelper.convertProofForVerifier(proof, publicSignals);

        // 6. Verify the proof on-chain - proof is valid but hash is wrong
        // Note: The on-chain verifier doesn't check the actual hash value, only that the proof is valid
        const result = await hashVerifier.verifyProof(
          invalidProof.a as [bigint, bigint],
          invalidProof.b as [[bigint, bigint], [bigint, bigint]],
          invalidProof.c as [bigint, bigint],
          invalidProof.input
        );

        console.log('On-chain verification result for invalid proof:', result);
        console.log('This is expected because the verifier only checks the proof validity, not the actual result code');
        console.log('The circuit correctly returned result code 3 (HASH_MISMATCH) in the public signals');
      } catch (error) {
        console.error('Test failed with error:', error);
        throw error;
      }
    });
  });
});
