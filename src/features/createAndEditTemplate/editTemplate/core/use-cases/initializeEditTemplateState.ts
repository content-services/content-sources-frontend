import { useCallback } from 'react';

import { useFetchTemplateRepositories } from '../../api/fetchTemplateRepos';
import { useTemplateRequestApi } from 'features/createAndEditTemplate/workflow/store/TemplateStore';

import { formatDateForPicker } from 'helpers';
import { isHardcodedRepoFactory, isNullDate, isRedhatRepo } from '../domain/templateRepositories';

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

    // fetch all repositories relevant for the template
    const repositories = await fetchTemplateRepos(repository_uuids);

    const isHardcodedRepo = isHardcodedRepoFactory(arch, version);

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
