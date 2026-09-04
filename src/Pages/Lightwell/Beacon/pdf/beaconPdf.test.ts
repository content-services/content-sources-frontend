import { formatBeaconPdfGeneratedAt, shouldUseLandscapePdf } from './beaconPdf';
import {
  createDefaultVulnerabilityColumns,
  getVisibleVulnerabilityColumns,
} from '../utils/vulnerabilityTableColumns';

describe('formatBeaconPdfGeneratedAt', () => {
  it('formats the date as a UTC display date', () => {
    expect(formatBeaconPdfGeneratedAt(new Date('2026-08-25T22:58:00Z'))).toBe('25 Aug 2026');
  });
});

describe('shouldUseLandscapePdf', () => {
  const visibleColumns = getVisibleVulnerabilityColumns(createDefaultVulnerabilityColumns());

  it('uses portrait for the default column set', () => {
    expect(shouldUseLandscapePdf(visibleColumns)).toBe(false);
  });

  it('uses portrait for narrow column sets', () => {
    expect(
      shouldUseLandscapePdf([
        { key: 'vulnerabilityId', title: 'Vulnerability ID' },
        { key: 'status', title: 'Status' },
      ]),
    ).toBe(false);
  });

  it('uses landscape when columns are wide', () => {
    const wideColumns = [
      ...visibleColumns,
      { key: 'title', title: 'Title' },
      { key: 'cvssVector', title: 'CVSS Vector' },
    ];
    expect(shouldUseLandscapePdf(wideColumns)).toBe(true);
  });

  it('uses landscape when there are many columns', () => {
    const manyColumns = [
      ...visibleColumns,
      { key: 'severity', title: 'Severity' },
      { key: 'cvss', title: 'CVSS' },
      { key: 'repository', title: 'Ecosystem' },
    ];
    expect(manyColumns).toHaveLength(7);
    expect(shouldUseLandscapePdf(manyColumns)).toBe(true);
  });
});
