module.exports = {
  roots: ['<rootDir>/src/'],
  preset: 'ts-jest',
  maxWorkers: '50%',
  testResultsProcessor: 'jest-junit',
  reporters: ['default', 'jest-junit'],
  testEnvironment: 'jsdom',
  transform: {
    // Match .tsx as well as .ts (the old `(t)s` pattern only matched `.ts`).
    // ts-jest forces moduleResolution node10 for CJS emit; TS 6 errors on that (TS5107) until ts-jest updates.
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        diagnostics: {
          ignoreCodes: [5107],
        },
      },
    ],
    '^.+\\.(css|scss|sass|less)$': 'jest-preview/transforms/css',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': 'jest-preview/transforms/file',
  },
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/config/setupAfterEnv.ts'],
  moduleDirectories: ['<rootDir>/node_modules', '<rootDir>/src'],
  // Below replaces things for speed
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/empty.js',
    '\\.(svg)$': 'identity-obj-proxy',
    '^uuid$': require.resolve('uuid'),
    // use cjs versions of patternfly packages, not esm
    '^(@patternfly/[a-zA-Z0-9_-]+)/dist/esm/(.*)$': '$1/dist/js/$2',
  },

  transformIgnorePatterns: [
    // '<rootDir>/node_modules/(?!@redhat-cloud-services|@openshift|lodash-es|uuid|@patternfly/react-icons)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/testingHelpers.tsx',
    '!src/index.html',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'text-summary'],
};
