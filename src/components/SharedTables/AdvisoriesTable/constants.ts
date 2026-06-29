export interface ErrataFilters {
  search: string;
  type: string[];
  severity: string[];
}

export const initialErrataFilters: ErrataFilters = { search: '', type: [], severity: [] };

export const columnsConfig = [
  { name: 'Name', sortAttribute: 'name', width: 15 as const },
  { name: 'Synopsis', sortAttribute: 'synopsis' },
  { name: 'Type', sortAttribute: 'type', width: 15 as const },
  { name: 'Severity', sortAttribute: 'severity', width: 10 as const },
  { name: 'Publish date', sortAttribute: 'issued_date', width: 15 as const },
];
