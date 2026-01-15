import { FullRepository } from 'features/createTemplateWorkflow/shared/types.repository';

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
  repositoriesList: FullRepository[];
  isLoading: boolean;
  isFetching: boolean;
};
