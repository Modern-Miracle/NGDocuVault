// Setup for Jest tests
import './mock-services'; // Import mocks first

// Mock express-session
jest.mock('express-session', () => {
  return jest.fn(() => {
    return (req: any, res: any, next: any) => {
      req.session = {
        user: undefined,
        destroy: jest.fn((callback: (err: any) => void) => callback(null))
      };
      next();
    };
  });
});

// Mock utils with timers
jest.mock('../../src/utils/challenge-store', () => {
  return {
    addChallenge: jest.fn(),
    getChallenge: jest.fn(),
    removeChallenge: jest.fn(),
    cleanupExpiredChallenges: jest.fn()
    // Don't include the setInterval that causes Jest to hang
  };
});

// Setup other common mocks
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

// Use fake timers
jest.useFakeTimers();

// Common setup before tests
beforeAll(() => {
  // Clear all mocks before tests
  jest.clearAllMocks();
});

// Common cleanup after tests
afterAll(() => {
  jest.useRealTimers();
  jest.resetAllMocks();
});

// Required to make this file a module
export {};

// Add a dummy test to prevent Jest from treating this as an empty test suite
describe('Test Setup', () => {
  it('should have setup and teardown hooks', () => {
    expect(beforeAll).toBeDefined();
    expect(afterAll).toBeDefined();
  });
});
