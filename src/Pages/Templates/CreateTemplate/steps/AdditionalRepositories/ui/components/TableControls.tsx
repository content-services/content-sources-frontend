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
import Hide from 'components/Hide/Hide';
import { createUseStyles } from 'react-jss';
import { SearchIcon } from '@patternfly/react-icons';
import {
  useAdditionalRepositoriesApi,
  useAdditionalRepositoriesState,
  useDerivedState,
  usePaginationState,
} from '../../store/AdditionalRepositoriesStore';

const useStyles = createUseStyles({
  topBottomContainers: {
    justifyContent: 'space-between',
    height: 'fit-content',
  },
});

export const TableControls = () => {
  const classes = useStyles();
  const { isLoading, count, filterQuery } = useAdditionalRepositoriesState();

  const noFetchedRepositories = count === 0;
  const areControlsHidden = (noFetchedRepositories && !filterQuery) || isLoading;

  return (
    <Hide hide={areControlsHidden}>
      <Flex className={classes.topBottomContainers}>
        <Flex>
          <SearchBox />
          <FilterToggleGroup />
        </Flex>
        <TopPagination />
      </Flex>
    </Hide>
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
            onChange={filterByName}
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
  const { count, isSelectedFiltered } = useAdditionalRepositoriesState();
  const { filterSelected } = useAdditionalRepositoriesApi();

  const noFetchedRepositories = count === 0;

  return (
    <Hide hide={noFetchedRepositories}>
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
    </Hide>
  );
};

const TopPagination = () => {
  const { turnPage, setPagination } = useAdditionalRepositoriesApi();
  const { isLoading, count } = useAdditionalRepositoriesState();
  const { page, perPage } = usePaginationState();

  const noFetchedRepositories = count === 0;

  return (
    <Hide hide={noFetchedRepositories}>
      <FlexItem>
        <PFPagination
          id='top-pagination-id'
          widgetId='topPaginationWidgetId'
          isDisabled={isLoading}
          itemCount={count}
          perPage={perPage}
          page={page}
          onSetPage={turnPage}
          isCompact
          onPerPageSelect={setPagination}
        />
      </FlexItem>
    </Hide>
  );
};

export const BottomPagination = () => {
  const classes = useStyles();

  const { count } = useAdditionalRepositoriesState();
  const { turnPage, setPagination } = useAdditionalRepositoriesApi();
  const { page, perPage } = usePaginationState();

  const noFetchedRepositories = count === 0;

  return (
    <Hide hide={noFetchedRepositories}>
      <Flex className={classes.topBottomContainers}>
        <FlexItem />
        <FlexItem>
          <PFPagination
            id='bottom-pagination-id'
            widgetId='bottomPaginationWidgetId'
            itemCount={count}
            perPage={perPage}
            page={page}
            onSetPage={turnPage}
            variant={PaginationVariant.bottom}
            onPerPageSelect={setPagination}
          />
        </FlexItem>
      </Flex>
    </Hide>
  );
};
