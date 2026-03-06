import { HardcodedUUID, RedhatUUID } from 'features/createAndEditTemplate/shared/types/types';
import {
  FilterByName,
  FilterSelected,
  Page,
  Paginate,
  PerPage,
  SortRepositoryTableProps,
  TurnPage,
} from '../core/types';
import {
  FullRepository,
  RepositoryCount,
} from 'features/createAndEditTemplate/shared/types/types.repository';
import { ToggleSelectedAdditionalRepository } from '../core/ports';

// types
export type RedhatRepositoriesApiType = {
  turnPage: TurnPage;
  setPagination: Paginate;
  toggleSelected: ToggleSelectedAdditionalRepository;
  filterByName: FilterByName;
  filterSelected: FilterSelected;
  clearFilterByName: () => void;
};

export type RedhatRepositoriesStateType = {
  isLoading: boolean;
  count: RepositoryCount;
  isSelectedFiltered: boolean;
  filterQuery: string;
  repositoriesList: FullRepository[];
};

export type DerivedStateType = {
  isInRedhatUUIDs: (uuid: RedhatUUID) => boolean;
  isInHardcodedUUIDs: (uuid: HardcodedUUID) => boolean;
  areReposAvailableToSelect: boolean;
  noAdditionalReposSelected: boolean;
};

export type PaginationStateType = {
  page: Page;
  perPage: PerPage;
};

export type SortTableType = {
  setSortProps: SortRepositoryTableProps;
};

// initials
export const initialApi = {
  turnPage: () => {},
  setPagination: () => {},
  toggleSelected: () => {},
  filterByName: () => {},
  clearFilterByName: () => {},
  filterSelected: () => {},
};

export const initialState = {
  isLoading: false,
  count: 0,
  isSelectedFiltered: false,
  filterQuery: '',
  repositoriesList: [],
};

export const initialDerived = {
  isInRedhatUUIDs: () => false,
  isInHardcodedUUIDs: () => false,
  areReposAvailableToSelect: false,
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

export const initialSort = {
  setSortProps: (index) => ({
    onSort: () => {},
    sortBy: sortBy,
    columnIndex: index,
  }),
};
