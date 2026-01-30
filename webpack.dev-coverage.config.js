/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Extends fec's dev-proxy webpack config to add Istanbul instrumentation.
 * Use with: yarn local:coverage
 */
const path = require('path');

// Load fec's original dev-proxy config
const originalConfigPath = path.join(
  __dirname,
  'node_modules/@redhat-cloud-services/frontend-components-config/bin/dev-proxy.webpack.config.js'
);

const originalConfig = require(originalConfigPath);

// Add Istanbul instrumentation when COVERAGE=true
if (process.env.COVERAGE === 'true') {
  console.log('📊 Coverage mode enabled - adding Istanbul instrumentation');
  
  originalConfig.module = originalConfig.module || {};
  originalConfig.module.rules = originalConfig.module.rules || [];
  
  originalConfig.module.rules.push({
    test: /\.(ts|tsx|js|jsx)$/,
    include: path.resolve(__dirname, 'src'),
    exclude: /node_modules|\.test\.|\.spec\./,
    enforce: 'post',
    use: {
      loader: '@jsdevtools/coverage-istanbul-loader',
      options: {
        esModules: true,
        // Use window directly instead of new Function("return this")()
        // This avoids CSP issues in the browser
        coverageGlobalScope: 'window',
        coverageGlobalScopeFunc: false,
      },
    },
  });
}

module.exports = originalConfig;
