import {
  FullRepository,
  RepositoryName,
} from 'features/createAndEditTemplate/shared/types/types.repository';

type FilterRepositoriesNames = (repositories: FullRepository[]) => RepositoryName[];

export const filterRepositoriesNames: FilterRepositoriesNames = (repositories) =>
  repositories.map(({ name }) => name);
