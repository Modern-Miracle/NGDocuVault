module.exports = {
  skipFiles: [
    'src/DidAuth.sol',
    'src/DidIssuer.sol',
    'src/DidRegistry.sol',
    'src/DidVerifier.sol',
    'src/DocuVault.sol',
  ],
  testfiles: ['test/MockIssuer/MockIssuer.test.ts', 'test/HashVerifier/HashVerifier.test.ts'],
};
