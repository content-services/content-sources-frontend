import {
  FullRepository,
  RepositoryName,
} from 'features/createTemplateWorkflow/shared/types.repository';

type FilterRepositoriesNames = (repositories: FullRepository[]) => RepositoryName[];

export const filterRepositoriesNames: FilterRepositoriesNames = (repositories) =>
  repositories.map(({ name }) => name);
