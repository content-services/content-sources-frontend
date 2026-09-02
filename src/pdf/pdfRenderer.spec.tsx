jest.mock('puppeteer', () => ({}));

jest.mock('./lightwellLogomark', () => ({
  LIGHTWELL_LOGOMARK_SVG: '<svg>mock-logo</svg>',
}));

jest.mock('./pdfConfig', () => ({
  PDF_SERVER_PORT: 3001,
  PDF_SERVER_ORIGIN: 'http://127.0.0.1:3001',
  PDF_STYLES_BASE_URL: 'http://127.0.0.1:3001/pdf/styles',
  pendingRenders: new Map(),
}));

jest.mock('./pdfFonts', () => ({
  getFontLinkTag: (baseUrl: string) => `<link rel="stylesheet" href="${baseUrl}/pdf-fonts.css">`,
  PF_STYLES_DIR: '/mock/styles',
}));

import { renderBeaconPdfHtml } from './pdfRenderer';
import type { BeaconPdfData } from 'Pages/Lightwell/Beacon/pdf/beaconPdf';

const MOCK_DATA: BeaconPdfData = {
  vulnerabilities: [
    {
      uuid: '1',
      vulnerabilityId: 'CVE-2024-0001',
      purl: 'pkg:npm/foo@1.0',
      componentName: 'foo',
      componentVersion: '1.0.0',
      title: 'Test vulnerability',
      cwe: 'CWE-79',
      description: 'A test vulnerability',
      severity: 'Critical',
      cvss: 9.8,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      exploitTested: false,
      reproducerIncluded: false,
      customerPriority: undefined,
      status: 'Submitted',
      ecosystem: 'javascript',
      submittedDate: '2024-01-01',
      lastUpdated: '2024-06-15 10:30',
      ageDays: 166,
      duplicate: false,
      duplicateOf: undefined,
      ltwlsupt_ticket_ids: ['LTWLSUPT-100'],
      ltwlsupt_ticket_id: 'LTWLSUPT-100',
    },
  ],
  meta: {
    count: 1,
    criticalCount: 1,
    statusCounts: { Submitted: 1 },
  },
};

describe('renderBeaconPdfHtml', () => {
  it('produces a complete HTML document with inline styles', () => {
    const html = renderBeaconPdfHtml(MOCK_DATA, {
      visibleColumns: [
        { key: 'vulnerabilityId', title: 'Vulnerability ID' },
        { key: 'component', title: 'Package' },
        { key: 'stage', title: 'Status' },
      ],
      includeSummary: true,
      generatedAt: '1 Jan 2024',
      customerId: 'CID-01',
      headerBrand: 'lightwell',
      landscape: false,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('beacon-pdf');
    expect(html).toContain('Lightwell Vulnerability Report');
    expect(html).toContain('CVE-2024-0001');
    expect(html).toContain('Customer ID: CID-01');
    expect(html).toContain('Generated: 1 Jan 2024');
    expect(html).toContain('foo 1.0.0');
    expect(html).toContain('Submitted');
  });

  it('includes a <link> tag for the font stylesheet', () => {
    const html = renderBeaconPdfHtml(MOCK_DATA, {
      visibleColumns: [{ key: 'vulnerabilityId', title: 'Vulnerability ID' }],
      includeSummary: false,
      customerId: 'CID-01',
      headerBrand: 'lightwell',
      landscape: false,
    });

    expect(html).toContain('<link rel="stylesheet"');
    expect(html).toContain('http://127.0.0.1:3001/pdf/styles/pdf-fonts.css');
  });

  it('renders without summary when includeSummary is false', () => {
    const html = renderBeaconPdfHtml(MOCK_DATA, {
      visibleColumns: [{ key: 'vulnerabilityId', title: 'Vulnerability ID' }],
      includeSummary: false,
      customerId: 'CID-01',
      headerBrand: 'lightwell',
      landscape: false,
    });

    expect(html).not.toContain('Lightwell Vulnerability Report');
    expect(html).toContain('Vulnerabilities (continued)');
    expect(html).toContain('CVE-2024-0001');
  });
});
