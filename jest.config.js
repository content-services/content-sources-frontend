module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  //   transform: {
  //     // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
  //     // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
  //     '^.+\\.[tj]sx?$': [
  //       'ts-jest',
  //       {
  //         useESM: true,
  //         babelConfig: true,
  //         tsconfig: 'tsconfig.json',
  //       },
  //     ],
  //   },
  testEnvironment: 'jsdom',
  //   coverageDirectory: './coverage',
  //   collectCoverageFrom: ['src/**/*.test.{ts,tsx}', '!**/node_modules/**', '!test/**'],
  //   coveragePathIgnorePatterns: [],
  setupFiles: ['<rootDir>/config/setupTests.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/'],
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/empty.js',
    '\\.(svg)$': 'identity-obj-proxy',
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@redhat-cloud-services|@openshift|lodash-es|uuid|@patternfly/react-icons)',
    // '<rootDir>/node_modules/@patternfly/react-icons',
  ],
};
