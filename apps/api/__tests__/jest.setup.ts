// Mock environment variables
process.env.PINATA_API_JWT = 'mock-jwt-token';
process.env.IPFS_GATEWAY_URL = 'https://test.gateway.com';
process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.AZURE_KEY_VAULT_URL = 'https://mock-keyvault.vault.azure.net/';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock the KeyVaultService
jest.mock('../src/services/keyvault/keyVault1.service', () => {
  return {
    KeyVaultService: jest.fn().mockImplementation(() => {
      return {
        getSecret: jest.fn().mockResolvedValue('mock-secret'),
        setSecret: jest.fn().mockResolvedValue(true),
        generateKey: jest.fn().mockResolvedValue('mock-generated-key')
      };
    })
  };
});

// Mock the crypto services
jest.mock('../src/services/crypto', () => {
  return {
    AsymmetricCryptoService: jest.fn().mockImplementation(() => {
      return {
        encryptWithPublicKey: jest.fn().mockReturnValue('mock-encrypted-data'),
        decryptWithPrivateKey: jest.fn().mockReturnValue('mock-decrypted-data')
      };
    }),
    SymmetricCryptoService: jest.fn().mockImplementation(() => {
      return {
        encrypt: jest.fn().mockReturnValue('mock-encrypted-data'),
        decrypt: jest.fn().mockReturnValue('mock-decrypted-data')
      };
    })
  };
});

// Mock the database service
jest.mock('../src/services/db/database.service', () => {
  return {
    DatabaseService: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn().mockResolvedValue(true),
        findOne: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'mock-id' }),
        update: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(true)
      };
    })
  };
});
