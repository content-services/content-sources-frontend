export const initialOtherApi = {
  toggleCheckedOther: () => {},
  turnPage: () => {},
  setPagination: () => {},
  filterByName: () => {},
  filterSelected: () => {},
  clearFilterByName: () => {},
  refetchOtherRepositories: () => {},
};

export const initialOtherState = {
  isLoading: false,
  isFetching: false,
  count: 0,
  repositoriesList: [],
  filterQuery: '',
  isSelectedFiltered: false,
  isInOtherUUIDs: () => false,
  areOtherReposToSelect: false,
  noOtherReposSelected: true,
};

export const initialPagination = {
  page: 1,
  perPage: 20,
};

const sortBy = {
  index: 0,
  direction: 'asc' as const,
  defaultDirection: 'asc' as const,
};

export const initialSortTable = {
  setSortProps: (index) => ({
    onSort: () => {},
    sortBy: sortBy,
    columnIndex: index,
  }),
};
