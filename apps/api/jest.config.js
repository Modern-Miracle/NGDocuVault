module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['./__tests__/jest.setup.ts'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  moduleNameMapper: {
    '@azure/(.*)': '<rootDir>/__tests__/mock/azure-mock.ts'
  },
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*.ts',
    '!src/config/**/*.ts'
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov']
};
