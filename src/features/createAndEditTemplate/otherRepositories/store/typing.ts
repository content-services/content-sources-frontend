import { OtherUUID } from 'features/createAndEditTemplate/shared/types/types';
import {
  FullRepository,
  RepositoryCount,
} from 'features/createAndEditTemplate/shared/types/types.repository';
import {
  FilterByName,
  FilterSelected,
  Page,
  Paginate,
  PerPage,
  SortRepositoryTableProps,
  TurnPage,
} from '../core/types';
import { RefreshRepositories, ToggleSelectedOtherRepository } from '../core/ports';

export type CustomRepositoriesApiType = {
  toggleSelected: ToggleSelectedOtherRepository;
  turnPage: TurnPage;
  setPagination: Paginate;
  filterByName: FilterByName;
  filterSelected: FilterSelected;
  clearFilterByName: () => void;
  refetchOtherRepositories: RefreshRepositories;
};

export type CustomRepositoriesStateType = {
  isLoading: boolean;
  isFetching: boolean;
  count: RepositoryCount;
  repositoriesList: FullRepository[];
  filterQuery: string;
};

export type DerivedStateType = {
  isSelectedFiltered: boolean;
  isInOtherUUIDs: (uuid: OtherUUID) => boolean;
  areOtherReposToSelect: boolean;
  noOtherReposSelected: boolean;
};

export type PaginationType = {
  page: Page;
  perPage: PerPage;
};

export type SortTableType = {
  setSortProps: SortRepositoryTableProps;
};

export const initialApi = {
  toggleSelected: () => {},
  turnPage: () => {},
  setPagination: () => {},
  filterByName: () => {},
  filterSelected: () => {},
  clearFilterByName: () => {},
  refetchOtherRepositories: () => {},
};

export const initialState = {
  isLoading: false,
  isFetching: false,
  count: 0,
  repositoriesList: [],
  filterQuery: '',
};

export const initialDerived = {
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

export const initialSort = {
  setSortProps: (index) => ({
    onSort: () => {},
    sortBy: sortBy,
    columnIndex: index,
  }),
};
