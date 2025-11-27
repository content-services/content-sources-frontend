import { useCallback } from 'react';
import { useFetchHardcodedRepositories } from '../../api/fetchHardcodedRepositories';
import { useTemplateRequestApi } from '../../../../store/TemplateRequestStore';
import { lookupUrls } from '../domain/lookupUrls';
import { ChooseHardcodedRepositories } from '../ports';
import { filterHardcodedUUIDs } from '../domain/filterHardcodedUUIDs';

export const useChooseHardcodedRepositories = () => {
  const fetchHardcodedRepositories = useFetchHardcodedRepositories();
  const { setHardcodedUUIDs } = useTemplateRequestApi();

  const chooseHardcodedRedhatRepositories: ChooseHardcodedRepositories = async (type) => {
    const hardcodedRedhatRepoUrls = lookupUrls(type);
    const repositories = await fetchHardcodedRepositories({
      architecture: type.architecture,
      osVersion: type.osVersion,
    });
    const uuids = filterHardcodedUUIDs(repositories, hardcodedRedhatRepoUrls);
    setHardcodedUUIDs(uuids);
  };

  return useCallback(chooseHardcodedRedhatRepositories, []);
};
