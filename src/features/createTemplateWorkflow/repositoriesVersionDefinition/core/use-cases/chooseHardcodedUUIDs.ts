import { useCallback } from 'react';
import { useFetchHardcodedRepositories } from '../../api/fetchHardcodedRepositories';
import { lookupUrls } from '../domain/lookupUrls';
import { ChooseHardcodedUUIDs } from '../ports';
import { filterHardcodedUUIDs } from '../domain/filterHardcodedUUIDs';
import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';

export const useChooseHardcodedUUIDs = () => {
  const fetchHardcodedRepositories = useFetchHardcodedRepositories();
  const { setHardcodedUUIDs } = useTemplateRequestApi();

  const chooseHardcodedRedhatUUIDs: ChooseHardcodedUUIDs = async (type) => {
    const hardcodedRedhatRepoUrls = lookupUrls(type);
    const repositories = await fetchHardcodedRepositories({
      architecture: type.architecture,
      osVersion: type.osVersion,
    });
    const uuids = filterHardcodedUUIDs(repositories, hardcodedRedhatRepoUrls);
    setHardcodedUUIDs(uuids);
  };

  return useCallback(chooseHardcodedRedhatUUIDs, []);
};
