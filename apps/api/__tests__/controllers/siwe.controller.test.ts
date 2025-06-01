import { Request, Response } from 'express';
import { SiweController } from '../../src/controllers/siwe.controller';
import { SiweAuthChallengeService } from '../../src/services/auth/SiweAuthChallenge.service';
import { AuthService } from '../../src/services/auth/AuthService';
import { SessionService } from '../../src/services/session/session.service';
import { BlockchainManager } from '../../src/lib/blockchain';
import { AuthenticationError } from '../../src/utils/errors';

// Mocks
jest.mock('../../src/services/auth/SiweAuthChallenge.service');
jest.mock('../../src/services/auth/AuthService');
jest.mock('../../src/services/session/session.service');
jest.mock('../../src/lib/blockchain');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
    morganMiddleware: jest.fn()
  }
}));

describe('SiweController', () => {
  let siweController: SiweController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  let mockSiweAuthChallengeService: jest.Mocked<SiweAuthChallengeService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockSessionService: jest.Mocked<SessionService>;
  let mockBlockchainManager: jest.Mocked<BlockchainManager>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Setup mock next function
    mockNext = jest.fn();

    // Create proper mocks instead of casting
    mockSiweAuthChallengeService = {
      init: jest.fn().mockResolvedValue(undefined),
      createSiweChallenge: jest.fn(),
      verifySiweChallenge: jest.fn()
    } as unknown as jest.Mocked<SiweAuthChallengeService>;

    mockAuthService = {
      authenticate: jest.fn(),
      verifyToken: jest.fn(),
      verifySignature: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    mockSessionService = {
      init: jest.fn().mockResolvedValue(undefined),
      createSession: jest.fn(),
      revokeSession: jest.fn()
    } as unknown as jest.Mocked<SessionService>;

    mockBlockchainManager = {
      resolveDid: jest.fn()
    } as unknown as jest.Mocked<BlockchainManager>;

    // Create controller instance with mocked dependencies
    siweController = new SiweController();
    // Replace the controller's services with our mocks
    Object.defineProperty(siweController, 'siweAuthChallengeService', {
      value: mockSiweAuthChallengeService
    });
    Object.defineProperty(siweController, 'authService', {
      value: mockAuthService
    });
    Object.defineProperty(siweController, 'sessionService', {
      value: mockSessionService
    });
    Object.defineProperty(siweController, 'blockchainManager', {
      value: mockBlockchainManager
    });

    // Setup default request with session
    mockRequest = {
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-test'
      },
      session: {
        user: undefined,
        destroy: jest.fn((callback: (err: Error | null) => void) =>
          callback(null)
        )
      } as any,
      query: {},
      body: {}
    };
  });

  describe('generateNonce', () => {
    it('should return a SIWE challenge message with expiry', async () => {
      // Setup
      mockRequest.query = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1'
      };

      const mockChallenge = {
        expiresAt: new Date(Date.now() + 3600000)
      };

      const mockSiweMessage = {
        prepareMessage: jest
          .fn()
          .mockReturnValue('Sign this message to verify your identity')
      };

      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockResolvedValue(undefined);
      mockSessionService.init = jest.fn().mockResolvedValue(undefined);
      mockSiweAuthChallengeService.createSiweChallenge = jest
        .fn()
        .mockResolvedValue({
          challenge: mockChallenge,
          siweMessage: mockSiweMessage
        });

      // Execute
      await siweController.generateNonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(
        mockSiweAuthChallengeService.createSiweChallenge
      ).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        1,
        'Sign in with Ethereum to access DocuVault',
        '127.0.0.1',
        'jest-test'
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sign this message to verify your identity',
        expiresAt: mockChallenge.expiresAt
      });
    });

    it('should handle errors and pass them to next', async () => {
      // Setup
      mockRequest.query = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1'
      };

      const mockError = new Error('Test error');
      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockRejectedValue(mockError);

      // Execute
      await siweController.generateNonce(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('verifyMessage', () => {
    it('should verify message, authenticate user, and create session', async () => {
      // Setup
      mockRequest.body = {
        message: 'Test message',
        signature: '0xsignature'
      };

      const mockVerification = {
        success: true,
        address: '0x1234567890123456789012345678901234567890',
        fields: { nonce: 'test-nonce', domain: 'test.com' }
      };

      const mockAuthResult = {
        did: 'did:ethr:0x1234567890123456789012345678901234567890',
        role: 'user'
      };

      const mockSessionResult = {
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 3600000)
      };

      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockResolvedValue(undefined);
      mockSessionService.init = jest.fn().mockResolvedValue(undefined);
      mockSiweAuthChallengeService.verifySiweChallenge = jest
        .fn()
        .mockResolvedValue(mockVerification);
      mockAuthService.authenticate = jest
        .fn()
        .mockResolvedValue(mockAuthResult);
      mockSessionService.createSession = jest
        .fn()
        .mockResolvedValue(mockSessionResult);

      // Execute
      await siweController.verifyMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(
        mockSiweAuthChallengeService.verifySiweChallenge
      ).toHaveBeenCalledWith('0xsignature', 'Test message');

      expect(mockAuthService.authenticate).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        '0xsignature'
      );

      expect(mockSessionService.createSession).toHaveBeenCalledWith(
        '0x1234567890123456789012345678901234567890',
        '127.0.0.1',
        'jest-test'
      );

      expect(mockRequest.session?.user).toEqual({
        did: 'did:ethr:0x1234567890123456789012345678901234567890',
        address: '0x1234567890123456789012345678901234567890',
        role: 'user',
        authenticated: true,
        authMethod: 'siwe'
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        auth: mockAuthResult,
        session: mockSessionResult,
        address: '0x1234567890123456789012345678901234567890',
        siwe: mockVerification.fields
      });
    });

    it('should handle verification failure', async () => {
      // Setup
      mockRequest.body = {
        message: 'Test message',
        signature: '0xsignature'
      };

      const mockVerification = {
        success: false,
        error: 'Invalid signature'
      };

      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockResolvedValue(undefined);
      mockSessionService.init = jest.fn().mockResolvedValue(undefined);
      mockSiweAuthChallengeService.verifySiweChallenge = jest
        .fn()
        .mockResolvedValue(mockVerification);

      // Execute
      await siweController.verifyMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Invalid signature');
    });

    it('should handle authentication failure', async () => {
      // Setup
      mockRequest.body = {
        message: 'Test message',
        signature: '0xsignature'
      };

      const mockVerification = {
        success: true,
        address: '0x1234567890123456789012345678901234567890',
        fields: { nonce: 'test-nonce', domain: 'test.com' }
      };

      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockResolvedValue(undefined);
      mockSessionService.init = jest.fn().mockResolvedValue(undefined);
      mockSiweAuthChallengeService.verifySiweChallenge = jest
        .fn()
        .mockResolvedValue(mockVerification);
      mockAuthService.authenticate = jest
        .fn()
        .mockRejectedValue(new Error('Authentication failed'));

      // Execute
      await siweController.verifyMessage(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Authentication failed');
    });
  });

  describe('getSession', () => {
    it('should return session data when token is valid', async () => {
      // Setup
      mockRequest.headers = {
        ...mockRequest.headers,
        authorization: 'Bearer valid-token'
      };

      const mockTokenPayload = {
        sub: '0x1234567890123456789012345678901234567890',
        did: 'did:ethr:0x1234567890123456789012345678901234567890',
        role: 'user'
      };

      mockAuthService.verifyToken = jest.fn().mockReturnValue(mockTokenPayload);

      // Execute
      await siweController.getSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('valid-token');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        authenticated: true,
        user: {
          address: '0x1234567890123456789012345678901234567890',
          did: 'did:ethr:0x1234567890123456789012345678901234567890',
          role: 'user'
        }
      });
    });

    it('should return unauthenticated when authorization header is missing', async () => {
      // Setup
      mockRequest.headers = { ...mockRequest.headers };

      // Execute
      await siweController.getSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ authenticated: false });
      expect(mockAuthService.verifyToken).not.toHaveBeenCalled();
    });

    it('should return unauthenticated when token is invalid', async () => {
      // Setup
      mockRequest.headers = {
        ...mockRequest.headers,
        authorization: 'Bearer invalid-token'
      };

      mockAuthService.verifyToken = jest.fn().mockReturnValue(null);

      // Execute
      await siweController.getSession(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith('invalid-token');
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ authenticated: false });
    });
  });

  describe('logout', () => {
    it('should revoke session and clear session data', async () => {
      // Setup
      mockRequest.body = {
        refreshToken: 'refresh-token'
      };

      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockResolvedValue(undefined);
      mockSessionService.init = jest.fn().mockResolvedValue(undefined);
      mockSessionService.revokeSession = jest.fn().mockResolvedValue(true);

      // Execute
      await siweController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSessionService.revokeSession).toHaveBeenCalledWith(
        'refresh-token'
      );
      expect(mockRequest.session?.destroy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle session revocation failure', async () => {
      // Setup
      mockRequest.body = {
        refreshToken: 'refresh-token'
      };

      mockSiweAuthChallengeService.init = jest
        .fn()
        .mockResolvedValue(undefined);
      mockSessionService.init = jest.fn().mockResolvedValue(undefined);
      mockSessionService.revokeSession = jest.fn().mockResolvedValue(false);

      // Execute
      await siweController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockSessionService.revokeSession).toHaveBeenCalledWith(
        'refresh-token'
      );
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0]?.[0];
      expect(error.message).toBe('Failed to revoke session');
    });
  });

  describe('getDidInfo', () => {
    it('should return DID information for authenticated user', async () => {
      // Setup
      mockRequest.user = {
        did: 'did:ethr:0x1234567890123456789012345678901234567890',
        address: '0x1234567890123456789012345678901234567890',
        role: 'user',
        authenticated: true,
        authMethod: 'siwe'
      };

      const subject = '0x1234567890123456789012345678901234567890';
      const mockDidData = {
        subject: subject,
        controller: subject, // Explicitly using subject as controller to match implementation
        active: true,
        lastUpdated: Math.floor(Date.now() / 1000).toString()
      };

      mockBlockchainManager.resolveDid = jest
        .fn()
        .mockResolvedValue(mockDidData);

      // Execute
      await siweController.getDidInfo(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockBlockchainManager.resolveDid).toHaveBeenCalledWith(
        'did:ethr:0x1234567890123456789012345678901234567890'
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          did: 'did:ethr:0x1234567890123456789012345678901234567890',
          controller: subject, // Using subject as controller
          active: true,
          created: expect.any(Date),
          updated: expect.any(Date),
          credentials: []
        }
      });
    });

    it('should return error when user is not authenticated', async () => {
      // Setup
      mockRequest.user = undefined;

      // Execute
      await siweController.getDidInfo(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Not authenticated with DID');
    });

    it('should return error when user has no DID', async () => {
      // Setup
      mockRequest.user = {
        address: '0x1234567890123456789012345678901234567890',
        role: 'user',
        authenticated: true,
        authMethod: 'siwe'
      };

      // Execute
      await siweController.getDidInfo(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0]?.[0];
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Not authenticated with DID');
    });
  });
});
