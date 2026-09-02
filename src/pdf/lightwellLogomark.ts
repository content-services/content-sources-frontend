/**
 * Reads the Lightwell logomark SVG from the frontend-assets package.
 *
 * Using readFileSync (not import) because this is a raw .svg file,
 * not a JS/TS module, and we need the string content for injection
 * into Puppeteer's header template via dangerouslySetInnerHTML.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

const svgPath = resolve(
  dirname(require.resolve('frontend-assets/package.json')),
  'src',
  'partners-icons',
  'lightwell-logomark.svg',
);

export const LIGHTWELL_LOGOMARK_SVG = readFileSync(svgPath, 'utf-8');
