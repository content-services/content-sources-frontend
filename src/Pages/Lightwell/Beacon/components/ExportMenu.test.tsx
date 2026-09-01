import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlertVariant } from '@patternfly/react-core';

import { ExportMenu } from './ExportMenu';
import { getVulnerabilities } from 'services/Lightwell/BeaconApi';

const mockToBlob = jest.fn();

jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn(() => ({ toBlob: mockToBlob })),
  Document: 'Document',
  Page: 'Page',
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: <T extends Record<string, object>>(s: T): T => s },
}));

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

beforeEach(() => {
  (useNotification as jest.Mock).mockReturnValue({ notify });
  notify.mockClear();
  mockToBlob.mockReset();
  mockToBlob.mockResolvedValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));
  (getVulnerabilities as jest.Mock).mockReset();
  URL.createObjectURL = jest.fn().mockReturnValue('blob:mock');
  URL.revokeObjectURL = jest.fn();
});

describe('ExportMenu PDF', () => {
  it('generates a PDF client-side via @react-pdf/renderer and triggers a blob download', async () => {
    (getVulnerabilities as jest.Mock).mockResolvedValue({
      vulnerabilities: [
        {
          uuid: 'v1',
          vulnerabilityId: 'CVE-2024-0001',
          severity: 'Critical',
          stage: 'Submitted',
          componentName: 'pkg',
          componentVersion: '1.0',
          lastUpdated: '2024-01-01',
          title: 'Test',
          cvss: 9.8,
          language: 'java',
          submittedDate: '2024-01-01',
          duplicate: false,
          purl: '',
          cwe: '',
          description: '',
          exploitTested: false,
          reproducerIncluded: false,
          ageDays: 10,
        },
      ],
      meta: { count: 1, criticalCount: 1, stageCounts: { Submitted: 1 } },
    });

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
      expect(mockToBlob).toHaveBeenCalledTimes(1);
    });

    expect(getVulnerabilities).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock');
  });

  it('closes the menu and shows generating feedback while the PDF is in progress', async () => {
    let resolveBlob: (value: Blob) => void = () => undefined;
    mockToBlob.mockReturnValue(
      new Promise<Blob>((resolve) => {
        resolveBlob = resolve;
      }),
    );

    (getVulnerabilities as jest.Mock).mockResolvedValue({
      vulnerabilities: [],
      meta: { count: 0, criticalCount: 0, stageCounts: {} },
    });

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

    resolveBlob(new Blob(['%PDF-1.4'], { type: 'application/pdf' }));

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
