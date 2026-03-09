import { HardcodedRepositoryUrls } from '../types/types';
import { REPOSITORY_URLS } from './repositoryURLs';
import { SelectedSystemConfiguration } from 'features/createAndEditTemplate/defineContent/core/types';

type LookupHardcodedRedhatRepoUrls = (type: SelectedSystemConfiguration) => HardcodedRepositoryUrls;

// Domain data transformation
export const lookupUrls: LookupHardcodedRedhatRepoUrls = (against) => {
  const combination = `${against.architecture}-${against.osVersion}`;
  return REPOSITORY_URLS[combination];
};
