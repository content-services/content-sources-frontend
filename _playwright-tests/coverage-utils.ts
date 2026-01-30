import { Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

// Extend Window interface to include Istanbul's coverage object
declare global {
  interface Window {
    __coverage__?: Record<string, unknown>;
  }
}

const NYC_OUTPUT_DIR = path.join(process.cwd(), '.nyc_output');

/**
 * Ensures the .nyc_output directory exists
 */
export async function ensureCoverageDir(): Promise<void> {
  try {
    await fs.access(NYC_OUTPUT_DIR);
  } catch {
    await fs.mkdir(NYC_OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Collects Istanbul coverage data from the browser's window.__coverage__ object
 * and saves it to .nyc_output directory for nyc to process.
 *
 * Call this after each test or at the end of your test suite.
 *
 * @param page - Playwright page object
 * @param testName - Unique identifier for the coverage file (e.g., test name)
 */
export async function collectCoverage(page: Page, testName: string): Promise<void> {
  try {
    // Check if coverage data exists on the page
    const coverage = await page.evaluate(() => window.__coverage__ || null);

    if (coverage) {
      await ensureCoverageDir();

      // Sanitize test name for filename
      const sanitizedName = testName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const timestamp = Date.now();
      const coverageFile = path.join(NYC_OUTPUT_DIR, `coverage-${sanitizedName}-${timestamp}.json`);

      await fs.writeFile(coverageFile, JSON.stringify(coverage));
      console.log(`Coverage data saved to ${coverageFile}`);
    } else {
      console.log('No coverage data found on page. Is the app built with instrumentation?');
    }
  } catch (error) {
    console.error('Failed to collect coverage:', error);
  }
}

/**
 * Clears existing coverage files before a test run.
 * Call this in globalSetup or before your test suite starts.
 */
export async function clearCoverageData(): Promise<void> {
  try {
    const files = await fs.readdir(NYC_OUTPUT_DIR);
    await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map((file) => fs.unlink(path.join(NYC_OUTPUT_DIR, file))),
    );
    console.log('Cleared existing coverage data');
  } catch {
    // Directory doesn't exist or other error so ignore
  }
}
