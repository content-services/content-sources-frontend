import {
  HardcodedRepositoryUrls,
  HardcodedUUID,
} from 'features/createAndEditTemplate/shared/types/types';
import { FullRepository } from 'features/createAndEditTemplate/shared/types/types.repository';

type FilterHardcodedUUIDs = (
  repositories: FullRepository[],
  urls: HardcodedRepositoryUrls,
) => HardcodedUUID[];

export const filterHardcodedUUIDs: FilterHardcodedUUIDs = (repositories, urls) => {
  if (!repositories) return [];
  return repositories.filter((repo) => urls.includes(repo.url)).map((repo) => repo.uuid);
};
