import type { DataViewFilterOption } from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';

export interface ErrataFilters {
  search: string;
  type: string[];
  severity: string[];
}

export const initialErrataFilters: ErrataFilters = { search: '', type: [], severity: [] };

export const typeFilterOptions: DataViewFilterOption[] = [
  { label: 'Security', value: 'Security' },
  { label: 'Bugfix', value: 'Bugfix' },
  { label: 'Enhancement', value: 'Enhancement' },
  { label: 'Other', value: 'Other' },
];

export const severityFilterOptions: DataViewFilterOption[] = [
  { label: 'Critical', value: 'Critical' },
  { label: 'Important', value: 'Important' },
  { label: 'Moderate', value: 'Moderate' },
  { label: 'Low', value: 'Low' },
  { label: 'None', value: 'None' },
];

export const errataSortColumns = [
  { name: 'Name', sortAttribute: 'name' },
  { name: 'Synopsis', sortAttribute: 'synopsis' },
  { name: 'Type', sortAttribute: 'type' },
  { name: 'Severity', sortAttribute: 'severity' },
  { name: 'Publish date', sortAttribute: 'issued_date' },
];
