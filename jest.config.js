module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: [],
  setupFilesAfterEnv: ['<rootDir>/config/setupAfterEnv.ts'],
  roots: ['<rootDir>/src/'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/config/empty.js',
    '\\.(svg)$': 'identity-obj-proxy',
    '\\.(css|scss)$': 'identity-obj-proxy',
    // '^react$': '<rootDir>/node_modules/react',
    // '^react-dom$': '<rootDir>/node_modules/react-dom',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!@redhat-cloud-services|@openshift|lodash-es|uuid|@patternfly/react-icons)',
  ],
};
