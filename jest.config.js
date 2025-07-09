module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Module name mapping for aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }],
    '^.+\\.css$': 'jest-transform-stub',
    '^.+\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub'
  },

  // File extensions to consider
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // Test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/**/*.(test|spec).(js|jsx|ts|tsx)'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/main.tsx',
    '!src/setupTests.js',
    '!src/**/__tests__/**',
    '!src/**/*.test.*',
    '!src/**/*.spec.*'
  ],

  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Error on deprecated features
  errorOnDeprecated: true,

  // Globals
  globals: {
    'ts-jest': {
      useESM: true
    }
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // Module path ignore patterns
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Snapshot serializers
  snapshotSerializers: ['@emotion/jest/serializer'],

  // Max workers for parallel tests
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Performance optimization
  haste: {
    enableSymlinks: false
  }
};