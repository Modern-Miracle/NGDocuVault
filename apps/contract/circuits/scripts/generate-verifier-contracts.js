#!/usr/bin/env node

/**
 * Generate Solidity verifier contracts for all circuits
 *
 * This script:
 * 1. Compiles the Circom circuits
 * 2. Generates verification keys
 * 3. Creates Solidity verifier contracts
 */

const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const CIRCUITS_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(CIRCUITS_DIR, 'out');
const CONTRACTS_DIR = path.join(__dirname, '../../src/verifiers');
const PTAU_DIR = path.join(CIRCUITS_DIR, 'ptau');

// List of circuits to process
const CIRCUITS = [
  { name: 'HashVerifier', ptauFile: 'pot12_final.ptau' },
  { name: 'AgeVerifier', ptauFile: 'pot12_final.ptau' },
  { name: 'FhirVerifier', ptauFile: 'pot12_final.ptau' },
];

// Ensure directories exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Execute shell command and log output
async function executeCommand(command, cwd = process.cwd()) {
  console.log(`Executing: ${command}`);
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.error(`Command failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return { success: false, error };
  }
}

// Process a single circuit to generate Solidity verifier
async function processCircuit(circuit) {
  console.log(`\n=== Processing ${circuit.name} ===`);

  const circuitPath = path.join(CIRCUITS_DIR, `${circuit.name}.circom`);
  const outputDir = path.join(OUTPUT_DIR, circuit.name.toLowerCase());
  const ptauFile = path.join(PTAU_DIR, circuit.ptauFile);

  // Important: Use the original case for the r1cs file
  const r1csFile = path.join(outputDir, `${circuit.name}.r1cs`);
  const zkeyFile = path.join(outputDir, `${circuit.name}.zkey`);
  const vkeyFile = path.join(outputDir, `${circuit.name}_verification_key.json`);

  // Generate a clean verifier name without duplicate "Verifier"
  // If the circuit name already ends with "Verifier", don't add another one
  const verifierFileName = circuit.name.endsWith('Verifier') ? `${circuit.name}.sol` : `${circuit.name}Verifier.sol`;
  const verifierFile = path.join(CONTRACTS_DIR, verifierFileName);

  // Ensure output directory exists
  ensureDirectoryExists(outputDir);
  ensureDirectoryExists(CONTRACTS_DIR);

  // Check if ptau file exists
  if (!fs.existsSync(ptauFile)) {
    console.error(`Error: Required ptau file not found: ${ptauFile}`);
    console.error(`Please make sure the file exists in ${PTAU_DIR}`);
    return false;
  }

  try {
    // 1. Compile the circuit
    console.log(`Compiling ${circuit.name}...`);
    const circomLibPath = path.join(CIRCUITS_DIR, '..', 'node_modules');
    await executeCommand(`circom ${circuitPath} --r1cs --wasm --sym --output ${outputDir} -l ${circomLibPath}`);

    // Wait briefly for files to be written
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if r1cs file exists
    if (!fs.existsSync(r1csFile)) {
      console.error(`Error: R1CS file not found: ${r1csFile}`);
      console.error(`Available files in ${outputDir}:`);
      fs.readdirSync(outputDir).forEach((file) => console.error(` - ${file}`));
      return false;
    }

    // 2. Generate zkey file (perform trusted setup)
    console.log(`Generating zkey for ${circuit.name}...`);
    await executeCommand(`snarkjs groth16 setup ${r1csFile} ${ptauFile} ${zkeyFile}`);

    // 3. Export verification key
    console.log(`Exporting verification key for ${circuit.name}...`);
    await executeCommand(`snarkjs zkey export verificationkey ${zkeyFile} ${vkeyFile}`);

    // 4. Generate Solidity verifier
    console.log(`Generating Solidity verifier for ${circuit.name}...`);
    await executeCommand(`snarkjs zkey export solidityverifier ${zkeyFile} ${verifierFile}`);

    // 5. Fix the Solidity pragma version and add SPDX license
    console.log(`Updating Solidity pragma for ${circuit.name}.sol...`);
    let verifierCode = fs.readFileSync(verifierFile, 'utf8');
    verifierCode =
      `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.17;\n\n` +
      verifierCode.replace(/pragma solidity \^\d+\.\d+\.\d+;/g, '');
    fs.writeFileSync(verifierFile, verifierCode);

    console.log(`Successfully generated ${circuit.name}.sol`);
    return true;
  } catch (error) {
    console.error(`Error processing ${circuit.name}: ${error.message}`);
    return false;
  }
}

// Main function to process all circuits
async function main() {
  console.log('Starting verifier contract generation...');

  // Ensure directories exist
  ensureDirectoryExists(OUTPUT_DIR);
  ensureDirectoryExists(CONTRACTS_DIR);
  ensureDirectoryExists(PTAU_DIR);

  // Check if ptau files exist
  let missingPtauFiles = false;
  for (const circuit of CIRCUITS) {
    const ptauFile = path.join(PTAU_DIR, circuit.ptauFile);
    if (!fs.existsSync(ptauFile)) {
      console.error(`Error: Required ptau file missing: ${ptauFile}`);
      missingPtauFiles = true;
    }
  }

  if (missingPtauFiles) {
    console.error('One or more required ptau files are missing. Please add them to the ptau directory.');
    process.exit(1);
  }

  // Process each circuit
  const results = await Promise.all(CIRCUITS.map(processCircuit));

  // Check if all circuits were processed successfully
  if (results.every((success) => success)) {
    console.log('\n✅ All verifier contracts generated successfully!');
    console.log(`\nVerifier contracts are available in: ${CONTRACTS_DIR}`);
  } else {
    console.error('\n❌ Some verifier contracts failed to generate.');
    console.log('Please check the logs above for errors.');
  }
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
