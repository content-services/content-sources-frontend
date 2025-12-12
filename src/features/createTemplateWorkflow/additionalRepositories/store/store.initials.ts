export const initialAdditionalApi = {
  turnPage: () => {},
  setPagination: () => {},
  toggleCheckedAdditional: () => {},
  filterByName: () => {},
  clearFilterByName: () => {},
  filterSelected: () => {},
};

export const initialAdditionalState = {
  isLoading: false,
  count: 0,
  isSelectedFiltered: false,
  filterQuery: '',
  repositoriesList: [],
};

export const initialDerivedState = {
  isInRedhatUUIDs: () => false,
  areAdditionalReposToSelect: false,
  isInHardcodedUUIDs: () => false,
  noAdditionalReposSelected: true,
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
