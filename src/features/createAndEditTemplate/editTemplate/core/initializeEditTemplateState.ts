import { useCallback } from 'react';

import { isHardcodedRepoFactory, isNullDate, isRedhatRepo } from './templateRepositories';
import { useFetchTemplateRepositories } from '../../../createAndEditTemplate/editTemplate/api/fetchTemplateRepos';
import { useTemplateRequestApi } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { formatDateForPicker } from 'helpers';

export const useInitializeEditTemplateState = () => {
  const fetchTemplateRepos = useFetchTemplateRepositories();
  const {
    setArchitecture,
    setOSVersion,
    setSnapshotDate,
    setIsLatestSnapshot,
    setTitle,
    setDetail,
    setHardcodedUUIDs,
    setAdditionalUUIDs,
    setOtherUUIDs,
  } = useTemplateRequestApi();

  const initializeEditTemplateState = useCallback(async (template) => {
    // extract template template
    const { arch, version, repository_uuids, date, use_latest, name, description } = template;
    const isHardcodedRepo = isHardcodedRepoFactory(arch, version);

    // fetch all repositories
    const repositories = await fetchTemplateRepos(repository_uuids);

    // set repository uuid into its respective type
    repositories.map((repository) => {
      const { org_id, url, uuid } = repository;
      if (isRedhatRepo(org_id)) {
        if (isHardcodedRepo(url)) {
          setHardcodedUUIDs((previous) => [...previous, uuid]);
        } else {
          setAdditionalUUIDs((previous) => [...previous, uuid]);
        }
      } else {
        setOtherUUIDs((previous) => [...previous, uuid]);
      }
    });

    // set rest of template data to context
    setArchitecture(arch);
    setOSVersion(version);

    if (isNullDate(date)) {
      setSnapshotDate('');
    } else {
      setSnapshotDate(formatDateForPicker(date));
    }

    setIsLatestSnapshot(use_latest);
    setTitle(name);
    setDetail(description);
  }, []);

  return { initializeEditTemplateState };
};
