import type { PDFRequestPayload } from '@redhat-cloud-services/types';

import {
  getCoverageReportPackages,
  type CoverageReportPackage,
  type CoverageReportPackageFilters,
} from 'services/Lightwell/CoverageReportsApi';

import { buildCoveragePdfPayload } from '../pdf/coveragePdf';
import { fetchAllPages } from '../../utils/exportUtils';
import { ExportMenu as ExportMenuBase } from '../../components/ExportMenu';

type ExportMenuProps = {
  uuid?: string;
  filename?: string;
  filters?: CoverageReportPackageFilters;
  // When false, CVE columns are empty across the report, so they are stripped
  // from the CSV/JSON rows and omitted from the PDF.
  includeCveData?: boolean;
};

export function fetchAllCoveragePackages(
  uuid: string,
  filters?: CoverageReportPackageFilters,
): Promise<CoverageReportPackage[]> {
  return fetchAllPages((pageSize, pageIndex) =>
    getCoverageReportPackages(uuid, pageIndex + 1, pageSize, filters).then(({ data }) => data),
  );
}

// Drop the CVE fields so empty data is not exported; see includeCveData.
function stripCveData(
  pkg: CoverageReportPackage,
): Omit<CoverageReportPackage, 'cve_count' | 'cve_range'> {
  const rest: Partial<CoverageReportPackage> = { ...pkg };
  delete rest.cve_count;
  delete rest.cve_range;
  return rest as Omit<CoverageReportPackage, 'cve_count' | 'cve_range'>;
}

export function ExportMenu({ uuid, filename, filters, includeCveData = true }: ExportMenuProps) {
  return (
    <ExportMenuBase
      isReady={Boolean(uuid)}
      ouiaId='lightwell-coverage-export-toggle'
      csvFilename={`lightwell-match-analysis-${uuid}.csv`}
      jsonFilename={`lightwell-match-analysis-${uuid}.json`}
      fetchRows={async () => {
        const packages = await fetchAllCoveragePackages(uuid!, filters);
        return includeCveData ? packages : packages.map(stripCveData);
      }}
      buildPdfRequest={async () => ({
        filename: `lightwell-match-analysis-${uuid}.pdf`,
        payload: buildCoveragePdfPayload({
          uuid: uuid!,
          filename,
          filters,
          includeCveData,
        }) as unknown as PDFRequestPayload,
      })}
      errorNotification={{
        title: 'Error exporting report',
        message: 'Unable to export the match analysis report',
        id: 'coverage-export-error',
      }}
    />
  );
}
