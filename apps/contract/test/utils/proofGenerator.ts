import path from 'path';
import { BigNumberish } from 'ethers';
import * as snarkjs from 'snarkjs';
import fs from 'fs';

// Add type definition for snarkjs functions that might be missing from its types
interface ExtendedGroth16 {
  fullProve: (input: any, wasmFile: string, zkeyFile: string) => Promise<{ proof: any; publicSignals: any }>;
  exportSolidityCallData: (proof: any, publicSignals: any) => Promise<string>;
}

/**
 * Generates ZK proofs for AgeVerifier, FhirVerifier, and HashVerifier
 *
 * @param circuitName Name of the circuit (age-verifier, fhir-verifier, hash-verifier)
 * @param inputs Input data according to circuit requirements
 * @returns Proof data formatted for contract verification
 */
export async function generateProof(
  circuitName: string,
  inputs: any
): Promise<{ a: BigNumberish[]; b: BigNumberish[][]; c: BigNumberish[]; input: BigNumberish[] }> {
  console.log(`Generating proof for ${circuitName} with inputs:`, inputs);

  try {
    // Find WASM file
    const wasmPath = await findCircuitFile(circuitName, 'wasm');
    if (!wasmPath) {
      console.error(`Could not find wasm file for circuit ${circuitName}`);
      throw new Error(`Could not find wasm file for circuit ${circuitName}`);
    }

    // Find zkey file (prefer _0001.zkey files)
    const zkeyPath = await findZkeyFile(circuitName);
    if (!zkeyPath) {
      console.error(`Could not find zkey file for circuit ${circuitName}`);
      throw new Error(`Could not find zkey file for circuit ${circuitName}`);
    }

    console.log(`Using WASM file: ${wasmPath}`);
    console.log(`Using zkey file: ${zkeyPath}`);

    // Use type assertion for snarkjs.groth16 to access the exportSolidityCallData method
    const groth16 = snarkjs.groth16 as unknown as ExtendedGroth16;

    // Generate a proof using snarkjs
    const { proof, publicSignals } = await groth16.fullProve(inputs, wasmPath, zkeyPath);

    console.log('Generated proof:', proof);
    console.log('Public signals:', publicSignals);

    // Format the proof for Solidity verification
    const rawCalldata = await groth16.exportSolidityCallData(proof, publicSignals);

    // Parse the calldata string
    const calldata = parseCalldata(rawCalldata);

    // Format the inputs based on the circuit type
    calldata.input = formatInputsForVerifier(circuitName, calldata.input);

    return calldata;
  } catch (error) {
    console.error('Error in proof generation process:', error);
    throw error;
  }
}

/**
 * Find a circuit file (wasm) using various path formats
 *
 * @param circuitName Name of the circuit
 * @param fileType Type of file to find ('wasm')
 * @returns Path to the file if found, null otherwise
 */
async function findCircuitFile(circuitName: string, fileType: 'wasm'): Promise<string | null> {
  // Format options for circuit names
  const circuitNameOptions = [
    circuitName, // e.g., 'ageverifier'
    circuitName.replace('-', ''), // e.g., 'ageverifier'
    circuitName.replace('-', '_'), // e.g., 'age_verifier'
  ];

  // Get properly capitalized circuit names
  const getCapitalizedName = (name: string): string => {
    const sanitizedName = name.replace('-', '').replace('_', '');
    if (sanitizedName === 'ageverifier') {
      return 'AgeVerifier';
    } else if (sanitizedName === 'fhirverifier') {
      return 'FhirVerifier';
    } else if (sanitizedName === 'hashverifier') {
      return 'HashVerifier';
    } else {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  const circuitBaseName = getCapitalizedName(circuitName);

  // Possible directory formats
  const directoryOptions = [
    // No dash, just the lowercase version
    `circuits/out/${circuitName.replace('-', '')}`,
    // Original format (with dash)
    `circuits/out/${circuitName}`,
    // Underscore instead of dash
    `circuits/out/${circuitName.replace('-', '_')}`,
  ];

  if (fileType === 'wasm') {
    // Possible wasm file paths with proper casing (use the properly cased name)
    for (const dirPath of directoryOptions) {
      const jsDir = path.join(process.cwd(), dirPath, `${circuitBaseName}_js`);
      if (fs.existsSync(jsDir)) {
        const wasmPath = path.join(jsDir, `${circuitBaseName}.wasm`);
        if (fs.existsSync(wasmPath)) {
          return wasmPath;
        }
      }
    }
  }

  return null;
}

/**
 * Find a zkey file using various path formats, prioritizing the _0001.zkey files
 *
 * @param circuitName Name of the circuit
 * @returns Path to the zkey file if found, null otherwise
 */
async function findZkeyFile(circuitName: string): Promise<string | null> {
  // Get the properly capitalized circuit name
  const getCapitalizedName = (name: string): string => {
    const sanitizedName = name.replace('-', '').replace('_', '');
    if (sanitizedName === 'ageverifier') {
      return 'AgeVerifier';
    } else if (sanitizedName === 'fhirverifier') {
      return 'FhirVerifier';
    } else if (sanitizedName === 'hashverifier') {
      return 'HashVerifier';
    } else {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  const circuitBaseName = getCapitalizedName(circuitName);

  // Prioritize _0001.zkey files in the circuit directory
  const circuitDir = path.join(process.cwd(), 'circuits/out', circuitName.replace('-', ''));
  if (fs.existsSync(circuitDir)) {
    // Check for _0001.zkey first (final zkey)
    const zkey0001Path = path.join(circuitDir, `${circuitBaseName}_0001.zkey`);
    if (fs.existsSync(zkey0001Path)) {
      return zkey0001Path;
    }

    // Fallback to _0000.zkey if needed
    const zkey0000Path = path.join(circuitDir, `${circuitBaseName}_0000.zkey`);
    if (fs.existsSync(zkey0000Path)) {
      return zkey0000Path;
    }
  }

  // Try alternative directory format
  const altCircuitDir = path.join(process.cwd(), 'circuits/out', circuitName);
  if (fs.existsSync(altCircuitDir)) {
    // Check for _0001.zkey
    const zkey0001Path = path.join(altCircuitDir, `${circuitBaseName}_0001.zkey`);
    if (fs.existsSync(zkey0001Path)) {
      return zkey0001Path;
    }

    // Fallback to _0000.zkey
    const zkey0000Path = path.join(altCircuitDir, `${circuitBaseName}_0000.zkey`);
    if (fs.existsSync(zkey0000Path)) {
      return zkey0000Path;
    }
  }

  return null;
}

/**
 * Formats the input arrays to match the expected format for each verifier
 *
 * @param circuitName Name of the circuit
 * @param inputs The proof inputs
 * @returns Formatted inputs that match the contract's expected type
 */
function formatInputsForVerifier(circuitName: string, inputs: BigNumberish[]): BigNumberish[] {
  // Each verifier expects a specific number of inputs
  if (circuitName === 'age-verifier') {
    // AgeVerifier needs exactly 4 inputs: [verificationType, currentDate, threshold, result]
    if (inputs.length < 4) {
      console.warn(`AgeVerifier expects 4 inputs, padding array from ${inputs.length} elements`);
      return padArray(inputs, 4);
    }
    return inputs.slice(0, 4); // Ensure we don't exceed 4 inputs
  } else if (circuitName === 'fhir-verifier') {
    // FhirVerifier needs 21 inputs to match the contract's expected format
    // This is from the verifyProof function in FhirVerifier.sol
    if (inputs.length < 21) {
      console.warn(`FhirVerifier expects 21 inputs, padding array from ${inputs.length} elements`);
      return padArray(inputs, 21);
    }
    return inputs.slice(0, 21); // Ensure we don't exceed 21 inputs
  } else if (circuitName === 'hash-verifier') {
    // HashVerifier needs exactly 3 inputs: [expectedHash[0], expectedHash[1], result]
    if (inputs.length < 3) {
      console.warn(`HashVerifier expects 3 inputs, padding array from ${inputs.length} elements`);
      return padArray(inputs, 3);
    }
    return inputs.slice(0, 3); // Ensure we don't exceed 3 inputs
  }
  return inputs; // Default case
}

/**
 * Pads an array to a specific length with zeros
 *
 * @param arr Array to pad
 * @param length Desired length
 * @returns Padded array
 */
function padArray(arr: BigNumberish[], length: number): BigNumberish[] {
  if (arr.length >= length) return arr;

  const result = [...arr];
  while (result.length < length) {
    result.push('0');
  }
  return result;
}

/**
 * Formats proof data for AgeVerifier
 *
 * @param birthDate Unix timestamp of birth date
 * @param currentDate Unix timestamp of current date
 * @param threshold Age threshold in seconds (e.g., 18 years in seconds)
 * @param verificationType Type of verification (1: simple age, 2: birth date, 3: age bracket)
 * @returns Promise with formatted proof data for contract verification
 */
export async function generateAgeVerifierProof(
  birthDate: number,
  currentDate: number,
  threshold: number,
  verificationType: number
): Promise<{ a: BigNumberish[]; b: BigNumberish[][]; c: BigNumberish[]; input: BigNumberish[] }> {
  // Format inputs according to the AgeVerifier circuit
  const inputs = {
    birthDate: birthDate.toString(),
    currentDate: currentDate.toString(),
    threshold: threshold.toString(),
    verificationType: verificationType.toString(),
  };

  return await generateProof('ageverifier', inputs);
}

/**
 * Formats proof data for FhirVerifier
 *
 * @param resourceData Array of FHIR resource data values (8 items)
 * @param resourceType Type of FHIR resource
 * @param expectedHash Expected hash values [low, high]
 * @param verificationMode Verification mode (1: resource type, 2: hash, 3: fields, 4: complete)
 * @returns Promise with formatted proof data for contract verification
 */
export async function generateFhirVerifierProof(
  resourceData: number[],
  resourceType: number,
  expectedHash: [string, string],
  verificationMode: number
): Promise<{ a: BigNumberish[]; b: BigNumberish[][]; c: BigNumberish[]; input: BigNumberish[] }> {
  // Format inputs according to the FhirVerifier circuit
  const inputs = {
    resourceData: resourceData.map((val) => val.toString()),
    resourceType: resourceType.toString(),
    expectedHash: expectedHash,
    verificationMode: verificationMode.toString(),
  };

  return await generateProof('fhirverifier', inputs);
}

/**
 * Formats proof data for HashVerifier
 *
 * @param data Array of data items to hash
 * @param expectedHash Expected hash values [low, high]
 * @returns Promise with formatted proof data for contract verification
 */
export async function generateHashVerifierProof(
  data: number[],
  expectedHash: [string, string]
): Promise<{ a: BigNumberish[]; b: BigNumberish[][]; c: BigNumberish[]; input: BigNumberish[] }> {
  // Format inputs according to the HashVerifier circuit
  const inputs = {
    data: data.map((val) => val.toString()),
    expectedHash: expectedHash,
  };

  return await generateProof('hashverifier', inputs);
}

/**
 * Parses the calldata string from snarkjs to a structured format
 *
 * @param calldata Raw calldata string from snarkjs.groth16.exportSolidityCallData
 * @returns Structured calldata for contract verification
 */
function parseCalldata(calldata: string): {
  a: BigNumberish[];
  b: BigNumberish[][];
  c: BigNumberish[];
  input: BigNumberish[];
} {
  const argv = calldata
    .replace(/["[\]\s]/g, '')
    .split(',')
    .map((x) => x);

  const a = [argv[0], argv[1]];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ];
  const c = [argv[6], argv[7]];
  const input = [];

  for (let i = 8; i < argv.length; i++) {
    input.push(argv[i]);
  }

  return { a, b, c, input };
}

/**
 * Generate test data for AgeVerifier
 *
 * @returns Valid age verification data
 */
export function getTestAgeData() {
  // Example: 21 years old (born Jan 1, 2000, current date Jan 1, 2021)
  const birthDate = Math.floor(new Date(2000, 0, 1).getTime() / 1000);
  const currentDate = Math.floor(new Date(2021, 0, 1).getTime() / 1000);
  const threshold = 18 * 365 * 24 * 60 * 60; // 18 years in seconds

  return { birthDate, currentDate, threshold };
}

/**
 * Generate test data for FhirVerifier
 *
 * @returns Valid FHIR verification data
 */
export function getTestFhirData() {
  // Example FHIR resource data
  const resourceData = [12345, 67890, 13579, 24680, 98765, 43210, 11223, 44556];
  const resourceType = 1; // Patient
  // Use string format for large numbers to avoid scientific notation
  const expectedHash: [string, string] = [
    '1796527974942811177779686228864301369667515173275935237830539062059572725738',
    '0',
  ];
  const verificationMode = 1; // Resource type verification

  return { resourceData, resourceType, expectedHash, verificationMode };
}

/**
 * Generate test data for HashVerifier
 *
 * @returns Valid hash verification data
 */
export function getTestHashData() {
  // Example data to hash - this needs to stay consistent as the hash below corresponds to this exact data
  const data = [123456, 654321, 111111, 999999];

  // The hash below is the correct Poseidon hash for the data above, generated by the hash-verifier circuit
  // This has been verified to work with the circuit
  const expectedHash: [string, string] = [
    '21663839004416932945382355908790599225266501822907887273280181166639835257320',
    '0',
  ];

  return { data, expectedHash };
}
