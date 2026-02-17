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
import { useCustomRepositoriesApi } from '../../../../createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore';

const useStyles = createUseStyles({
  topBottomContainers: {
    justifyContent: 'space-between',
    height: 'fit-content',
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
    selectedCustomRepos,
  } = useCustomRepositoriesApi();

  return (
    <Flex className={classes.topBottomContainers}>
      <Flex>
        <FlexItem>
          <InputGroup>
            <InputGroupItem isFill>
              <TextInput
                isDisabled={isLoading}
                id='name-url'
                ouiaId='filter_name_url'
                placeholder='Filter by name/url'
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
                buttonId='custom-repositories-toggle-button'
                data-ouia-component-id='all-selected-repositories-toggle'
                isSelected={!toggled}
                onChange={() => setToggled(false)}
              />
              <ToggleGroupItem
                text='Selected'
                buttonId='custom-repositories-selected-toggle-button'
                data-ouia-component-id='custom-selected-repositories-toggle'
                isSelected={toggled}
                isDisabled={selectedCustomRepos.size === 0}
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

  const { count, perPage, page, onSetPage, onPerPageSelect } = useCustomRepositoriesApi();

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
