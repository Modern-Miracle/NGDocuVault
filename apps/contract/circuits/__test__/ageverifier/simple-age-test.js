const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Convert a date to Unix timestamp (seconds since epoch)
function dateToTimestamp(year, month, day) {
  return Math.floor(new Date(year, month - 1, day).getTime() / 1000);
}

// Convert years to seconds
function yearsToSeconds(years) {
  return years * 31536000; // 365 days in seconds
}

// Current date as Unix timestamp
const CURRENT_DATE = dateToTimestamp(2025, 3, 19); // March 19, 2025

// Test cases for Simple Age Verification (verificationType = 1)
const tests = [
  {
    name: 'Simple Age - Above Threshold',
    input: {
      birthDate: dateToTimestamp(2004, 1, 1), // January 1, 2004 (21 years old in 2025)
      currentDate: CURRENT_DATE, // March 19, 2025
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 1,
    },
    expectedResult: 14, // SIMPLE_AGE_SUCCESS
  },
  {
    name: 'Simple Age - Below Threshold',
    input: {
      birthDate: dateToTimestamp(2009, 1, 1), // January 1, 2009 (16 years old in 2025)
      currentDate: CURRENT_DATE, // March 19, 2025
      threshold: yearsToSeconds(18), // 18 years in seconds
      verificationType: 1,
    },
    expectedResult: 21, // SIMPLE_AGE_BELOW_THRESHOLD
  },
];

async function runTests() {
  console.log('Starting Simple Age Verification Tests...');

  try {
    for (const test of tests) {
      console.log(`\nRunning test: ${test.name}`);

      // Create input file
      const inputData = JSON.stringify({
        birthDate: test.input.birthDate.toString(),
        currentDate: test.input.currentDate.toString(),
        threshold: test.input.threshold.toString(),
        verificationType: test.input.verificationType.toString(),
      });

      fs.writeFileSync('input.json', inputData);
      console.log(`Input: ${inputData}`);

      // Calculate expected age in years for display
      const ageInSeconds = test.input.currentDate - test.input.birthDate;
      const ageInYears = Math.floor(ageInSeconds / 31536000);
      console.log(`Birth date: ${new Date(test.input.birthDate * 1000).toISOString().split('T')[0]}`);
      console.log(`Current date: ${new Date(test.input.currentDate * 1000).toISOString().split('T')[0]}`);
      console.log(`Calculated age: ${ageInYears} years`);
      console.log(`Threshold: ${test.input.threshold / 31536000} years (${test.input.threshold} seconds)`);

      // Generate witness using the compiled circuit
      execSync(
        `cd ${
          process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out/ageverifier')
        } && node AgeVerifier_js/generate_witness.js AgeVerifier_js/AgeVerifier.wasm input.json witness.wtns`
      );

      // Extract the output from the witness
      const { stdout: witnessInfo } = execSync(
        `cd ${
          process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out/ageverifier')
        } && snarkjs wtns export json witness.wtns witness.json`
      );
      const witnessData = JSON.parse(
        fs.readFileSync(
          path.join(process.env.OUT_DIR || path.join(__dirname, '../../../circuits/out/ageverifier'), 'witness.json'),
          'utf8'
        )
      );

      // Output is the second value in the witness array (index 1)
      const result = witnessData[1];

      console.log(`Result: ${result}`);
      console.log(`Expected: ${test.expectedResult}`);
      console.log(`Test ${result == test.expectedResult ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

runTests();
