import { HardcodedUuid } from '../../../../core/types';
import { HardcodedRepositoryUrls } from '../types';
import { RepositoryOnServer } from '../../../shared/types.server';

type FilterHardcodedUUIDs = (
  repositories: RepositoryOnServer[],
  urls: HardcodedRepositoryUrls,
) => HardcodedUuid[];

export const filterHardcodedUUIDs: FilterHardcodedUUIDs = (repositories, urls) => {
  if (!repositories) return [];
  return repositories.filter((repo) => urls.includes(repo.url)).map((repo) => repo.uuid);
};
