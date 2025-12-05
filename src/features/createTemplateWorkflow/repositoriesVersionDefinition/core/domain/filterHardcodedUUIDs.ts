import { HardcodedRepositoryUrls } from '../types';
import { FullRepository } from '../../../shared/types.repository';
import { HardcodedUuid } from 'features/createTemplateWorkflow/shared/types.simple';

type FilterHardcodedUUIDs = (
  repositories: FullRepository[],
  urls: HardcodedRepositoryUrls,
) => HardcodedUuid[];

export const filterHardcodedUUIDs: FilterHardcodedUUIDs = (repositories, urls) => {
  if (!repositories) return [];
  return repositories.filter((repo) => urls.includes(repo.url)).map((repo) => repo.uuid);
};
