/**
 * Provides font loading for PDFs via PatternFly's own font assets.
 *
 * Fonts are served over HTTP by the PDF Express server. Puppeteer navigates
 * to the HTML page (same-origin) and loads a <link> stylesheet that contains
 * @font-face rules with relative ./assets/fonts/ URLs - exactly how PatternFly
 * is designed to work.
 */
import { resolve, dirname } from 'path';

/** Root of @patternfly/react-core's dist/styles/ directory (contains assets/fonts/). */
export const PF_STYLES_DIR = resolve(
  dirname(require.resolve('@patternfly/react-core/package.json')),
  'dist/styles',
);

/**
 * Returns a `<link>` tag that loads the PDF font stylesheet from the Express server.
 * The stylesheet is a small CSS file containing only @font-face rules.
 * The relative font URLs (./assets/fonts/...) resolve against the stylesheet URL,
 * which the Express server maps to the PatternFly styles directory.
 *
 * @param pdfStylesBaseUrl - Base URL for the styles endpoint, e.g. "http://127.0.0.1:3001/pdf/styles"
 */
export function getFontLinkTag(pdfStylesBaseUrl: string): string {
  return `<link rel="stylesheet" href="${pdfStylesBaseUrl}/pdf-fonts.css">`;
}
