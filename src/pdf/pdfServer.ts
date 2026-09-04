/**
 * Lightweight Express server for in-app PDF generation.
 * Replaces the crc-pdf-generator microservice for Beacon PDF exports.
 *
 * This is a pure rendering server: the frontend fetches data (respecting its
 * own mock flags) and sends it in the POST body. The server only converts
 * the data into a PDF via Puppeteer.
 *
 * Font files are served at /pdf/styles/ from PatternFly's dist/styles/ directory.
 * Puppeteer navigates to /pdf/render/:id (same-origin) so fonts load reliably.
 *
 * Usage: yarn start:pdf
 */
import { resolve } from 'path';
import express from 'express';

import {
  formatBeaconPdfGeneratedAt,
  type BeaconPdfColumn,
  type BeaconPdfData,
} from 'Pages/Lightwell/Beacon/pdf/beaconPdf';

import { generateBeaconPdf, closeBrowser } from './pdfRenderer';
import { PF_STYLES_DIR } from './pdfFonts';
import { PDF_SERVER_PORT, pendingRenders } from './pdfConfig';

type PdfRequestBody = {
  customerId: string;
  visibleColumns: BeaconPdfColumn[];
  data: BeaconPdfData;
};

export async function handleBeaconPdf(req: express.Request, res: express.Response): Promise<void> {
  const { customerId, visibleColumns, data } = req.body as PdfRequestBody;

  if (!customerId) {
    res.status(400).json({ error: 'customerId is required' });
    return;
  }

  if (!/^[\w-]+$/.test(customerId)) {
    res.status(400).json({ error: 'customerId contains invalid characters' });
    return;
  }

  if (!Array.isArray(visibleColumns) || visibleColumns.length === 0) {
    res.status(400).json({ error: 'visibleColumns is required' });
    return;
  }

  if (!data?.vulnerabilities) {
    res.status(400).json({ error: 'data with vulnerabilities is required' });
    return;
  }

  try {
    const generatedAt = formatBeaconPdfGeneratedAt();
    const pdfBuffer = await generateBeaconPdf(data, visibleColumns, customerId, generatedAt);

    const filename = `lightwell-beacon-${customerId}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('PDF generation failed:', err);
    res.status(500).json({
      error: 'PDF generation failed',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '50mb' }));

app.get('/pdf/styles/pdf-fonts.css', (_req, res) => {
  res.sendFile(resolve(__dirname, 'pdf-fonts.css'));
});

app.use(
  '/pdf/styles',
  express.static(PF_STYLES_DIR, {
    maxAge: '1d',
    immutable: true,
  }),
);

app.get('/pdf/render/:id', (req, res) => {
  const { id } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    res.status(400).send('Invalid render ID');
    return;
  }
  const html = pendingRenders.get(id);
  if (!html) {
    res.status(404).send('Not found');
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

app.post('/pdf/beacon', handleBeaconPdf);

export default app;

if (require.main === module) {
  const server = app.listen(PDF_SERVER_PORT, () => {
    console.log(`PDF server listening on port ${PDF_SERVER_PORT}`);
  });

  process.on('SIGTERM', async () => {
    await closeBrowser();
    server.close();
  });

  process.on('SIGINT', async () => {
    await closeBrowser();
    server.close();
  });
}
