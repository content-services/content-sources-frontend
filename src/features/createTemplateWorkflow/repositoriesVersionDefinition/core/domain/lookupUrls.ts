import { HardcodedRepositoryUrls, SelectedRepositoryVersion } from '../types';
import { REPOSITORY_URLS } from './constants';

type LookupHardcodedRedhatRepoUrls = (type: SelectedRepositoryVersion) => HardcodedRepositoryUrls;

// Domain data transformation
export const lookupUrls: LookupHardcodedRedhatRepoUrls = (against) => {
  const combination = `${against.architecture}-${against.osVersion}`;
  return REPOSITORY_URLS[combination];
};
