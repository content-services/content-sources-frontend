/**
 * Core PDF rendering pipeline: React SSR -> Puppeteer print.
 * Ported from crc-pdf-generator's clusterTask.ts and pdfCache.ts.
 *
 * Key design decisions:
 * - Uses page.goto() instead of page.setContent() so that fonts served by
 *   the Express server are same-origin and load reliably.
 * - Explicitly calls document.fonts.load() because Chrome's lazy font loading
 *   may not trigger downloads before networkidle0 fires.
 * - The rendered HTML is stored temporarily in pendingRenders and served at
 *   /pdf/render/:id by the Express server.
 */
import { randomUUID } from 'crypto';
import { renderToStaticMarkup } from 'react-dom/server';
import puppeteer, { type Browser } from 'puppeteer';

import BeaconPdfTemplate from 'Pages/Lightwell/Beacon/pdf/BeaconPdfTemplate';
import {
  shouldUseLandscapePdf,
  type BeaconPdfAdditionalData,
  type BeaconPdfColumn,
  type BeaconPdfData,
} from 'Pages/Lightwell/Beacon/pdf/beaconPdf';
import { getHeaderAndFooterTemplates } from './pdfHeader';
import { getFontLinkTag } from './pdfFonts';
import { LIGHTWELL_LOGOMARK_SVG } from './lightwellLogomark';
import { PDF_STYLES_BASE_URL, PDF_SERVER_ORIGIN, pendingRenders } from './pdfConfig';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const VIEWPORT_WIDTH = (A4_HEIGHT_MM - 20) * 4; // 1108
const VIEWPORT_HEIGHT = (A4_WIDTH_MM - 40) * 4; // 680

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }
  const executablePath = process.env.CHROME_PATH || undefined;
  browserInstance = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export function renderBeaconPdfHtml(
  data: BeaconPdfData,
  additionalData: Partial<BeaconPdfAdditionalData>,
): string {
  const templateHtml = renderToStaticMarkup(
    <BeaconPdfTemplate asyncData={{ data }} additionalData={additionalData} />,
  );

  const fontLink = getFontLinkTag(PDF_STYLES_BASE_URL);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${fontLink}
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>${templateHtml}</body>
</html>`;
}

export async function printPdf(
  html: string,
  options: { landscape?: boolean },
): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  const renderId = randomUUID();
  pendingRenders.set(renderId, html);

  try {
    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    });

    await page.setCacheEnabled(false);

    await page.goto(`${PDF_SERVER_ORIGIN}/pdf/render/${renderId}`, {
      waitUntil: 'networkidle0',
    });

    await page.evaluate(async () => {
      await Promise.all([
        document.fonts.load('16px "Red Hat Text"'),
        document.fonts.load('bold 16px "Red Hat Text"'),
        document.fonts.load('italic 16px "Red Hat Text"'),
        document.fonts.load('16px "Red Hat Display"'),
        document.fonts.load('bold 16px "Red Hat Display"'),
      ]);
    });

    const { headerTemplate, footerTemplate } = getHeaderAndFooterTemplates(LIGHTWELL_LOGOMARK_SVG);

    const buffer = await page.pdf({
      format: 'a4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      landscape: options.landscape ?? false,
      margin: { top: '80px', bottom: '54px', left: '28px', right: '28px' },
    });

    return new Uint8Array(buffer);
  } finally {
    pendingRenders.delete(renderId);
    await page.close();
  }
}

export async function generateBeaconPdf(
  data: BeaconPdfData,
  columns: BeaconPdfColumn[],
  customerId: string,
  generatedAt: string,
): Promise<Uint8Array> {
  const landscape = shouldUseLandscapePdf(columns);
  const additionalData: Partial<BeaconPdfAdditionalData> = {
    visibleColumns: columns,
    includeSummary: true,
    generatedAt,
    customerId,
    headerBrand: 'lightwell',
    landscape,
  };

  const html = renderBeaconPdfHtml(data, additionalData);
  return printPdf(html, { landscape });
}
