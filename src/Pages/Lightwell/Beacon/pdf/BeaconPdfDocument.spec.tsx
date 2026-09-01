jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Page: ({ children }: { children: React.ReactNode }) => <div data-testid='page'>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  StyleSheet: { create: <T extends Record<string, object>>(s: T): T => s },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';

import BeaconPdfDocument, { computeBeaconMeta } from './BeaconPdfDocument';
import type { BeaconPdfColumn, BeaconPdfData } from './beaconPdf';
import type { Vulnerability } from '../types';

const mockVulnerabilities: Vulnerability[] = [
  {
    uuid: 'v1',
    vulnerabilityId: 'CVE-2024-0001',
    purl: 'pkg:maven/org/test@1.0',
    componentName: 'test-lib',
    componentVersion: '1.0.0',
    title: 'Test vulnerability',
    cwe: 'CWE-79',
    description: 'A test vulnerability',
    severity: 'Critical',
    cvss: 9.8,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
    exploitTested: false,
    reproducerIncluded: false,
    stage: 'Submitted',
    language: 'java',
    submittedDate: '1 Jan 2024',
    lastUpdated: '15 Jan 2024',
    ageDays: 14,
    duplicate: false,
  },
  {
    uuid: 'v2',
    vulnerabilityId: 'CVE-2024-0002',
    purl: 'pkg:npm/other@2.0',
    componentName: 'other-lib',
    componentVersion: '2.0.0',
    title: 'Another vulnerability',
    cwe: 'CWE-89',
    description: 'Another test vulnerability',
    severity: 'Important',
    cvss: 7.5,
    exploitTested: true,
    reproducerIncluded: false,
    stage: 'Fix in Progress',
    language: 'javascript',
    submittedDate: '5 Feb 2024',
    lastUpdated: '20 Feb 2024',
    ageDays: 15,
    duplicate: false,
  },
];

const defaultColumns: BeaconPdfColumn[] = [
  { key: 'vulnerabilityId', title: 'Vulnerability ID' },
  { key: 'component', title: 'Package' },
  { key: 'lastUpdated', title: 'Last Updated' },
  { key: 'stage', title: 'Status' },
];

function buildData(vulns: Vulnerability[] = mockVulnerabilities): BeaconPdfData {
  return {
    vulnerabilities: vulns,
    meta: computeBeaconMeta(vulns),
  };
}

describe('computeBeaconMeta', () => {
  it('computes counts from vulnerabilities', () => {
    const meta = computeBeaconMeta(mockVulnerabilities);
    expect(meta.count).toBe(2);
    expect(meta.criticalCount).toBe(1);
    expect(meta.stageCounts).toEqual({ Submitted: 1, 'Fix in Progress': 1 });
  });

  it('returns zeros for empty input', () => {
    const meta = computeBeaconMeta([]);
    expect(meta.count).toBe(0);
    expect(meta.criticalCount).toBe(0);
    expect(meta.stageCounts).toEqual({});
  });
});

describe('BeaconPdfDocument', () => {
  it('renders the report title and customer info', () => {
    render(
      <BeaconPdfDocument
        data={buildData()}
        columns={defaultColumns}
        customerId='CID-01'
        generatedAt='1 Sep 2026'
      />,
    );

    expect(screen.getByText(/Lightwell Vulnerability Report/)).toBeInTheDocument();
    expect(screen.getByText(/Customer ID: CID-01/)).toBeInTheDocument();
    expect(screen.getAllByText(/1 Sep 2026/)).toHaveLength(2);
  });

  it('renders vulnerability data in table cells', () => {
    render(
      <BeaconPdfDocument
        data={buildData()}
        columns={defaultColumns}
        customerId='CID-01'
        generatedAt='1 Sep 2026'
      />,
    );

    expect(screen.getByText('CVE-2024-0001')).toBeInTheDocument();
    expect(screen.getByText('CVE-2024-0002')).toBeInTheDocument();
    expect(screen.getByText('test-lib 1.0.0')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    render(
      <BeaconPdfDocument
        data={buildData()}
        columns={defaultColumns}
        customerId='CID-01'
        generatedAt='1 Sep 2026'
      />,
    );

    expect(screen.getByText('Vulnerability ID')).toBeInTheDocument();
    expect(screen.getByText('Package')).toBeInTheDocument();
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders with empty vulnerabilities list', () => {
    render(
      <BeaconPdfDocument
        data={buildData([])}
        columns={defaultColumns}
        customerId='CID-01'
        generatedAt='1 Sep 2026'
      />,
    );

    expect(screen.getByText(/Lightwell Vulnerability Report/)).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });

  it('shows stage counts in the pipeline', () => {
    render(
      <BeaconPdfDocument
        data={buildData()}
        columns={defaultColumns}
        customerId='CID-01'
        generatedAt='1 Sep 2026'
      />,
    );

    expect(screen.getByText('By Stage')).toBeInTheDocument();
    expect(screen.getByText('Classified')).toBeInTheDocument();
    expect(screen.getByText('Validation')).toBeInTheDocument();
    expect(screen.getByText('Lightwell Network')).toBeInTheDocument();
  });
});
