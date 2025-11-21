import { AllowedArchitecture, AllowedOSVersion } from '../../../core/types';
import { RepositoryListServerResponse } from '../../shared/types.server';

export type Page = number;
export type PerPage = number;
export type SortDirection = 'asc' | 'desc';
export type FilterQuery = string;
export type IsFilterSelected = boolean;

export type RepositoryTitle = string;
export type RepositoryTableColumnIndex = number;

export type RedhatRepository = 'Redhat';
// type CommunityRepository = 'Community';
// type CustomRepository = 'Custom';
// type OtherRepository = CustomRepository | CommunityRepository;
// type RepositoryCategory = RedhatRepository | OtherRepository;

export type ParamsToGetRedhatRepos = {
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repoCategory: RedhatRepository;
  page: Page;
  limit: PerPage;
  sortedBy: SortDirection;
  filterByName: FilterQuery;
  filterSelected: IsFilterSelected;
};
export type RedhatReposQueryResponse = {
  data: RepositoryListServerResponse;
  isLoading: boolean;
};
