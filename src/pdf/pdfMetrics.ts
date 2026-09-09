/** Prometheus metrics for the PDF server. */
import { Registry, Histogram, Counter, Gauge, collectDefaultMetrics } from 'prom-client';

export const registry = new Registry();
collectDefaultMetrics({ register: registry });

export const pdfDuration = new Histogram({
  name: 'pdf_generation_duration_seconds',
  help: 'Time taken to generate a PDF',
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [registry],
});

export const pdfErrors = new Counter({
  name: 'pdf_generation_errors_total',
  help: 'Number of failed PDF generations',
  labelNames: ['reason'] as const,
  registers: [registry],
});

export const activeRenders = new Gauge({
  name: 'pdf_active_renders',
  help: 'Number of PDF renders currently in progress',
  registers: [registry],
});
