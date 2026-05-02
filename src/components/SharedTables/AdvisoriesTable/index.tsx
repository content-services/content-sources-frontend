import { Pagination } from '@patternfly/react-core';
import {
  DataView,
  DataViewState,
  DataViewTable,
  DataViewTh,
  DataViewTrObject,
  DataViewToolbar,
  DataViewTextFilter,
  DataViewCheckboxFilter,
} from '@patternfly/react-data-view';
import { DataViewFilters } from '@patternfly/react-data-view/dist/dynamic/DataViewFilters';
import { BaseCellProps, ThProps } from '@patternfly/react-table';
import { SkeletonTableBody } from '@patternfly/react-component-groups';
import { ErrataItem } from 'services/Content/ContentApi';
import useDeepCompareEffect from 'Hooks/useDeepCompareEffect';
import { useEffect, useMemo, useState } from 'react';
import { isEmpty } from 'lodash';
import { formatDateDDMMMYYYY, reduceStringToCharsWithEllipsis } from 'helpers';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import EmptyTableDataView from 'components/EmptyTableDataView/EmptyTableDataView';
import ErrataTypeCell from './components/ErrataTypeCell';
import ErrataExpandedContent from './components/ErrataExpandedContent';
import SeverityCell from './components/SeverityCell';
import { typeFilterOptions, severityFilterOptions } from './constants';
import type useAdvisoriesTableState from './useAdvisoriesTableState';

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

interface Props extends ReturnType<typeof useAdvisoriesTableState> {
  errataList: ErrataItem[];
  count: number;
  isFetching: boolean;
  isLoading: boolean;
  ouiaIdPrefix: string;
}

export default function AdvisoriesTable({
  errataList,
  count,
  isFetching,
  isLoading,
  ouiaIdPrefix,
  filters,
  handleFilterChange,
  clearAllFiltersAndResetPage,
  isFiltered,
  perPage,
  getSortParams,
  paginationProps,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useDeepCompareEffect(() => {
    if (!isEmpty(expandedRows)) setExpandedRows({});
  }, [errataList]);

  const fetchingOrLoading = isFetching || isLoading;

  const [activeState, setActiveState] = useState<DataViewState | undefined>(DataViewState.loading);

  useEffect(() => {
    if (fetchingOrLoading) {
      setActiveState(DataViewState.loading);
    } else {
      setActiveState(count === 0 ? DataViewState.empty : undefined);
    }
  }, [count, fetchingOrLoading]);

  const dataViewColumns: DataViewTh[] = useMemo(
    () => [
      { cell: '', props: { screenReaderText: 'Row expansion' } },
      ...columnHeaders.map(({ name, width }, index) => ({
        cell: name,
        props: {
          ...(width && { width: width as BaseCellProps['width'] }),
          ...(name !== 'Name' &&
            name !== 'Synopsis' && {
              sort: adjustSortForExpandColumn(getSortParams(index)),
            }),
        },
      })),
    ],
    [getSortParams],
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
    <DataView activeState={activeState}>
      <DataViewToolbar
        className={spacing.ptMd}
        clearAllFilters={clearAllFiltersAndResetPage}
        filters={
          <DataViewFilters onChange={handleFilterChange} values={filters}>
            <DataViewTextFilter
              filterId='search'
              ouiaId={`name_search_${ouiaIdPrefix}`}
              title='Name'
              placeholder='Filter by name or synopsis'
            />
            <DataViewCheckboxFilter
              filterId='type'
              ouiaId={`filter_type_${ouiaIdPrefix}`}
              title='Type'
              placeholder='Filter by type'
              options={typeFilterOptions}
            />
            <DataViewCheckboxFilter
              filterId='severity'
              ouiaId={`filter_severity_${ouiaIdPrefix}`}
              title='Severity'
              placeholder='Filter by severity'
              options={severityFilterOptions}
            />
          </DataViewFilters>
        }
        pagination={
          <Pagination
            id='top-pagination-id'
            widgetId='topPaginationWidgetId'
            itemCount={count}
            {...paginationProps}
            isCompact
          />
        }
      />
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
              variant={isFiltered ? 'filtered' : 'zero'}
              colSpan={totalColumns}
              onClearFilters={clearAllFiltersAndResetPage}
              zeroBody='None of the added repositories contain advisories.'
            />
          ),
          loading: <SkeletonTableBody rowsCount={perPage} columnsCount={totalColumns} />,
        }}
      />
      <DataViewToolbar
        pagination={
          <Pagination
            id='bottom-pagination-id'
            widgetId='bottomPaginationWidgetId'
            itemCount={count}
            {...paginationProps}
            variant='bottom'
          />
        }
      />
    </DataView>
  );
}
