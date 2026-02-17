import { useCallback } from 'react';

import { useTemplateRequestApi } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useFetchHardcodedRepositories } from '../../api/fetchHardcodedRepositories';
import { lookupUrls } from 'features/createAndEditTemplate/shared/core/lookupUrls';
import { filterHardcodedUUIDs } from '../domain/filterHardcodedUUIDs';
import { ChooseHardcodedUUIDs } from '../ports';

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
