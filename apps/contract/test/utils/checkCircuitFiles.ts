import fs from 'fs';
import path from 'path';
import * as snarkjs from 'snarkjs';

/**
 * A utility to check circuit files and diagnose format issues
 * Run with: npx ts-node test/utils/checkCircuitFiles.ts
 */

async function main() {
  console.log('Circuit File Check Utility');
  console.log('==========================');

  const circuitNames = ['ageverifier', 'fhirverifier', 'hashverifier'];
  const currentDirectory = process.cwd();

  // Check if we're in the right directory
  console.log(`Current directory: ${currentDirectory}`);

  // List all possible output directories
  const outputDir = path.join(currentDirectory, 'circuits', 'out');
  console.log(`\nChecking circuit output directory: ${outputDir}`);

  if (!fs.existsSync(outputDir)) {
    console.error(`\n❌ Error: Output directory not found: ${outputDir}`);
    return;
  }

  // List contents of output directory
  try {
    const contents = fs.readdirSync(outputDir);
    console.log('\nCircuit output directories found:');
    contents.forEach((item) => {
      const itemPath = path.join(outputDir, item);
      const stats = fs.statSync(itemPath);
      console.log(`- ${item} (${stats.isDirectory() ? 'directory' : 'file'})`);
    });
  } catch (error) {
    console.error(`\n❌ Error listing output directory: ${error}`);
  }

  // Check each circuit
  console.log('\nChecking circuit files:');

  for (const circuit of circuitNames) {
    console.log(`\n🔍 Circuit: ${circuit}`);

    // Check for both naming formats
    const circuitDirs = [path.join(outputDir, circuit), path.join(outputDir, circuit.replace('-', ''))];

    let circuitFound = false;

    for (const dir of circuitDirs) {
      if (fs.existsSync(dir)) {
        circuitFound = true;
        console.log(`  Found directory: ${dir}`);

        // Check for JS directory
        const circuitBaseName = (() => {
          // Get properly capitalized circuit name
          const sanitizedName = circuit.replace('-', '').replace('_', '');
          if (sanitizedName === 'ageverifier') {
            return 'AgeVerifier';
          } else if (sanitizedName === 'fhirverifier') {
            return 'FhirVerifier';
          } else if (sanitizedName === 'hashverifier') {
            return 'HashVerifier';
          } else {
            return circuit.charAt(0).toUpperCase() + circuit.slice(1);
          }
        })();

        const jsDir = path.join(dir, `${circuitBaseName}_js`);

        if (fs.existsSync(jsDir)) {
          console.log(`  Found JS directory: ${jsDir}`);

          // Check for WASM file
          const wasmFile = path.join(jsDir, `${circuitBaseName}.wasm`);

          if (fs.existsSync(wasmFile)) {
            console.log(`  Found WASM file: ${wasmFile}`);

            // Check WASM file format
            try {
              const wasmStats = fs.statSync(wasmFile);
              console.log(`  WASM file size: ${wasmStats.size} bytes`);

              // Read first few bytes to check format
              const buffer = Buffer.alloc(8);
              const fd = fs.openSync(wasmFile, 'r');
              fs.readSync(fd, buffer, 0, 8, 0);
              fs.closeSync(fd);

              const magicBytes = buffer.slice(0, 4).toString('hex');
              console.log(`  WASM magic bytes: 0x${magicBytes}`);

              // Check for WebAssembly magic header (0x0061736d)
              if (magicBytes === '0061736d') {
                console.log('  ✅ WASM format appears valid');
              } else {
                console.log('  ❌ WASM format appears invalid. Expected: 0x0061736d');
              }
            } catch (error) {
              console.error(`  ❌ Error checking WASM file: ${error}`);
            }
          } else {
            console.log(`  ❌ WASM file not found: ${wasmFile}`);
          }
        } else {
          console.log(`  ❌ JS directory not found: ${jsDir}`);
        }
      }
    }

    if (!circuitFound) {
      console.log(`  ❌ No directory found for circuit: ${circuit}`);
    }

    // Check for zkey files
    const zkeyLocations = [
      path.join(currentDirectory, 'ptau'),
      path.join(currentDirectory, 'circuits', 'keys'),
      path.join(currentDirectory, 'circuits', 'out'),
    ];

    let zkeyFound = false;

    for (const location of zkeyLocations) {
      if (fs.existsSync(location)) {
        const zkeyFile = path.join(location, `${circuit}.zkey`);

        if (fs.existsSync(zkeyFile)) {
          zkeyFound = true;
          const zkeyStats = fs.statSync(zkeyFile);
          console.log(`  Found zkey file: ${zkeyFile} (${zkeyStats.size} bytes)`);
        }
      }
    }

    if (!zkeyFound) {
      console.log('  ❌ No zkey file found for this circuit');
    }
  }

  // Provide recommendations
  console.log('\n📋 Recommendations:');
  console.log('1. If WASM files have incorrect magic bytes, they need to be regenerated');
  console.log('2. Missing zkey files need to be generated using the ZoKrates toolchain');
  console.log('3. Consider running: snarkjs zkey export solidityverifier <circuit>.zkey <circuit>Verifier.sol');
  console.log('   to generate Solidity verifier contracts directly');

  // Suggest proper fallback mechanism
  console.log('\n💡 For development/testing:');
  console.log('- The proofGenerator.ts file includes fallback hardcoded proofs');
  console.log('- Tests can continue to run even without valid circuit files');
  console.log('- Set REQUIRE_ZKEY=true environment variable to enforce zkey validation');
}

// Run main function
main().catch((error) => {
  console.error('Error in main function:', error);
  process.exit(1);
});
