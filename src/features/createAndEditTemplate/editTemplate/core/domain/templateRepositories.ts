import { lookupUrls } from 'features/createAndEditTemplate/shared/core/lookupUrls';

export const isHardcodedRepoFactory = (arch, version) => {
  const hardcodedRedhatRepoUrls = lookupUrls({ architecture: arch, osVersion: version });
  const isHardcodedRepo = (url) => hardcodedRedhatRepoUrls.includes(url);
  return isHardcodedRepo;
};

export const isRedhatRepo = (org_id: string) => org_id === '-1';
export const isNullDate = (date) => date === '0001-01-01T00:00:00Z';
