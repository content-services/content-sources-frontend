import { RepositoryName } from 'features/createTemplateWorkflow/shared/types.repository';
import {
  IsFilterSelected,
  OtherReposQueryResponse,
  Page,
  ParamsToGetOtherRepos,
  PerPage,
} from './types';
import { SortTableProps } from 'features/createTemplateWorkflow/shared/use-cases/useSortReposTable';
import { OtherUuid } from 'features/createTemplateWorkflow/shared/types.simple';

// ================
// ports input

export type ToggleOtherRepository = (uuid: OtherUuid) => void;

export type FilterSelected = (filter: IsFilterSelected) => void;
export type FilterByName = (name: RepositoryName) => void;
export type TurnPage = (newPage: Page) => void;
export type Paginate = (newPerPage: PerPage, newPage: Page) => void;
export type SortRepositoryTableProps = SortTableProps;
export type RefreshRepositories = () => void;

// ================
// both input / output ports (react query)

export type GetOtherRepositories = (params: ParamsToGetOtherRepos) => OtherReposQueryResponse;
