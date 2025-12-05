import {
  IsFilterSelected,
  Page,
  ParamsToGetRedhatRepos,
  PerPage,
  RedhatReposQueryResponse,
} from './types';
import { SortTableProps } from 'features/createTemplateWorkflow/shared/use-cases/useSortReposTable';
import { RepositoryName } from 'features/createTemplateWorkflow/shared/types.repository';
import { AdditionalUuid } from 'features/createTemplateWorkflow/shared/types.simple';

// ================
// ports input

export type ToggleAdditionalRepository = (uuid: AdditionalUuid) => void;

export type FilterSelected = (filter: IsFilterSelected) => void;
export type FilterByName = (name: RepositoryName) => void;
export type TurnPage = (newPage: Page) => void;
export type Paginate = (newPerPage: PerPage, newPage: Page) => void;
export type SortRepositoryTableProps = SortTableProps;

// ================
// both input / output ports (react query)

export type GetRedhatRepositories = (params: ParamsToGetRedhatRepos) => RedhatReposQueryResponse;
