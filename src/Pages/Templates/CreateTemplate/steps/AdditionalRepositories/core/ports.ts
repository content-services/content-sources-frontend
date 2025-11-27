// ================
// ports input

import { AdditionalUuid } from '../../../core/types';
import {
  IsFilterSelected,
  Page,
  ParamsToGetRedhatRepos,
  PerPage,
  RedhatReposQueryResponse,
  RepositoryTableColumnIndex,
  RepositoryTitle,
  SortDirection,
} from './types';

// ================
// ports input

export type ToggleAdditionalRepository = (uuid: AdditionalUuid) => void;

export type FilterSelected = (filter: IsFilterSelected) => void;

export type FilterByName = (name: RepositoryTitle) => void;

export type TurnPage = (newPage: Page) => void;

export type Paginate = (newPerPage: PerPage, newPage: Page) => void;

export type Sort = (column: RepositoryTableColumnIndex, direction: SortDirection) => void;

// ================
// both input / output (react query)

export type GetRedhatRepositories = (params: ParamsToGetRedhatRepos) => RedhatReposQueryResponse;

// export type QueryRedhatRepositories =
