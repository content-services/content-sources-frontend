import { render, screen } from '@testing-library/react';
import CoverageReport from './CoverageReport';
import { useCoverageReport } from './hooks/useCoverageReport';
import {
  defaultCoverageReportItem,
  defaultCoverageReportPackagesItem,
  ReactQueryTestWrapper,
} from 'testingHelpers';
import { useLightwellNavigateTo } from 'Hooks/Lightwell/navigation/useLightwellNavigateTo';
import { useCoverageReportPackagesQuery } from 'services/Lightwell/CoverageReportsQueries';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    requestPdf: jest.fn(),
  }),
}));

jest.mock('./hooks/useCoverageReport');

jest.mock('@scalprum/react-core', () => ({
  useRemoteHook: jest.fn(),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: jest.fn(() => true),
}));

jest.mock('Hooks/Lightwell/navigation/useLightwellRootPath', () => ({
  useLightwellRootPath: jest.fn(() => '/lightwell'),
}));

// Charts (including the bar chart's screen-reader table) are tested in their own files
jest.mock('./charts/EcosystemBarChart', () => ({ __esModule: true, default: () => null }));
jest.mock('./charts/MatchDonutChart', () => ({ __esModule: true, default: () => null }));

jest.mock('services/Lightwell/CoverageReportsQueries', () => ({
  ...jest.requireActual('services/Lightwell/CoverageReportsQueries'),
  useCoverageReportPackagesQuery: jest.fn(),
}));

const mockNavigateTo = jest.fn();

jest.mock('Hooks/Lightwell/navigation/useLightwellNavigateTo', () => ({
  useLightwellNavigateTo: jest.fn(),
}));

const renderCoverageReport = () =>
  render(
    <ReactQueryTestWrapper>
      <CoverageReport />
    </ReactQueryTestWrapper>,
  );

describe('CoverageReport', () => {
  beforeEach(() => {
    (useCoverageReport as jest.Mock).mockReturnValue({
      filename: 'test-sbom.json',
      report: defaultCoverageReportItem,
      isLoading: false,
      startOver: jest.fn(),
    });
    (useCoverageReportPackagesQuery as jest.Mock).mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      data: {
        data: defaultCoverageReportPackagesItem,
        meta: { count: 3, limit: 20, offset: 0 },
      },
    });
    (useLightwellNavigateTo as jest.Mock).mockReturnValue({
      navigateTo: mockNavigateTo,
    });
  });

  it('shows "New analysis" when a report is complete', () => {
    renderCoverageReport();
    expect(screen.getByRole('button', { name: 'New analysis' })).toBeInTheDocument();
  });

  it('displays the match analysis title and manifest filename', () => {
    renderCoverageReport();
    expect(
      screen.getByRole('heading', { name: 'Match analysis for manifest test-sbom.json' }),
    ).toBeInTheDocument();
  });

  it('displays coverage summary with in-network percentage and match counts', () => {
    renderCoverageReport();
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /75% of packages match the Lightwell Network catalog/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Exact match')).toBeInTheDocument();
    expect(screen.getByText('Partial match')).toBeInTheDocument();
  });

  it('displays the CVEs fixed card with per-severity counts', () => {
    renderCoverageReport();
    expect(screen.getByRole('heading', { level: 3, name: 'CVEs fixed' })).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('hides the CVEs fixed card when every severity count is zero', () => {
    (useCoverageReport as jest.Mock).mockReturnValue({
      filename: 'test-sbom.json',
      report: {
        ...defaultCoverageReportItem,
        cve_summary: { critical: 0, important: 0, moderate: 0, low: 0 },
      },
      isLoading: false,
      startOver: jest.fn(),
    });

    renderCoverageReport();

    expect(screen.queryByRole('heading', { level: 3, name: 'CVEs fixed' })).not.toBeInTheDocument();
  });

  it('displays ecosystem breakdown with package counts', () => {
    renderCoverageReport();
    expect(screen.getByText('Packages by ecosystem')).toBeInTheDocument();
    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs.some((p) => p.textContent?.includes('75 of 100 packages'))).toBe(true);
  });
});
