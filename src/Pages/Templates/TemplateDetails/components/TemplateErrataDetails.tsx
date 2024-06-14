import {
  Flex,
  FlexItem,
  Grid,
  InputGroup,
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { global_BackgroundColor_100, global_Color_200 } from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';
import AdvisoriesTable from 'components/SharedTables/AdvisoriesTable';
import { useQueryClient } from 'react-query';
import {
  FETCH_TEMPLATE_KEY,
  useFetchTemplateErrataQuery,
} from 'services/Templates/TemplateQueries';
import type { TemplateItem } from 'services/Templates/TemplateApi';
import type { ThProps } from '@patternfly/react-table';
import SnapshotErrataFilters from 'Pages/Repositories/ContentListTable/components/SnapshotDetailsModal/Tabs/SnapshotErrataFilters';
import Loader from 'components/Loader';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px', // 4px on the title bottom padding makes this the "standard" 16 total padding
    paddingBottom: '8px',
    color: global_Color_200.value,
  },
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px',
    height: 'fit-content',
    flexDirection: 'row!important',
    minHeight: '68px', // Prevents compacting of the search box (patternfly bug?)
  },
  topContainerWithFilterHeight: { extend: 'topContainer', minHeight: '128px' },
  bottomContainer: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
});

const perPageKey = 'TemplateAdvisoriesPerPage';
const defaultFilterState = { search: '', type: [] as string[], severity: [] as string[] };

export default function TemplateErrataTab() {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { templateUUID: uuid } = useParams();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [filterData, setFilterData] = useState(defaultFilterState);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(-1);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const templatesData = queryClient.getQueryData<TemplateItem>([FETCH_TEMPLATE_KEY, uuid]);

  const hasTemplatesData = !!templatesData;

  const hasFilters = useMemo(
    () => filterData.search || filterData.severity.length || filterData.type.length,
    [filterData],
  );

  useEffect(() => {
    setPage(1);
  }, [filterData]);

  const columnSortAttributes = ['name', 'synopsis', 'type', 'severity', 'issued_date'];

  const sortString = useMemo(
    () =>
      activeSortIndex === -1
        ? ''
        : columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const {
    isLoading,
    isFetching,
    error,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useFetchTemplateErrataQuery(
    uuid as string,
    page,
    perPage,
    filterData.search,
    filterData.type,
    filterData.severity,
    sortString,
  );

  const onSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const {
    data: errataList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const loadingOrZeroCount = fetchingOrLoading || !count;

  const sortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  if (!hasTemplatesData || isLoading) {
    return <Loader />;
  }

  if (isError) {
    throw error;
  }

  return (
    <Grid className={classes.mainContainer}>
      <InputGroup
        className={hasFilters ? classes.topContainerWithFilterHeight : classes.topContainer}
      >
        <SnapshotErrataFilters
          isLoading={isLoading}
          filterData={filterData}
          setFilterData={setFilterData}
        />
        <Pagination
          id='top-pagination-id'
          widgetId='topPaginationWidgetId'
          itemCount={count}
          perPage={perPage}
          page={page}
          onSetPage={onSetPage}
          isCompact
          onPerPageSelect={onPerPageSelect}
        />
      </InputGroup>
      <AdvisoriesTable
        errataList={errataList}
        isFetchingOrLoading={fetchingOrLoading}
        isLoadingOrZeroCount={loadingOrZeroCount}
        clearSearch={() => setFilterData(defaultFilterState)}
        perPage={perPage}
        sortParams={sortParams}
      />
      <Flex className={classes.bottomContainer}>
        <FlexItem />
        <FlexItem>
          <Pagination
            id='bottom-pagination-id'
            widgetId='bottomPaginationWidgetId'
            itemCount={count}
            perPage={perPage}
            page={page}
            onSetPage={onSetPage}
            variant={PaginationVariant.bottom}
            onPerPageSelect={onPerPageSelect}
          />
        </FlexItem>
      </Flex>
    </Grid>
  );
}
