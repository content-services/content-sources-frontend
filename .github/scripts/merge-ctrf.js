#!/usr/bin/env node
/**
 * Merges UI and Integration CTRF JSON reports into a single playwright-ctrf.json
 * for GitHub test reporting. Run after both Playwright test steps in CI.
 */
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../playwright-ctrf');
const uiPath = path.join(dir, 'playwright-ctrf-ui.json');
const integrationPath = path.join(dir, 'playwright-ctrf-integration.json');
const outPath = path.join(dir, 'playwright-ctrf.json');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function mergeSummary(a, b) {
  const sum = (x, y) => (x ?? 0) + (y ?? 0);
  return {
    tests: sum(a.tests, b.tests),
    passed: sum(a.passed, b.passed),
    failed: sum(a.failed, b.failed),
    pending: sum(a.pending, b.pending),
    skipped: sum(a.skipped, b.skipped),
    other: sum(a.other, b.other),
    start: Math.min(a.start ?? Infinity, b.start ?? Infinity),
    stop: Math.max(a.stop ?? 0, b.stop ?? 0),
  };
}

const ui = loadJson(uiPath);
const integration = loadJson(integrationPath);

const r1 = ui.results;
const r2 = integration.results;

const merged = {
  results: {
    tool: r1.tool ?? r2.tool,
    summary: mergeSummary(r1.summary ?? {}, r2.summary ?? {}),
    tests: [...(r1.tests ?? []), ...(r2.tests ?? [])],
    environment: r1.environment ?? r2.environment ?? {},
  },
};

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(merged, null, 0), 'utf8');
console.log(
  `Merged CTRF: ${(r1.tests ?? []).length} UI + ${(r2.tests ?? []).length} Integration tests -> ${outPath}`,
);
