import { useState } from 'react';
import {
  AlertVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Spinner,
  type MenuToggleElement,
} from '@patternfly/react-core';
import axios from 'axios';

import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';
import {
  getVulnerabilities,
  type BeaconData,
  type BeaconVulnerabilityFilters,
} from 'services/Lightwell/BeaconApi';
import type { Vulnerability } from '../types';

import { exportToCsv, exportToJson } from '../utils/exportUtils';
import type { VulnerabilityTableColumn } from '../utils/vulnerabilityTableColumns';

type ExportMenuProps = {
  customerId?: string;
  filters?: BeaconVulnerabilityFilters;
  visibleColumns: Pick<VulnerabilityTableColumn, 'key' | 'title'>[];
};

type ExportFormat = 'csv' | 'json' | 'pdf';

const EXPORT_PAGE_SIZE = 200;

export async function fetchAllFilteredVulnerabilities(
  customerId: string,
  filters?: BeaconVulnerabilityFilters,
): Promise<BeaconData> {
  const vulnerabilities: Vulnerability[] = [];
  let meta: BeaconData['meta'] | undefined;
  let offset = 0;

  while (true) {
    const result = await getVulnerabilities(customerId, filters, {
      limit: EXPORT_PAGE_SIZE,
      offset,
    });

    vulnerabilities.push(...result.vulnerabilities);
    meta = result.meta;

    if (result.vulnerabilities.length < EXPORT_PAGE_SIZE) {
      break;
    }

    offset += result.vulnerabilities.length;
  }

  return {
    vulnerabilities,
    meta: meta ?? { count: 0, criticalCount: 0, stageCounts: {} },
  };
}

export function ExportMenu({ customerId, filters, visibleColumns }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  const handleExport = async (format: ExportFormat) => {
    if (!customerId || isExporting) {
      return;
    }

    setIsOpen(false);
    setIsExporting(true);
    try {
      if (format === 'pdf') {
        notify({
          variant: AlertVariant.info,
          title: 'Generating PDF',
          description: 'Your PDF is being generated. The download will start when it is ready.',
        });
        const data = await fetchAllFilteredVulnerabilities(customerId, filters);
        const response = await axios.post(
          '/pdf/beacon',
          { customerId, visibleColumns, data },
          { responseType: 'blob' },
        );
        const url = URL.createObjectURL(response.data as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lightwell-beacon-${customerId}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        notify({
          variant: AlertVariant.success,
          title: 'PDF ready',
          description: 'Your download should start shortly.',
        });
        return;
      }

      const { vulnerabilities } = await fetchAllFilteredVulnerabilities(customerId, filters);

      if (format === 'csv') {
        exportToCsv(vulnerabilities, `lightwell-vulnerabilities.csv`);
      } else {
        exportToJson(vulnerabilities, `lightwell-vulnerabilities.json`);
      }
    } catch (err) {
      errorNotifier(
        'Error exporting vulnerabilities',
        'Unable to export vulnerabilities',
        err,
        'beacon-export-error',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!isExporting) {
          setIsOpen(open);
        }
      }}
      popperProps={{ position: 'right' }}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOpen(!isOpen)}
          isExpanded={isOpen}
          isDisabled={!customerId || isExporting}
          variant='secondary'
          ouiaId='lightwell-beacon-export-toggle'
          aria-busy={isExporting}
          icon={isExporting ? <Spinner size='sm' aria-hidden='true' /> : undefined}
        >
          {isExporting ? 'Exporting' : 'Export'}
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem
          key='csv'
          isDisabled={isExporting}
          onClick={() => {
            void handleExport('csv');
          }}
        >
          Export as CSV
        </DropdownItem>
        <DropdownItem
          key='json'
          isDisabled={isExporting}
          onClick={() => {
            void handleExport('json');
          }}
        >
          Export as JSON
        </DropdownItem>
        <DropdownItem
          key='pdf'
          isDisabled={isExporting}
          onClick={() => {
            void handleExport('pdf');
          }}
        >
          Export as PDF
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}
