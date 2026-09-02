/** Shared configuration for the PDF server and renderer. */
export const PDF_SERVER_PORT = parseInt(process.env.PDF_SERVER_PORT || '3001', 10);

export const PDF_SERVER_ORIGIN = `http://127.0.0.1:${PDF_SERVER_PORT}`;

/** Base URL where the PDF server serves PatternFly styles (fonts + CSS). */
export const PDF_STYLES_BASE_URL = `${PDF_SERVER_ORIGIN}/pdf/styles`;

/**
 * Temporary store for rendered HTML pages. The PDF renderer stores HTML here
 * so Puppeteer can fetch it via page.goto() (same-origin with fonts).
 */
export const pendingRenders = new Map<string, string>();
