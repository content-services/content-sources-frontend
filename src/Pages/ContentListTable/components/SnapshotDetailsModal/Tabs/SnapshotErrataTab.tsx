import {
  Grid,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Pagination,
  Flex,
  FlexItem,
  PaginationVariant,
  TextInput,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import Hide from '../../../../../components/Hide/Hide';
import { ContentOrigin } from '../../../../../services/Content/ContentApi';
import { createUseStyles } from 'react-jss';
import { global_BackgroundColor_100, global_Color_200 } from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useDebounce from '../../../../../Hooks/useDebounce';
import useRootPath from '../../../../../Hooks/useRootPath';
import { useAppContext } from '../../../../../middleware/AppContext';
import { useGetSnapshotErrataQuery } from '../../../../../services/Content/ContentQueries';
import ErrataTable from '../../../../../components/SharedTables/ErrataTable';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px',
    paddingBottom: '8px',
    color: global_Color_200.value,
  },
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px 16px 0',
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
});

const perPageKey = 'snapshotErrataPerPage';

export function SnapshotErrataTab() {
  const classes = useStyles();
  const { contentOrigin } = useAppContext();

  const { snapshotUUID = '' } = useParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [errataId, setErrataId] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');

  const filterValues = useMemo(() => [errataId, type, severity], [errataId, type, severity]);

  const [debouncedErrataId, debouncedType, debouncedSeverity] = useDebounce(
    filterValues,
    !errataId && !type && !severity ? 0 : 500,
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedErrataId, debouncedType, debouncedSeverity]);

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetSnapshotErrataQuery(
    snapshotUUID,
    page,
    perPage,
    debouncedErrataId,
    debouncedType,
    debouncedSeverity,
  );

  useEffect(() => {
    if (isError) {
      onClose();
    }
  }, [isError]);

  const onSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const onClose = () =>
    navigate(rootPath + (contentOrigin === ContentOrigin.REDHAT ? `?origin=${contentOrigin}` : ''));

  const {
    data: errataList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const loadingOrZeroCount = fetchingOrLoading || !count;
  return (
    <Grid className={classes.mainContainer}>
      <InputGroup className={classes.topContainer}>
        <InputGroupItem>
          <TextInput
            id='search'
            ouiaId='name_search'
            placeholder='Filter by name/synopsis'
            value={errataId}
            onChange={(_event, value) => setErrataId(value)}
          />
          <InputGroupText id='search-icon'>
            <SearchIcon />
          </InputGroupText>
        </InputGroupItem>
        <Hide hide={isLoading}>
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
        </Hide>
      </InputGroup>
      <ErrataTable
        errataList={errataList}
        isFetchingOrLoading={fetchingOrLoading}
        isLoadingOrZeroCount={loadingOrZeroCount}
        clearSearch={() => setErrataId('')}
        perPage={perPage}
      />
      <Flex className={classes.bottomContainer}>
        <FlexItem />
        <FlexItem>
          <Hide hide={isLoading}>
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
          </Hide>
        </FlexItem>
      </Flex>
    </Grid>
  );
}
