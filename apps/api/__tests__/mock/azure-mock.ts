// Mock for Azure Key Vault services
// Mocks for @azure/identity and @azure/keyvault-secrets

class MockDefaultAzureCredential {
  constructor() {}
  getToken() {
    return Promise.resolve({
      token: 'mock-token',
      expiresOnTimestamp: Date.now() + 3600000
    });
  }
}

class MockKeyVaultSecret {
  name: string;
  value: string;

  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

class MockSecretClient {
  constructor() {}

  getSecret(name: string) {
    return Promise.resolve(new MockKeyVaultSecret(name, 'mock-secret-value'));
  }

  setSecret(name: string, value: string) {
    return Promise.resolve(new MockKeyVaultSecret(name, value));
  }

  beginDeleteSecret(name: string) {
    return Promise.resolve({
      pollUntilDone: () => Promise.resolve(true)
    });
  }

  beginRecoverDeletedSecret(name: string) {
    return Promise.resolve({
      pollUntilDone: () => Promise.resolve(true)
    });
  }
}

// Direct exports
export {
  MockDefaultAzureCredential as DefaultAzureCredential,
  MockKeyVaultSecret as KeyVaultSecret,
  MockSecretClient as SecretClient
};
