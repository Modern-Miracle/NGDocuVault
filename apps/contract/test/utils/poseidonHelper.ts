/**
 * Poseidon hash helper functions for testing
 * This file provides utilities to calculate Poseidon hash in JavaScript
 * that matches the implementation in the ZK circuits
 */

import { buildPoseidon } from 'circomlibjs';

let poseidonInstance: any = null;

/**
 * Initialize the Poseidon hasher
 * This is async and needs to be called before using the hash functions
 */
export async function initPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

/**
 * Calculate Poseidon hash of an array of 4 inputs, exactly matching the circuit implementation
 * @param values Array of exactly 4 values to hash (numbers or BigInts)
 * @returns Poseidon hash as BigInt
 */
export async function calculatePoseidonHash(values: (number | bigint)[]): Promise<bigint> {
  // Ensure we have exactly 4 inputs to match the circuit
  if (values.length !== 4) {
    throw new Error(`Poseidon hash requires exactly 4 inputs to match the circuit, got ${values.length}`);
  }

  // Ensure no zero values as the circuit validates this
  for (let i = 0; i < values.length; i++) {
    if (parseInt(values[i].toString()) === 0) {
      throw new Error(`Input at index ${i} is zero, but the circuit requires all inputs to be non-zero`);
    }
  }

  const poseidon = await initPoseidon();

  // Convert input values to field elements
  const fieldElements = values.map((val) => poseidon.F.e(val.toString()));

  // Calculate the hash
  const hash = poseidon(fieldElements);

  // Convert to BigInt for easier handling
  return BigInt(poseidon.F.toString(hash));
}

/**
 * Split a BigInt hash into low and high parts for circuit input
 * @param hash BigInt hash to split
 * @returns [low, high] representation suitable for circuit input
 */
export function splitHashForCircuit(hash: bigint): [bigint, bigint] {
  // For simplicity, we'll just use the hash as the low part and 0 as high
  return [hash, 0n];
}

/**
 * Generate consistent test data with matching hash
 * @returns Object with data array and dynamically calculated hash
 */
export async function generateConsistentHashData() {
  // Use non-zero values that match the circuit's requirements
  const data = [123456n, 654321n, 111111n, 999999n];

  // Calculate the actual Poseidon hash for this data
  const hash = await calculatePoseidonHash(data);
  const [hashLow, hashHigh] = splitHashForCircuit(hash);

  return {
    data,
    expectedHash: [hashLow, hashHigh],
  };
}
