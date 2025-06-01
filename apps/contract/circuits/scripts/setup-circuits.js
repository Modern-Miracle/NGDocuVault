/**
 * Circuit Setup Script
 *
 * This script copies the necessary Circom circuit artifacts to the public directory
 * so they can be used by the frontend applications.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Source and destination directories
const ARTIFACTS_SOURCE_DIR = path.join(__dirname, '../');
const ARTIFACTS_DEST_DIR = path.join(__dirname, '../../led-up-fe/public/circuits');

// Circuit names to process
const CIRCUIT_NAMES = ['AgeVerifier', 'HashVerifier'];

// File extensions to copy
const FILE_EXTENSIONS = [
  '.wasm', // WebAssembly files
  '_0001.zkey', // ZKey files
];

// Create destination directory if it doesn't exist
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy a file and log the operation
function copyFile(source, destination) {
  console.log(`Copying: ${source} -> ${destination}`);
  fs.copyFileSync(source, destination);
}

// Copy verification key from JSON file and format for frontend
function copyVerificationKey(circuitName) {
  const verificationKeySource = path.join(ARTIFACTS_SOURCE_DIR, `verification_key_${circuitName}.json`);
  const verificationKeyDest = path.join(ARTIFACTS_DEST_DIR, `verification_key_${circuitName}.json`);

  if (fs.existsSync(verificationKeySource)) {
    copyFile(verificationKeySource, verificationKeyDest);
  } else {
    console.error(`Verification key not found: ${verificationKeySource}`);
  }
}

// Main function to copy all circuit artifacts
function setupCircuits() {
  // Ensure the destination directory exists
  ensureDirectoryExists(ARTIFACTS_DEST_DIR);

  // Check if source directory exists
  if (!fs.existsSync(ARTIFACTS_SOURCE_DIR)) {
    console.error(`Source directory not found: ${ARTIFACTS_SOURCE_DIR}`);
    console.log('Building circuits first...');

    try {
      // Attempt to build the circuits
      execSync('npm run build:circuits', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error building circuits:', error.message);
      process.exit(1);
    }
  }

  // Process each circuit
  CIRCUIT_NAMES.forEach((circuitName) => {
    console.log(`Processing circuit: ${circuitName}`);

    // Copy the circuit files with each extension
    FILE_EXTENSIONS.forEach((extension) => {
      const source = path.join(ARTIFACTS_SOURCE_DIR, `${circuitName}${extension}`);
      const destination = path.join(ARTIFACTS_DEST_DIR, `${circuitName}${extension}`);

      if (fs.existsSync(source)) {
        copyFile(source, destination);
      } else {
        console.error(`File not found: ${source}`);
      }
    });

    // Copy the verification key
    copyVerificationKey(circuitName);
  });

  console.log('Circuit setup complete! Artifacts are now available in the public directory.');
}

// Run the setup function
setupCircuits();

// Export for use in other scripts if needed
module.exports = {
  setupCircuits,
};
