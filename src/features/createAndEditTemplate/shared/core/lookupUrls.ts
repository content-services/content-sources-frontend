import { SelectedRepositoryVersion } from 'features/createAndEditTemplate/defineContent/core/types';
import { HardcodedRepositoryUrls } from '../types/types';
import { REPOSITORY_URLS } from './repositoryURLs';

type LookupHardcodedRedhatRepoUrls = (type: SelectedRepositoryVersion) => HardcodedRepositoryUrls;

// Domain data transformation
export const lookupUrls: LookupHardcodedRedhatRepoUrls = (against) => {
  const combination = `${against.architecture}-${against.osVersion}`;
  return REPOSITORY_URLS[combination];
};
