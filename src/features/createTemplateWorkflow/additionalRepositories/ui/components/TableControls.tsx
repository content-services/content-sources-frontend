import {
  Flex,
  FlexItem,
  InputGroup,
  InputGroupItem,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Pagination as PFPagination,
  PaginationVariant,
} from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { SearchIcon } from '@patternfly/react-icons';
import {
  useAdditionalRepositoriesApi,
  useAdditionalRepositoriesState,
  useDerivedState,
  usePagination,
} from '../../store/AdditionalRepositoriesStore';

const useStyles = createUseStyles({
  topBottomContainers: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
});

export const TableControls = () => {
  const classes = useStyles();
  const { count } = useAdditionalRepositoriesState();

  const noRepositories = count === 0;

  if (noRepositories) {
    return (
      <Flex className={classes.topBottomContainers}>
        <Flex>
          <SearchBox />
        </Flex>
      </Flex>
    );
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
  const { filterByName } = useAdditionalRepositoriesApi();
  const { isLoading, filterQuery } = useAdditionalRepositoriesState();

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
  const { noAdditionalReposSelected } = useDerivedState();
  const { isSelectedFiltered } = useAdditionalRepositoriesState();
  const { filterSelected } = useAdditionalRepositoriesApi();

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
  const { turnPage, setPagination } = useAdditionalRepositoriesApi();
  const { isLoading, count } = useAdditionalRepositoriesState();
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

  const { count } = useAdditionalRepositoriesState();
  const { turnPage, setPagination } = useAdditionalRepositoriesApi();
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
