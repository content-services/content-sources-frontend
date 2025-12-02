import {
  FullRepository,
  RepositoryCount,
} from 'features/createTemplateWorkflow/shared/types.repository';
import {
  FilterByName,
  FilterSelected,
  Paginate,
  SortRepositoryTableProps,
  ToggleAdditionalRepository,
  TurnPage,
} from '../core/ports';
import { Page, PerPage } from '../core/types';
import { HardcodedUuid, RedhatUUID } from 'features/createTemplateWorkflow/shared/types.simple';

export type AdditionalReposApiType = {
  turnPage: TurnPage;
  setPagination: Paginate;
  toggleCheckedAdditional: ToggleAdditionalRepository;
  filterByName: FilterByName;
  filterSelected: FilterSelected;
  clearFilterByName: () => void;
};

export type AdditionalReposState = {
  isLoading: boolean;
  count: RepositoryCount;
  isSelectedFiltered: boolean;
  filterQuery: string;
  repositoriesList: FullRepository[];
};

export type DerivedAdditionalStateType = {
  isInRedhatUUIDs: (uuid: RedhatUUID) => boolean;
  areAdditionalReposToSelect: boolean;
  isInHardcodedUUIDs: (uuid: HardcodedUuid) => boolean;
  noAdditionalReposSelected: boolean;
};

export type PaginationStateType = {
  page: Page;
  perPage: PerPage;
};

export type SortTableType = {
  setSortProps: SortRepositoryTableProps;
};
