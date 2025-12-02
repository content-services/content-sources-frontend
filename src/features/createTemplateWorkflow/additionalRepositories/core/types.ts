import { FullRepository } from '../../shared/types.repository';

export type Page = number;
export type PerPage = number;

export type SortDirection = 'name:asc' | 'name:desc';

export type FilterQuery = string;
export type IsFilterSelected = boolean;
export type IsQueryEnabled = boolean;

export type ParamsToGetRedhatRepos = {
  page: Page;
  perPage: PerPage;
  sortedBy: SortDirection;
  filterQuery: FilterQuery;
  isSelectedFiltered: IsFilterSelected;
  isEnabled: IsQueryEnabled;
};
export type RedhatReposQueryResponse = {
  repositoriesList: FullRepository[];
  isLoading: boolean;
};
