/**
 * Register a require hook that returns an empty module for CSS/SCSS imports.
 * PatternFly components import their stylesheets, which Node.js cannot parse.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

const path = require('path');
/* eslint-enable @typescript-eslint/no-require-imports */
const stubPath = path.join(__dirname, 'cssStub.js');

Module._resolveFilename = function (request: string, ...args: unknown[]) {
  if (/\.(css|scss|sass|less)$/.test(request)) {
    return stubPath;
  }
  return originalResolveFilename.call(this, request, ...args);
};
