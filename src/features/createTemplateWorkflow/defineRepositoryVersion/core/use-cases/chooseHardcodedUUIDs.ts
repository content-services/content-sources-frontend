import { useCallback } from 'react';
import { useFetchHardcodedRepositories } from '../../api/fetchHardcodedRepositories';
import { lookupUrls } from '../domain/lookupUrls';
import { ChooseHardcodedUUIDs } from '../ports';
import { filterHardcodedUUIDs } from '../domain/filterHardcodedUUIDs';
import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';

export const useChooseHardcodedUUIDs = () => {
  const fetchHardcodedRepositories = useFetchHardcodedRepositories();
  const { setHardcodedUUIDs } = useTemplateRequestApi();

  const chooseHardcodedRedhatUUIDs: ChooseHardcodedUUIDs = async (version) => {
    const repositories = await fetchHardcodedRepositories({
      architecture: version.architecture,
      osVersion: version.osVersion,
    });
    const hardcodedRedhatRepoUrls = lookupUrls(version);
    const uuids = filterHardcodedUUIDs(repositories, hardcodedRedhatRepoUrls);
    setHardcodedUUIDs(uuids);
  };

  return useCallback(chooseHardcodedRedhatUUIDs, []);
};
