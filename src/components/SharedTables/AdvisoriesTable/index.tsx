import { DataViewTable, DataViewTh, DataViewTrObject } from '@patternfly/react-data-view';
import { BaseCellProps, ThProps } from '@patternfly/react-table';
import { SkeletonTableBody } from '@patternfly/react-component-groups';
import { ErrataItem } from 'services/Content/ContentApi';
import useDeepCompareEffect from 'Hooks/useDeepCompareEffect';
import { useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { formatDateDDMMMYYYY, reduceStringToCharsWithEllipsis } from 'helpers';
import SeverityCell from './components/SeverityCell';
import EmptyTableDataView from 'components/EmptyTableDataView/EmptyTableDataView';
import ErrataTypeCell from './components/ErrataTypeCell';
import ErrataExpandedContent from './components/ErrataExpandedContent';

interface Props {
  errataList: ErrataItem[];
  clearSearch: () => void;
  perPage: number;
  sortParams: (columnIndex: number) => ThProps['sort'];
  hasFilters: boolean;
}

const columnHeaders = [
  { name: 'Name', width: 15 },
  { name: 'Synopsis' },
  { name: 'Type', width: 15 },
  { name: 'Severity', width: 10 },
  { name: 'Publish date', width: 15 },
];

const adjustSortForExpandColumn = (sort: ThProps['sort']): ThProps['sort'] => {
  if (!sort) return sort;
  return {
    ...sort,
    columnIndex: sort.columnIndex + 1,
    sortBy: {
      ...sort.sortBy,
      index: (sort.sortBy.index ?? -1) >= 0 ? (sort.sortBy.index ?? 0) + 1 : sort.sortBy.index,
    },
    onSort: (event, index, dir, extraData) => sort.onSort?.(event, index - 1, dir, extraData),
  };
};

export default function AdvisoriesTable({
  errataList,
  clearSearch,
  perPage,
  sortParams,
  hasFilters,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useDeepCompareEffect(() => {
    if (!isEmpty(expandedRows)) setExpandedRows({});
  }, [errataList]);

  const dataViewColumns: DataViewTh[] = useMemo(
    () => [
      { cell: '', props: { screenReaderText: 'Row expansion' } },
      ...columnHeaders.map(({ name, width }, index) => ({
        cell: name,
        props: {
          ...(width && { width: width as BaseCellProps['width'] }),
          ...(name !== 'Name' &&
            name !== 'Synopsis' && {
              sort: adjustSortForExpandColumn(sortParams(index)),
            }),
        },
      })),
    ],
    [sortParams],
  );

  const deduped = useMemo(
    () => [...new Map(errataList.map((e) => [e.errata_id, e])).values()],
    [errataList],
  );

  const rows: DataViewTrObject[] = useMemo(() => {
    const result: DataViewTrObject[] = [];

    deduped.forEach(
      (
        {
          errata_id,
          summary,
          description,
          issued_date,
          updated_date,
          type,
          severity,
          reboot_suggested,
        },
        rowIndex,
      ) => {
        result.push({
          id: errata_id,
          row: [
            {
              cell: null,
              props: {
                expand: {
                  rowIndex,
                  isExpanded: Boolean(expandedRows[rowIndex]),
                  onToggle: () =>
                    setExpandedRows((prev) => ({ ...prev, [rowIndex]: !prev[rowIndex] })),
                  expandId: 'expandable-',
                },
              },
            },
            { cell: errata_id },
            { cell: reduceStringToCharsWithEllipsis(summary, 70) },
            { cell: <ErrataTypeCell type={type} /> },
            { cell: <SeverityCell severity={severity} /> },
            { cell: formatDateDDMMMYYYY(issued_date) },
          ],
        });

        if (expandedRows[rowIndex]) {
          result.push({
            id: `${errata_id}-detail`,
            row: [
              { cell: null },
              {
                cell: (
                  <ErrataExpandedContent
                    errataId={errata_id}
                    description={description}
                    updatedDate={updated_date}
                    rebootSuggested={reboot_suggested}
                  />
                ),
                props: { colSpan: 3, dataLabel: `${rowIndex}-content-label` },
              },
            ],
          });
        }
      },
    );

    return result;
  }, [deduped, expandedRows]);

  const totalColumns = columnHeaders.length + 1;

  return (
    <DataViewTable
      aria-label='errata table'
      ouiaId='errata_table'
      variant='compact'
      columns={dataViewColumns}
      rows={rows}
      bodyStates={{
        empty: (
          <EmptyTableDataView
            ouiaId='errata_table'
            itemName='advisories'
            variant={hasFilters ? 'filtered' : 'zero'}
            colSpan={totalColumns}
            onClearFilters={clearSearch}
            zeroBody='None of the added repositories contain advisories.'
          />
        ),
        loading: <SkeletonTableBody rowsCount={perPage} columnsCount={totalColumns} />,
      }}
    />
  );
}
