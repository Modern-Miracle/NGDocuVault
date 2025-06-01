const { ethers } = require('ethers');

// Define all contract errors
const errors = [
  // DidRegistry errors
  'DidRegistry__Unauthorized()',
  'DidRegistry__InvalidDID()',
  'DidRegistry__DeactivatedDID()',
  'DidRegistry__DIDAlreadyRegistered()',
  
  // DidAuth errors
  'DidAuth__Unauthorized()',
  'DidAuth__InvalidDID()',
  'DidAuth__DeactivatedDID()',
  'DidAuth__InvalidCredential()',
  'DidAuth__InvalidRole()',
  'DidAuth__CredentialVerificationFailed()',
  
  // DocuVault errors
  'DocuVault__NotAdmin()',
  'DocuVault__NotIssuer()',
  'DocuVault__NotActive()',
  'DocuVault__NotHolder()',
  'DocuVault__InvalidHash()',
  'DocuVault__AlreadyRegistered()',
  'DocuVault__ZeroAddress()',
  'DocuVault__IssuerRegistered()',
  'DocuVault__IsActive()',
  'DocuVault__AlreadyAdmin()',
  'DocuVault__NotRegistered()',
  'DocuVault__AlreadyVerified()',
  'DocuVault__NotVerified()',
  'DocuVault__NotAuthorized()',
  'DocuVault__AlreadyGranted()',
  'DocuVault__NotGranted()',
  'DocuVault__Expired()',
  'DocuVault__InvalidDate()',
  'DocuVault__InvalidInput()',
  'DocuVault__CidMismatch()',
  'DocuVault__InvalidDID()',
  'DocuVault__NotVerifier()',
];

// Get command line arguments
const args = process.argv.slice(2);
const searchSelectors = args.length > 0 ? args : ['0x7c24598f', '0x035b9382'];

console.log('Looking for selectors:', searchSelectors);
console.log('\nChecking error signatures:\n');

// Calculate selectors and find matches
const errorMap = {};
for (const error of errors) {
  const hash = ethers.id(error);
  const selector = hash.slice(0, 10);
  errorMap[selector] = error;
  
  // Check if this matches any of our search selectors
  if (searchSelectors.includes(selector)) {
    console.log(`✓ FOUND: ${error} => ${selector}`);
  }
}

// Show all selectors for reference
console.log('\nChecking all selectors:\n');
for (const error of errors) {
  const hash = ethers.id(error);
  const selector = hash.slice(0, 10);
  console.log(`${error} => ${selector}`);
}