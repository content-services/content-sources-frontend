import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  Pagination,
  PaginationVariant,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { createUseStyles } from 'react-jss';
import {
  useDerivedState,
  usePagination,
  useRedhatRepositoriesApi,
  useRedhatRepositoriesState,
} from '../../store/RedhatRepositoriesStore';

const useStyles = createUseStyles({
  topBottomContainers: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
  invisible: {
    opacity: 0,
  },
});

export const TableControls = () => {
  const classes = useStyles();
  const { count, filterQuery } = useRedhatRepositoriesState();

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
  const { filterByName } = useRedhatRepositoriesApi();
  const { isLoading, filterQuery } = useRedhatRepositoriesState();

  return (
    <FlexItem>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            isDisabled={isLoading}
            id='name'
            ouiaId='filter_name'
            placeholder='Filter by name'
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
  const { filterSelected } = useRedhatRepositoriesApi();
  const { isSelectedFiltered } = useRedhatRepositoriesState();
  const { noAdditionalReposSelected } = useDerivedState();

  return (
    <FlexItem>
      <ToggleGroup aria-label='Default with single selectable'>
        <ToggleGroupItem
          text='All'
          buttonId='redhat-repositories-toggle-button'
          data-ouia-component-id='all-selected-repositories-toggle'
          isSelected={!isSelectedFiltered}
          onChange={() => filterSelected(false)}
        />
        <ToggleGroupItem
          text='Selected'
          buttonId='redhat-repositories-selected-toggle-button'
          data-ouia-component-id='redhat-selected-repositories-toggle'
          isSelected={isSelectedFiltered}
          isDisabled={noAdditionalReposSelected}
          onChange={() => filterSelected(true)}
        />
      </ToggleGroup>
    </FlexItem>
  );
};

const TopPagination = () => {
  const { turnPage, setPagination } = useRedhatRepositoriesApi();
  const { isLoading, count } = useRedhatRepositoriesState();
  const { page, perPage } = usePagination();

  return (
    <FlexItem>
      <Pagination
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
  const { turnPage, setPagination } = useRedhatRepositoriesApi();
  const { count } = useRedhatRepositoriesState();
  const { page, perPage } = usePagination();

  return (
    <Flex className={classes.topBottomContainers}>
      <FlexItem />
      <FlexItem>
        <Pagination
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
