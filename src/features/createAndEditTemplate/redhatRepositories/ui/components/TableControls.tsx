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
import Hide from 'components/Hide/Hide';
import { createUseStyles } from 'react-jss';
import { useRedhatRepositoriesApi } from '../../../../createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore';

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
  const {
    countIsZero,
    searchQuery,
    isLoading,
    setSearchQuery,
    toggled,
    setToggled,
    count,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
    noAdditionalRepos,
  } = useRedhatRepositoriesApi();

  return (
    <Flex className={classes.topBottomContainers}>
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                isDisabled={isLoading}
                id='name'
                ouiaId='filter_name'
                placeholder='Filter by name'
                value={searchQuery}
                onChange={(_event, value) => setSearchQuery(value)}
                type='search'
                customIcon={<SearchIcon />}
              />
            </InputGroupItem>
          </InputGroup>
        </FlexItem>
        <Hide hide={countIsZero}>
          <FlexItem>
            <ToggleGroup aria-label='Default with single selectable'>
              <ToggleGroupItem
                text='All'
                buttonId='redhat-repositories-toggle-button'
                data-ouia-component-id='all-selected-repositories-toggle'
                isSelected={!toggled}
                onChange={() => setToggled(false)}
              />
              <ToggleGroupItem
                text='Selected'
                buttonId='redhat-repositories-selected-toggle-button'
                data-ouia-component-id='redhat-selected-repositories-toggle'
                isSelected={toggled}
                isDisabled={noAdditionalRepos}
                onChange={() => setToggled(true)}
              />
            </ToggleGroup>
          </FlexItem>
        </Hide>
      </Flex>
      <Hide hide={countIsZero}>
        <FlexItem>
          <Pagination
            id='top-pagination-id'
            widgetId='topPaginationWidgetId'
            isDisabled={isLoading}
            itemCount={count}
            perPage={perPage}
            page={page}
            onSetPage={onSetPage}
            isCompact
            onPerPageSelect={onPerPageSelect}
          />
        </FlexItem>
      </Hide>
    </Flex>
  );
};

export const TableBottomPagination = () => {
  const classes = useStyles();
  const { count, perPage, page, onSetPage, onPerPageSelect } = useRedhatRepositoriesApi();
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
          onSetPage={onSetPage}
          variant={PaginationVariant.bottom}
          onPerPageSelect={onPerPageSelect}
        />
      </FlexItem>
    </Flex>
  );
};
