// Mock implementations for external services

// Mock database
jest.mock('../../src/services/db/database.service', () => {
  return {
    DatabaseService: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        setupDatabase: jest.fn().mockResolvedValue(undefined),
        createAuthChallenge: jest.fn().mockResolvedValue({ id: 1 }),
        getActiveAuthChallengeForAddress: jest.fn().mockResolvedValue({
          id: 1,
          address: '0x1234567890123456789012345678901234567890',
          nonce: 'test-nonce',
          expiresAt: new Date(Date.now() + 3600000)
        }),
        invalidateAuthChallenge: jest.fn().mockResolvedValue(true),
        markAuthChallengeAsUsed: jest.fn().mockResolvedValue(true),
        query: jest.fn().mockResolvedValue([]),
        queryOne: jest.fn().mockResolvedValue(null),
        execute: jest.fn().mockResolvedValue({ rowsAffected: 1 }),
        close: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Mock wallet and providers
jest.mock('../../src/helpers/provider', () => {
  const mockWallet = {
    address: '0x1234567890123456789012345678901234567890',
    signMessage: jest.fn().mockResolvedValue('0xmocksignature'),
    connect: jest.fn().mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      signMessage: jest.fn().mockResolvedValue('0xmocksignature'),
      sendTransaction: jest.fn().mockResolvedValue({ hash: '0xtxhash' })
    })
  };

  return {
    provider: {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 1 }),
      getBlockNumber: jest.fn().mockResolvedValue(1000)
    },
    wallet: mockWallet,
    CONTRACT_ADDRESS: '0x1234567890123456789012345678901234567890',
    RPC_URL: 'http://localhost:8545',
    OWNER_PRIVATE_KEY:
      '0x0123456789012345678901234567890123456789012345678901234567890123'
  };
});

// Mock blockchain manager
jest.mock('../../src/lib/blockchain', () => {
  return {
    BlockchainManager: jest.fn().mockImplementation(() => {
      return {
        registerDid: jest.fn().mockResolvedValue({ txHash: '0xtxhash' }),
        resolveDid: jest.fn().mockImplementation(() => {
          const subject = '0x1234567890123456789012345678901234567890';
          return Promise.resolve({
            document: {},
            publicKey: [],
            subject: subject,
            controller: subject,
            active: true,
            lastUpdated: Math.floor(Date.now() / 1000).toString()
          });
        }),
        updateDidDocument: jest.fn().mockResolvedValue({ txHash: '0xtxhash' }),
        deactivateDid: jest.fn().mockResolvedValue({ txHash: '0xtxhash' }),
        updatePublicKey: jest.fn().mockResolvedValue({ txHash: '0xtxhash' }),
        checkOwnership: jest.fn().mockResolvedValue(true),
        addressToDid: jest
          .fn()
          .mockImplementation((address) => `did:ethr:${address}`)
      };
    })
  };
});

// Mock the siwe library for SiweAuthChallengeService
jest.mock('siwe', () => {
  return {
    SiweMessage: jest.fn().mockImplementation(() => {
      return {
        prepareMessage: jest
          .fn()
          .mockReturnValue('Sign this message to verify your identity'),
        validate: jest.fn().mockResolvedValue({
          success: true,
          data: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 'test-nonce'
          }
        }),
        verify: jest.fn().mockResolvedValue({
          success: true,
          data: {
            address: '0x1234567890123456789012345678901234567890',
            chainId: 1,
            nonce: 'test-nonce'
          }
        })
      };
    })
  };
});

// Update the mock for SiweAuthChallengeService to improve test coverage
jest.mock('../../src/services/auth/SiweAuthChallenge.service', () => {
  return {
    SiweAuthChallengeService: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn().mockResolvedValue(undefined),
        createSiweChallenge: jest.fn().mockResolvedValue({
          challenge: {
            id: 1,
            expiresAt: new Date(Date.now() + 3600000)
          },
          siweMessage: {
            prepareMessage: jest
              .fn()
              .mockReturnValue('Sign this message to verify your identity'),
            verify: jest.fn().mockResolvedValue({
              success: true,
              data: {
                address: '0x1234567890123456789012345678901234567890'
              }
            })
          }
        }),
        verifySiweChallenge: jest.fn().mockResolvedValue({
          success: true,
          address: '0x1234567890123456789012345678901234567890',
          fields: { nonce: 'test-nonce', domain: 'test.com' }
        })
      };
    })
  };
});

// Mock AuthService
jest.mock('../../src/services/auth/AuthService', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => {
      return {
        authenticate: jest.fn().mockResolvedValue({
          did: 'did:ethr:0x1234567890123456789012345678901234567890',
          address: '0x1234567890123456789012345678901234567890',
          role: 'user',
          token: 'mockJwtToken',
          authenticated: true
        }),
        verifyToken: jest.fn().mockReturnValue({
          sub: '0x1234567890123456789012345678901234567890',
          did: 'did:ethr:0x1234567890123456789012345678901234567890',
          role: 'user',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        }),
        verifySignature: jest.fn().mockResolvedValue(true),
        generateAuthChallenge: jest.fn().mockReturnValue({
          challenge: 'mockChallenge',
          expiresAt: Date.now() + 3600000
        }),
        refreshToken: jest.fn().mockResolvedValue({
          token: 'newMockJwtToken',
          expiresAt: new Date(Date.now() + 3600000)
        }),
        determineUserRole: jest.fn().mockResolvedValue('user')
      };
    })
  };
});

// Mock SessionService
jest.mock('../../src/services/session/session.service', () => {
  return {
    SessionService: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn().mockResolvedValue(undefined),
        createSession: jest.fn().mockResolvedValue({
          refreshToken: 'mockRefreshToken',
          expiresAt: new Date(Date.now() + 86400000)
        }),
        revokeSession: jest.fn().mockResolvedValue(true),
        validateRefreshToken: jest.fn().mockResolvedValue({
          userId: '0x1234567890123456789012345678901234567890',
          valid: true
        })
      };
    })
  };
});

// Export common test values
export const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';
export const TEST_DID = `did:ethr:${TEST_ADDRESS}`;
export const TEST_SIGNATURE = '0xmocksignature';

// Add a dummy test to prevent Jest from treating this as an empty test suite
describe('Mock Services', () => {
  it('should export test values', () => {
    expect(TEST_ADDRESS).toBeDefined();
    expect(TEST_DID).toBeDefined();
    expect(TEST_SIGNATURE).toBeDefined();
  });
});

// --- Mock Database Services ---

// Mock AuthDatabaseService
jest.mock('../../src/services/db/auth-database.service', () => {
  return {
    AuthDatabaseService: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        createAuthChallenge: jest
          .fn()
          .mockResolvedValue({ id: 'mock-challenge-id', nonce: 'mock-nonce' }),
        createAuthChallengeWithTransaction: jest
          .fn()
          .mockResolvedValue({
            id: 'mock-challenge-id-tx',
            nonce: 'mock-nonce-tx'
          }),
        getActiveAuthChallengeForAddress: jest.fn().mockResolvedValue({
          id: 'mock-challenge-id-active',
          address: '0x1234567890123456789012345678901234567890',
          nonce: 'mock-active-nonce',
          message: 'mock-message',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
          used: false
        }),
        getAuthChallengeById: jest.fn().mockResolvedValue(null), // Default to null, specific tests can override
        markAuthChallengeAsUsed: jest.fn().mockResolvedValue(true),
        markAuthChallengeAsUsedWithTransaction: jest
          .fn()
          .mockResolvedValue(true),
        deleteExpiredAuthChallenges: jest.fn().mockResolvedValue(0),
        deleteUsedAuthChallenges: jest.fn().mockResolvedValue(0),
        recordAuthAttempt: jest
          .fn()
          .mockResolvedValue({ attemptCount: 1, isBlocked: false }),
        checkRateLimit: jest
          .fn()
          .mockResolvedValue({ isBlocked: false, attemptCount: 0 }),
        cleanupRateLimits: jest.fn().mockResolvedValue(0),
        clearRateLimitingForIdentifier: jest.fn().mockResolvedValue(0),
        getTransaction: jest
          .fn()
          .mockResolvedValue({
            begin: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Mock TokenDatabaseService
jest.mock('../../src/services/db/token-database.service', () => {
  return {
    TokenDatabaseService: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        createRefreshToken: jest
          .fn()
          .mockResolvedValue({
            id: 'mock-token-id',
            token: 'mock-token-value'
          }),
        getRefreshTokenByToken: jest.fn().mockResolvedValue(null), // Default to null
        rotateRefreshToken: jest
          .fn()
          .mockResolvedValue({
            id: 'new-mock-token-id',
            token: 'new-mock-token-value'
          }),
        revokeRefreshToken: jest.fn().mockResolvedValue(true),
        revokeAllUserRefreshTokens: jest.fn().mockResolvedValue(1),
        cleanupExpiredRefreshTokens: jest.fn().mockResolvedValue(0),
        getTransaction: jest
          .fn()
          .mockResolvedValue({
            begin: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Mock AccessDatabaseService (if needed for other tests, otherwise can be omitted)
jest.mock('../../src/services/db/access-database.service', () => {
  return {
    AccessDatabaseService: jest.fn().mockImplementation(() => {
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        createAccessGrant: jest.fn().mockResolvedValue({ id: 'mock-grant-id' }),
        getAccessGrantById: jest.fn().mockResolvedValue(null),
        checkAccess: jest.fn().mockResolvedValue(true),
        revokeAccessGrant: jest.fn().mockResolvedValue(true),
        getAccessGrantsByUser: jest.fn().mockResolvedValue([]),
        getAccessGrantsByData: jest.fn().mockResolvedValue([]),
        getTransaction: jest
          .fn()
          .mockResolvedValue({
            begin: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn()
          }),
        close: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

// Mock DatabaseSetupService (only needs setupDatabase)
jest.mock('../../src/services/db/database.service', () => {
  return {
    DatabaseService: jest.fn().mockImplementation(() => {
      // Keep original class name for the mock path
      return {
        initialize: jest.fn().mockResolvedValue(undefined),
        setupDatabase: jest.fn().mockResolvedValue(undefined), // Mock the setup method
        close: jest.fn().mockResolvedValue(undefined)
        // No other data methods needed here
      };
    })
  };
});

// --- Mock Other Services (Keep existing mocks if present) ---

// Example: Mock JWTService (if not already mocked)
/*
jest.mock('../../src/services/session/jwt.service', () => {
  return {
    JWTService: jest.fn().mockImplementation(() => {
      return {
        generateToken: jest.fn().mockReturnValue('mock-access-token'),
        verifyToken: jest.fn().mockReturnValue({ sub: '0xmockaddress' }),
        generateAccessToken: jest.fn().mockReturnValue('mock-data-access-token'), // Keep if used elsewhere
        extractTokenFromHeader: jest.fn().mockReturnValue('mock-access-token'),
        decodeToken: jest.fn().mockReturnValue({ sub: '0xmockaddress' })
      };
    })
  };
});
*/
