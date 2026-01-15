import { createUseStyles } from 'react-jss';

import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Pagination as PFPagination,
  PaginationVariant,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

import {
  useOtherRepositoriesApi,
  useOtherRepositoriesState,
  usePagination,
} from '../../store/OtherRepositoriesStore';

const useStyles = createUseStyles({
  topBottomContainers: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
  invisible: {
    opacity: 0,
  },
  reduceTrailingMargin: {
    marginRight: '12px!important',
  },
});

export const TableControls = () => {
  const classes = useStyles();
  const { count, filterQuery } = useOtherRepositoriesState();

  const noRepositories = count === 0;
  const isFilterSet = filterQuery !== '';
  const noReposForVersionCombination = noRepositories && !isFilterSet;

  if (noReposForVersionCombination) {
    return null;
  }

  return (
    <Flex className={classes.topBottomContainers}>
      <Flex>
        <SearchBox />
        <FilterToggleGroup />
      </Flex>
      <TopPagination />
    </Flex>
  );
};

const SearchBox = () => {
  const { filterByName } = useOtherRepositoriesApi();
  const { isLoading, filterQuery } = useOtherRepositoriesState();

  return (
    <FlexItem>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            isDisabled={isLoading}
            id='name-url'
            ouiaId='filter_name_url'
            placeholder='Filter by name/url'
            value={filterQuery}
            onChange={(_, value) => filterByName(value)}
            type='search'
            customIcon={<SearchIcon />}
          />
        </InputGroupItem>
      </InputGroup>
    </FlexItem>
  );
};

const FilterToggleGroup = () => {
  const { isSelectedFiltered, noOtherReposSelected } = useOtherRepositoriesState();
  const { filterSelected } = useOtherRepositoriesApi();

  return (
    <FlexItem>
      <ToggleGroup aria-label='Default with single selectable'>
        <ToggleGroupItem
          text='All'
          buttonId='custom-repositories-toggle-button'
          data-ouia-component-id='all-selected-repositories-toggle'
          isSelected={!isSelectedFiltered}
          onChange={() => filterSelected(false)}
        />
        <ToggleGroupItem
          text='Selected'
          buttonId='custom-repositories-selected-toggle-button'
          data-ouia-component-id='custom-selected-repositories-toggle'
          isSelected={isSelectedFiltered}
          isDisabled={noOtherReposSelected}
          onChange={() => filterSelected(true)}
        />
      </ToggleGroup>
    </FlexItem>
  );
};

const TopPagination = () => {
  const { turnPage, setPagination } = useOtherRepositoriesApi();
  const { isLoading, count } = useOtherRepositoriesState();
  const { page, perPage } = usePagination();

  return (
    <FlexItem>
      <PFPagination
        id='top-pagination-id'
        widgetId='topPaginationWidgetId'
        isDisabled={isLoading}
        itemCount={count}
        perPage={perPage}
        page={page}
        onSetPage={(_, newPage: number) => turnPage(newPage)}
        isCompact
        onPerPageSelect={(_, newPerPage: number, newPage: number) =>
          setPagination(newPerPage, newPage)
        }
      />
    </FlexItem>
  );
};

export const TableBottomPagination = () => {
  const classes = useStyles();

  const { count } = useOtherRepositoriesState();
  const { turnPage, setPagination } = useOtherRepositoriesApi();
  const { page, perPage } = usePagination();

  return (
    <Flex className={classes.topBottomContainers}>
      <FlexItem />
      <FlexItem>
        <PFPagination
          id='bottom-pagination-id'
          widgetId='bottomPaginationWidgetId'
          itemCount={count}
          perPage={perPage}
          page={page}
          onSetPage={(_, newPage: number) => turnPage(newPage)}
          variant={PaginationVariant.bottom}
          onPerPageSelect={(_, newPerPage: number, newPage: number) =>
            setPagination(newPerPage, newPage)
          }
        />
      </FlexItem>
    </Flex>
  );
};
