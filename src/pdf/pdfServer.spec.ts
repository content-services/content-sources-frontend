jest.mock('./pdfRenderer', () => ({
  generateBeaconPdf: jest.fn(),
  closeBrowser: jest.fn(),
}));

jest.mock('./pdfFonts', () => ({
  PF_STYLES_DIR: '/mock/styles',
  getFontLinkTag: () => '',
}));

jest.mock('./pdfConfig', () => ({
  PDF_SERVER_PORT: 3001,
  PDF_SERVER_ORIGIN: 'http://127.0.0.1:3001',
  PDF_STYLES_BASE_URL: 'http://127.0.0.1:3001/pdf/styles',
  pendingRenders: new Map(),
}));

import type { Request, Response } from 'express';
import { handleBeaconPdf } from './pdfServer';
import { generateBeaconPdf } from './pdfRenderer';

const mockedGeneratePdf = generateBeaconPdf as jest.MockedFunction<typeof generateBeaconPdf>;

function mockReqRes(body: Record<string, unknown>) {
  const req = { body, headers: {} } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
    send: jest.fn(),
  } as unknown as Response & {
    status: jest.Mock;
    json: jest.Mock;
    setHeader: jest.Mock;
    send: jest.Mock;
  };
  return { req, res };
}

const MOCK_DATA = {
  vulnerabilities: [
    {
      uuid: '1',
      vulnerabilityId: 'CVE-2024-0001',
      purl: 'pkg:npm/foo@1.0',
      componentName: 'foo',
      componentVersion: '1.0.0',
      title: 'Test vulnerability',
      severity: 'Critical',
      cvss: 9.8,
      stage: 'Submitted',
    },
  ],
  meta: {
    count: 1,
    criticalCount: 1,
    stageCounts: { Submitted: 1 },
  },
};

beforeEach(() => {
  mockedGeneratePdf.mockReset();
});

describe('handleBeaconPdf', () => {
  it('returns a PDF buffer when given valid input', async () => {
    const fakePdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockedGeneratePdf.mockResolvedValue(fakePdf);

    const { req, res } = mockReqRes({
      customerId: 'CID-01',
      visibleColumns: [{ key: 'vulnerabilityId', title: 'Vulnerability ID' }],
      data: MOCK_DATA,
    });

    await handleBeaconPdf(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="lightwell-beacon-CID-01.pdf"',
    );
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(mockedGeneratePdf).toHaveBeenCalledWith(
      MOCK_DATA,
      [{ key: 'vulnerabilityId', title: 'Vulnerability ID' }],
      'CID-01',
      expect.any(String),
    );
  });

  it('returns 400 when customerId is missing', async () => {
    const { req, res } = mockReqRes({
      visibleColumns: [{ key: 'vulnerabilityId', title: 'ID' }],
      data: MOCK_DATA,
    });

    await handleBeaconPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'customerId is required' });
    expect(mockedGeneratePdf).not.toHaveBeenCalled();
  });

  it('returns 400 when visibleColumns is empty', async () => {
    const { req, res } = mockReqRes({ customerId: 'CID-01', visibleColumns: [], data: MOCK_DATA });

    await handleBeaconPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'visibleColumns is required' });
    expect(mockedGeneratePdf).not.toHaveBeenCalled();
  });

  it('returns 400 when visibleColumns is omitted', async () => {
    const { req, res } = mockReqRes({ customerId: 'CID-01', data: MOCK_DATA });

    await handleBeaconPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'visibleColumns is required' });
  });

  it('returns 400 when data is missing', async () => {
    const { req, res } = mockReqRes({
      customerId: 'CID-01',
      visibleColumns: [{ key: 'vulnerabilityId', title: 'ID' }],
    });

    await handleBeaconPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'data with vulnerabilities is required' });
    expect(mockedGeneratePdf).not.toHaveBeenCalled();
  });

  it('returns 500 when PDF generation throws', async () => {
    mockedGeneratePdf.mockRejectedValue(new Error('Puppeteer crashed'));

    const { req, res } = mockReqRes({
      customerId: 'CID-01',
      visibleColumns: [{ key: 'vulnerabilityId', title: 'Vulnerability ID' }],
      data: MOCK_DATA,
    });

    await handleBeaconPdf(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'PDF generation failed',
      message: 'Puppeteer crashed',
    });
  });
});
