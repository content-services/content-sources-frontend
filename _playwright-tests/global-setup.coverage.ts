import { clearCoverageData } from './coverage-utils';

/**
 * Global setup for coverage collection.
 * Clears any existing coverage data before the test run starts.
 */
async function globalSetup() {
  if (process.env.COVERAGE === 'true') {
    console.log('Coverage mode enabled - clearing previous coverage data...');
    await clearCoverageData();
  }
}

export default globalSetup;
