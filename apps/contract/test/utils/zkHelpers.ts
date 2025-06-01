import { ethers } from 'hardhat';
import * as snarkjs from 'snarkjs';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper class for ZK operations in tests
 */
export class ZkHelper {
  // Circuit types
  static readonly AGE_VERIFIER = 'ageverifier';
  static readonly FHIR_VERIFIER = 'fhirverifier';
  static readonly HASH_VERIFIER = 'hashverifier';

  // Paths for different circuit files
  private static getCircuitPaths(circuitType: string) {
    const baseDir = path.join(process.cwd(), 'circuits');
    const circuitDir = path.join(baseDir, 'out', circuitType.toLowerCase());

    // Handle capitalized verifier names in wasm files and zkey files
    const capitalizedType =
      circuitType.toLowerCase() === 'hashverifier'
        ? 'HashVerifier'
        : circuitType.toLowerCase() === 'ageverifier'
        ? 'AgeVerifier'
        : circuitType.toLowerCase() === 'fhirverifier'
        ? 'FhirVerifier'
        : circuitType;

    return {
      r1csPath: path.join(circuitDir, `${circuitType.toLowerCase()}.r1cs`),
      wasmPath: path.join(circuitDir, `${capitalizedType}_js/${capitalizedType}.wasm`),
      zkeyPath: path.join(circuitDir, `${capitalizedType}.zkey`),
      verificationKeyPath: path.join(circuitDir, `${circuitType.toLowerCase()}_verification_key.json`),
    };
  }

  /**
   * Generates a proof for the given circuit type and inputs
   */
  static async generateProof(circuitType: string, inputs: any): Promise<{ proof: any; publicSignals: any }> {
    const { wasmPath, zkeyPath } = this.getCircuitPaths(circuitType);

    console.log(`Generating proof for ${circuitType} with inputs:`, inputs);

    try {
      // Ensure the wasm file exists
      if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found at path: ${wasmPath}`);
      }
      console.log(`Using WASM file: ${wasmPath}`);

      // Ensure the zkey file exists
      if (!fs.existsSync(zkeyPath)) {
        // Fallback to the numbered zkey file if the main one doesn't exist
        const fallbackZkeyPath = path.join(path.dirname(zkeyPath), `${path.basename(zkeyPath, '.zkey')}_0001.zkey`);
        if (!fs.existsSync(fallbackZkeyPath)) {
          throw new Error(`zkey file not found at path: ${zkeyPath} or ${fallbackZkeyPath}`);
        }
        console.log(`Using zkey file: ${fallbackZkeyPath}`);
        return await snarkjs.groth16.fullProve(inputs, wasmPath, fallbackZkeyPath);
      }

      console.log(`Using zkey file: ${zkeyPath}`);

      // Generate the proof
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmPath, zkeyPath);

      console.log(`Generated proof:`, proof);
      console.log(`Public signals:`, publicSignals);

      return { proof, publicSignals };
    } catch (error) {
      console.error(`Error in proof generation process:`, error);
      throw error;
    }
  }

  /**
   * Converts a snarkjs proof to the format expected by the Solidity verifier
   *
   * BN254 curve G2 points in Solidity require special handling:
   * The points need to be swapped (X and Y coordinates) from how snarkjs outputs them
   */
  static convertProofForVerifier(
    proof: any,
    publicSignals: any
  ): {
    a: [bigint, bigint];
    b: [[bigint, bigint], [bigint, bigint]];
    c: [bigint, bigint];
    input: bigint[];
  } {
    // For Ethereum/Solidity verifiers with BN254 curve, we need to swap X and Y coordinates in G2 points
    return {
      a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as [bigint, bigint],
      // Swap X and Y coordinates for each point in B array
      b: [
        // Format: [a[1], a[0]] - swapping X/Y for Solidity
        [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
        [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
      ] as [[bigint, bigint], [bigint, bigint]],
      c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as [bigint, bigint],
      input: publicSignals.map((x: string) => BigInt(x)),
    };
  }

  /**
   * Verifies a proof locally using snarkjs
   */
  static async verifyProofLocally(circuitType: string, proof: any, publicSignals: any): Promise<boolean> {
    const { verificationKeyPath } = this.getCircuitPaths(circuitType);

    if (!fs.existsSync(verificationKeyPath)) {
      throw new Error(`Verification key not found at path: ${verificationKeyPath}`);
    }

    const verificationKey = JSON.parse(fs.readFileSync(verificationKeyPath, 'utf8'));
    return await snarkjs.groth16.verify(verificationKey, publicSignals, proof);
  }

  /**
   * Helper for generating age verifier proofs
   */
  static async generateAgeVerifierProof(
    birthDate: number,
    currentDate: number,
    threshold: number,
    verificationType: number
  ) {
    return this.generateProof(this.AGE_VERIFIER, {
      birthDate: birthDate.toString(),
      currentDate: currentDate.toString(),
      threshold: threshold.toString(),
      verificationType: verificationType.toString(),
    });
  }

  /**
   * Helper for generating FHIR verifier proofs
   */
  static async generateFhirVerifierProof(
    resourceData: number[],
    resourceType: number,
    expectedHash: [string, string],
    verificationMode: number
  ) {
    return this.generateProof(this.FHIR_VERIFIER, {
      resourceData: resourceData.map((x) => x.toString()),
      resourceType: resourceType.toString(),
      expectedHash,
      verificationMode: verificationMode.toString(),
    });
  }

  /**
   * Helper for generating hash verifier proofs
   */
  static async generateHashVerifierProof(data: number[], expectedHash: [string, string]) {
    return this.generateProof(this.HASH_VERIFIER, {
      data: data.map((x) => x.toString()),
      expectedHash,
    });
  }
}
