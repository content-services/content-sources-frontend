import {
  FullRepository,
  RepositoryCount,
} from 'features/createTemplateWorkflow/shared/types.repository';
import {
  FilterByName,
  FilterSelected,
  Paginate,
  RefreshRepositories,
  SortRepositoryTableProps,
  ToggleOtherRepository,
  TurnPage,
} from '../core/ports';
import { Page, PerPage } from '../core/types';
import { OtherUuid } from 'features/createTemplateWorkflow/shared/types.simple';

export type OtherReposApiType = {
  toggleCheckedOther: ToggleOtherRepository;
  turnPage: TurnPage;
  setPagination: Paginate;
  filterByName: FilterByName;
  filterSelected: FilterSelected;
  clearFilterByName: () => void;
  refetchOtherRepositories: RefreshRepositories;
};

export type OtherReposState = {
  isLoading: boolean;
  isFetching: boolean;
  count: RepositoryCount;
  repositoriesList: FullRepository[];
  filterQuery: string;
  isSelectedFiltered: boolean;
  isInOtherUUIDs: (uuid: OtherUuid) => boolean;
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
