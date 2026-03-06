import { SortTableProps } from 'features/createAndEditTemplate/shared/hooks/useSortReposTable';
import {
  RepositoryListServerResponse,
  RepositoryName,
} from 'features/createAndEditTemplate/shared/types/types.repository';

export type Page = number;
export type PerPage = number;

export type SortDirection =
  | 'name:asc'
  | 'name:desc'
  | 'status:asc'
  | 'status:desc'
  | 'package_count:asc'
  | 'package_count:desc';

export type FilterQuery = string;
export type IsFilterSelected = boolean;
export type IsQueryEnabled = boolean;

export type ParamsToGetOtherRepos = {
  page: Page;
  perPage: PerPage;
  sortedBy: SortDirection;
  filterQuery: FilterQuery;
  isSelectedFiltered: IsFilterSelected;
  isEnabled: IsQueryEnabled;
};
export type OtherReposQueryResponse = {
  repositories: RepositoryListServerResponse;
  isLoading: boolean;
  isFetching: boolean;
};

export type FilterSelected = (filter: IsFilterSelected) => void;
export type FilterByName = (name: RepositoryName) => void;
export type TurnPage = (newPage: Page) => void;
export type Paginate = (newPerPage: PerPage, newPage: Page) => void;
export type SortRepositoryTableProps = SortTableProps;
