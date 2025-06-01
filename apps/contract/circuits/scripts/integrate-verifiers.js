#!/usr/bin/env node

/**
 * Integrate verifier contracts with the smart contract system
 *
 * This script:
 * 1. Creates a VerifierFactory contract that integrates all verifiers
 * 2. Ensures proper imports and interfaces
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '../..');
const VERIFIERS_DIR = path.join(PROJECT_ROOT, 'src/verifiers');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Public input sizes for each circuit
// These will be determined by reading the actual verifier files
const inputSizes = {};

// Ensure directories exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Extract the input array size from a verifier contract
function extractInputSize(verifierContent, verifierName) {
  // Look for patterns like 'uint256[4] calldata _pubSignals' in the verifyProof function
  const inputSizeRegex = /verifyProof\s*\([^)]*\[(\d+)\]\s*(memory|calldata)\s+[\w_]+/;
  const match = verifierContent.match(inputSizeRegex);

  if (match && match[1]) {
    inputSizes[verifierName] = parseInt(match[1]);
    console.log(`Detected ${verifierName} input size: ${inputSizes[verifierName]}`);
    return parseInt(match[1]);
  }

  // Fallback sizes based on linter errors
  if (verifierName === 'AgeVerifier') {
    inputSizes[verifierName] = 4;
    console.log(`Using known input size for ${verifierName}: 4`);
    return 4;
  } else if (verifierName === 'FhirVerifier') {
    inputSizes[verifierName] = 21;
    console.log(`Using known input size for ${verifierName}: 21`);
    return 21;
  } else if (verifierName === 'HashVerifier') {
    inputSizes[verifierName] = 3;
    console.log(`Using known input size for ${verifierName}: 3`);
    return 3;
  }

  // Default fallback
  console.warn(`Warning: Could not determine input size for ${verifierName}, using default value 1`);
  inputSizes[verifierName] = 1;
  return 1;
}

// Generate interface for verifier contracts - now with flexible input size
function generateVerifierInterface() {
  const interfacePath = path.join(SRC_DIR, 'interfaces/IZKPVerifier.sol');
  ensureDirectoryExists(path.dirname(interfacePath));

  const interfaceContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title IZKPVerifier
 * @dev Interface for zero-knowledge proof verifiers
 */
interface IZKPVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[] memory input
    ) external view returns (bool);
}
`;

  fs.writeFileSync(interfacePath, interfaceContent);
  console.log(`Generated IZKPVerifier interface at ${interfacePath}`);
}

// Generate verifier factory contract
function generateVerifierFactory(verifierNames, circuitBaseNames) {
  const factoryPath = path.join(SRC_DIR, 'VerifierFactory.sol');

  let imports = verifierNames.map((name) => `import {${name}} from "./verifiers/${name}.sol";`).join('\n');

  let contractDefinitions = verifierNames.map((name) => `    ${name} public ${name.toLowerCase()};`).join('\n');

  let constructorAssignments = verifierNames.map((name) => `        ${name.toLowerCase()} = new ${name}();`).join('\n');

  // Generate verification functions with proper circuit names (not doubled Verifier)
  let verifyFunctions = verifierNames
    .map((name) => {
      const inputSize = inputSizes[name];
      const baseName = circuitBaseNames[name];
      return `    /**
     * @dev Verifies a ${baseName} proof
     */
    function verify${baseName}(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[${inputSize}] memory input
    ) public view returns (bool) {
        return ${name.toLowerCase()}.verifyProof(a, b, c, input);
    }`;
    })
    .join('\n\n');

  const factoryContent = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IZKPVerifier} from "./interfaces/IZKPVerifier.sol";
${imports}

/**
 * @title VerifierFactory
 * @dev Factory contract that manages all circuit verifiers
 */
contract VerifierFactory {
${contractDefinitions}

    /**
     * @dev Constructor creates instances of all verifiers
     */
    constructor() {
${constructorAssignments}
    }

${verifyFunctions}
}
`;

  fs.writeFileSync(factoryPath, factoryContent);
  console.log(`Generated VerifierFactory at ${factoryPath}`);
}

// Main function
function main() {
  console.log('Starting verifier integration...');

  // Ensure directories exist
  ensureDirectoryExists(SRC_DIR);
  ensureDirectoryExists(path.join(SRC_DIR, 'interfaces'));

  // Create verifiers directory if it doesn't exist
  ensureDirectoryExists(VERIFIERS_DIR);

  // Get list of verifier files
  if (!fs.existsSync(VERIFIERS_DIR)) {
    console.error(`Verifiers directory not found at ${VERIFIERS_DIR}`);
    console.error('Creating directory...');
    ensureDirectoryExists(VERIFIERS_DIR);
    console.error('Please generate verifier contracts first using generate-verifier-contracts.js');
    process.exit(1);
  }

  // Get all verifier files ending with Verifier.sol (including VerifierVerifier.sol)
  const verifierFiles = fs.readdirSync(VERIFIERS_DIR).filter((file) => file.endsWith('.sol'));

  if (verifierFiles.length === 0) {
    console.error('No verifier contracts found in the verifiers directory');
    console.error('Please check the path: ' + VERIFIERS_DIR);
    console.error('Please generate verifier contracts first using generate-verifier-contracts.js');
    process.exit(1);
  }

  // Extract verifier names (removing the ".sol" suffix)
  // At this point they include the double "Verifier" (e.g., AgeVerifierVerifier)
  const verifierNames = verifierFiles.map((file) => file.replace('.sol', ''));

  console.log(`Found verifier contracts: ${verifierNames.join(', ')}`);

  // Extract circuit base names for function names (remove the doubled "Verifier")
  const circuitBaseNames = {};
  verifierNames.forEach((name) => {
    // Check if name ends with "VerifierVerifier"
    if (name.endsWith('VerifierVerifier')) {
      // Remove one "Verifier" to get the circuit name
      circuitBaseNames[name] = name.replace('VerifierVerifier', 'Verifier');
    } else {
      circuitBaseNames[name] = name;
    }
  });

  // Read each verifier file to determine input sizes
  for (const name of verifierNames) {
    const verifierPath = path.join(VERIFIERS_DIR, `${name}.sol`);
    if (fs.existsSync(verifierPath)) {
      const verifierContent = fs.readFileSync(verifierPath, 'utf8');
      extractInputSize(verifierContent, name);
    }
  }

  // Generate interface
  generateVerifierInterface();

  // Generate factory contract
  generateVerifierFactory(verifierNames, circuitBaseNames);

  console.log('\n✅ Verifier integration completed successfully!');
}

// Run the main function
try {
  main();
} catch (error) {
  console.error('An error occurred:', error);
  process.exit(1);
}
