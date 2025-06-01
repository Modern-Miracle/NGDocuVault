// Type definitions for Jest to allow TypeScript to recognize Jest globals
import { JwtPayload } from 'jsonwebtoken';

declare global {
  const jest: any;
  const describe: (name: string, fn: () => void) => void;
  const expect: any;
  const it: any;
  const beforeAll: (fn: () => void) => void;
  const afterAll: (fn: () => void) => void;
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;

  namespace jest {
    type Mock<T = any, Y extends any[] = any[]> = {
      (...args: Y): T;
      mock: {
        calls: Y[];
        instances: T[];
        contexts: any[];
        results: Array<{
          type: 'return' | 'throw';
          value: any;
        }>;
        lastCall: Y;
      };
      mockClear(): Mock<T, Y>;
      mockReset(): Mock<T, Y>;
      mockRestore(): void;
      mockReturnValue(value: T): Mock<T, Y>;
      mockReturnValueOnce(value: T): Mock<T, Y>;
      mockResolvedValue(value: T): Mock<T, Y>;
      mockResolvedValueOnce(value: T): Mock<T, Y>;
      mockRejectedValue(reason: any): Mock<T, Y>;
      mockRejectedValueOnce(reason: any): Mock<T, Y>;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): Mock<T, Y>;
      mockName(name: string): Mock<T, Y>;
      getMockName(): string;
    };

    type Mocked<T> = {
      [P in keyof T]: T[P] extends (...args: infer A) => infer B
        ? Mock<B, A>
        : T[P] extends object
          ? Mocked<T[P]>
          : T[P];
    };
  }

  namespace Express {
    interface Request {
      user?: JwtPayload & {
        did?: string;
        address: string;
        role?: string;
        authenticated: boolean;
        authMethod: string;
      };
    }
  }
}
