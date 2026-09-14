import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertVariant } from '@patternfly/react-core';
import axios from 'axios';

import { ExportMenu, fetchAllFilteredVulnerabilities } from './ExportMenu';
import { getVulnerabilities } from 'services/Lightwell/BeaconApi';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('services/Lightwell/BeaconApi', () => {
  const actual = jest.requireActual('services/Lightwell/BeaconApi');
  return {
    ...actual,
    getVulnerabilities: jest.fn(),
  };
});

jest.mock('Hooks/useErrorNotification', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('Hooks/useNotification', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useNotification from 'Hooks/useNotification';

const notify = jest.fn();
const mockedGetVulnerabilities = getVulnerabilities as jest.Mock;

const MOCK_VULN_RESPONSE = {
  vulnerabilities: [
    {
      uuid: '1',
      vulnerabilityId: 'CVE-2024-0001',
      componentName: 'foo',
      componentVersion: '1.0.0',
      severity: 'Critical',
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
  (useNotification as jest.Mock).mockReturnValue({ notify });
  notify.mockClear();
  mockedAxios.post.mockReset();
  mockedGetVulnerabilities.mockReset();
  URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
  URL.revokeObjectURL = jest.fn();
});

describe('fetchAllFilteredVulnerabilities', () => {
  it('fetches all pages and returns BeaconData with meta', async () => {
    mockedGetVulnerabilities.mockResolvedValueOnce(MOCK_VULN_RESPONSE);

    const result = await fetchAllFilteredVulnerabilities('CID-01');

    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.meta).toEqual(MOCK_VULN_RESPONSE.meta);
    expect(mockedGetVulnerabilities).toHaveBeenCalledWith('CID-01', undefined, {
      limit: expect.any(Number),
      offset: 0,
    });
  });
});

describe('ExportMenu PDF', () => {
  it('fetches data then posts to the PDF server with data in body', async () => {
    mockedGetVulnerabilities.mockResolvedValue(MOCK_VULN_RESPONSE);
    const pdfBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    mockedAxios.post.mockResolvedValue({ data: pdfBlob });

    const user = userEvent.setup();
    render(
      <ExportMenu
        customerId='CID-01'
        visibleColumns={[{ key: 'vulnerabilityId', title: 'Vulnerability ID' }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export' }));
    await user.click(screen.getByRole('menuitem', { name: 'Export as PDF' }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    expect(mockedGetVulnerabilities).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalledWith(
      '/pdf/beacon',
      {
        customerId: 'CID-01',
        visibleColumns: [{ key: 'vulnerabilityId', title: 'Vulnerability ID' }],
        data: MOCK_VULN_RESPONSE,
      },
      { responseType: 'blob' },
    );
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('closes the menu and shows generating feedback while the PDF is in progress', async () => {
    mockedGetVulnerabilities.mockResolvedValue(MOCK_VULN_RESPONSE);
    let resolvePost: (value: { data: Blob }) => void = () => undefined;
    mockedAxios.post.mockReturnValue(
      new Promise<{ data: Blob }>((resolve) => {
        resolvePost = resolve;
      }),
    );

    const user = userEvent.setup();
    render(
      <ExportMenu
        customerId='CID-01'
        visibleColumns={[{ key: 'vulnerabilityId', title: 'Vulnerability ID' }]}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Export' }));
    await user.click(screen.getByRole('menuitem', { name: 'Export as PDF' }));

    await waitFor(() => {
      expect(screen.queryByRole('menuitem', { name: 'Export as PDF' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Exporting' })).toBeDisabled();
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: AlertVariant.info,
        title: 'Generating PDF',
      }),
    );

    resolvePost({ data: new Blob(['%PDF-1.4'], { type: 'application/pdf' }) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();
    });
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: AlertVariant.success,
        title: 'PDF ready',
      }),
    );
  });
});
