import {
  Button,
  Flex,
  FlexItem,
  Grid,
  Modal,
  ModalVariant,
  OnPerPageSelect,
  OnSetPage,
  Pagination,
  PaginationVariant,
  TextInput,
} from '@patternfly/react-core';
import {
  InnerScrollContainer,
  TableComposable,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr,
} from '@patternfly/react-table';
import {
  global_BackgroundColor_100,
  global_secondary_color_100,
  global_Color_200,
} from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import Hide from '../../../Hide/Hide';
import { ContentItem, PackageItem } from '../../../../services/Content/ContentApi';
import { useGetPackagesQuery } from '../../../../services/Content/ContentQueries';
import { SearchIcon } from '@patternfly/react-icons';
import useDebounce from '../../../../services/useDebounce';
import EmptyPackageState from './components/EmptyPackageState';

const useStyles = createUseStyles({
  description: {
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
    padding: '16px 24px',
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
  searchInput: {
    paddingRight: '35px',
    marginRight: '-23px',
  },
  searchIcon: {
    color: global_secondary_color_100.value,
    position: 'relative',
    top: '3px',
    left: '-5px',
    pointerEvents: 'none',
  },
});

interface Props {
  rowData: ContentItem;
  closeModal: () => void;
}

export default function PackageModal({
  rowData: { name, uuid, package_count: packageCount },
  closeModal,
}: Props) {
  const classes = useStyles();
  const storedPerPage = Number(localStorage.getItem('packagePerPage')) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const columnHeaders = ['Name', 'Version', 'Release', 'Arch'];

  const columnSortAttributes = ['name', 'version', 'release', 'arch'];

  const sortString = useMemo(
    () => columnSortAttributes[activeSortIndex] + ':' + activeSortDirection,
    [activeSortIndex, activeSortDirection],
  );

  const debouncedSearchQuery = useDebounce(searchQuery);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, sortString]);

  const {
    isLoading,
    isFetching,
    error,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetPackagesQuery(uuid, packageCount, page, perPage, debouncedSearchQuery, sortString);

  const onSetPage: OnSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect: OnPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload

    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem('packagePerPage', newPerPage.toString());
  };

  const sortParams = (columnIndex: number, isDisabled: boolean): ThProps['sort'] | undefined => {
    if (isDisabled) return;
    return {
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
    };
  };

  // Error is caught in the wrapper component
  if (isError) throw error;

  const {
    data: packageList = [],
    meta: { count = 0 },
  } = data;

  const fetchingOrLoading = isFetching || isLoading;

  const notLoadingZeroCount = !fetchingOrLoading && !count;

  return (
    <Modal
      key={uuid}
      hasNoBodyWrapper
      aria-label='RPM package modal'
      variant={ModalVariant.medium}
      title='Packages'
      description={
        <p>
          View list of packages for <b>{name}</b>
        </p>
      }
      isOpen
      onClose={closeModal}
      footer={
        <Button key='close' variant='secondary' onClick={closeModal}>
          Close
        </Button>
      }
    >
      <InnerScrollContainer>
        <Grid className={classes.mainContainer}>
          <Flex className={classes.topContainer}>
            <Flex>
              <TextInput
                id='search'
                ouiaId='name_search'
                placeholder='Filter by name'
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                className={classes.searchInput}
              />
              <SearchIcon size='sm' className={classes.searchIcon} />
            </Flex>
            <FlexItem>
              <Hide hide={notLoadingZeroCount}>
                <Pagination
                  id='top-pagination-id'
                  widgetId='topPaginationWidgetId'
                  perPageComponent='button'
                  itemCount={count}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  isCompact
                  onPerPageSelect={onPerPageSelect}
                />
              </Hide>
            </FlexItem>
          </Flex>
          <Hide hide={!fetchingOrLoading}>
            <Grid className={classes.mainContainer}>
              <SkeletonTable
                rowSize={perPage}
                colSize={columnHeaders.length}
                variant={TableVariant.compact}
              />
            </Grid>
          </Hide>
          <Hide hide={fetchingOrLoading}>
            <TableComposable
              aria-label='Custom repositories table'
              ouiaId='packages_table'
              variant='compact'
            >
              <Thead>
                <Tr>
                  {columnHeaders.map((columnHeader, index) => (
                    <Th
                      key={columnHeader + '_column'}
                      sort={sortParams(index, notLoadingZeroCount)}
                    >
                      {columnHeader}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {packageList.map(({ name, version, release, arch }: PackageItem, index: number) => (
                  <Tr key={name + index}>
                    <Td>{name}</Td>
                    <Td>{version}</Td>
                    <Td>{release}</Td>
                    <Td>{arch}</Td>
                  </Tr>
                ))}
                <Hide hide={!notLoadingZeroCount}>
                  <EmptyPackageState clearSearch={() => setSearchQuery('')} />
                </Hide>
              </Tbody>
            </TableComposable>
          </Hide>
          <Flex className={classes.bottomContainer}>
            <FlexItem />
            <FlexItem>
              <Hide hide={notLoadingZeroCount}>
                <Pagination
                  id='bottom-pagination-id'
                  widgetId='bottomPaginationWidgetId'
                  perPageComponent='button'
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
      </InnerScrollContainer>
    </Modal>
  );
}
