import { useCallback } from 'react';
import { RepositoryListServerResponse } from 'features/createAndEditTemplate/shared/types/types.repository';
import useErrorNotification from 'Hooks/useErrorNotification';
import { useQueryClient } from 'react-query';
import { ContentOrigin, getContentList } from 'services/Content/ContentApi';
import { CONTENT_LIST_KEY } from 'services/Content/ContentQueries';
import {
  AllowedArchitecture,
  AllowedOSVersion,
} from 'features/createAndEditTemplate/shared/types/types';
import { formatDateForPicker } from 'helpers';
import { lookupUrls } from 'features/createAndEditTemplate/shared/core/lookupUrls';

export const useInitializeNewStore = () => {
  const fetchTemplateRepos = useFetchTemplateRepositories();

  const temporary = useCallback(async (template, setTemplate) => {
    // extract template template
    const { arch, version, repository_uuids, date, use_latest, name, description } = template;
    const {
      setArchitecture,
      setOSVersion,
      setHardcodedUUIDs,
      setAdditionalUUIDs,
      setOtherUUIDs,
      setSnapshotDate,
      setIsLatestSnapshot,
      setTitle,
      setDetail,
      resetTemplateRequestContent,
    } = setTemplate;

    resetTemplateRequestContent();

    const isHardcodedRepo = isHardcodedRepoFactory(arch, version);
    if (repository_uuids && repository_uuids.length) {
      // fetch all repositories
      const repositories = await fetchTemplateRepos(repository_uuids);

      const hardcoded = [] as string[];
      const additional = [] as string[];
      const other = [] as string[];

      // set repository uuid into its respective type
      repositories.map((repository) => {
        const { org_id, url, uuid } = repository;
        if (isRedhatRepo(org_id)) {
          if (isHardcodedRepo(url)) {
            hardcoded.push(uuid);
          } else {
            additional.push(uuid);
          }
        } else {
          other.push(uuid);
        }
      });

      setHardcodedUUIDs(hardcoded);
      setAdditionalUUIDs(additional);
      setOtherUUIDs(other);
    }

    if (arch) setArchitecture(arch as AllowedArchitecture);
    if (version) setOSVersion(version as AllowedOSVersion);

    if (use_latest === undefined) {
      setIsLatestSnapshot(false);
    } else {
      setIsLatestSnapshot(use_latest);
    }

    if (date && isNullDate(date)) {
      setSnapshotDate(date);
    } else if (date && !isNullDate(date)) {
      setSnapshotDate(formatDateForPicker(date));
    }

    if (name) setTitle(name);
    if (description) setDetail(description);
  }, []);

  return { temporary };
};

const PAGE = 1;
const LIMIT = 10;
const SORTBY = '';
const CONTENT_ORIGIN = [ContentOrigin.ALL];

export const useFetchTemplateRepositories = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();

  const fetch = async (uuids) => {
    const queryKey = [CONTENT_LIST_KEY, uuids.join('-')];

    const formattedFilterData = {
      uuids,
    };

    const queryFn = () => getContentList(PAGE, LIMIT, formattedFilterData, SORTBY, CONTENT_ORIGIN);

    const options = {
      staleTime: 20000,
    };

    try {
      const data = await queryClient.fetchQuery<RepositoryListServerResponse>(
        queryKey,
        queryFn,
        options,
      );
      return data.data;
    } catch (err) {
      errorNotifier(
        'Unable to get repositories list',
        'An error occurred',
        err,
        'content-list-error',
      );
      return [];
    }
  };

  return fetch;
};

const isHardcodedRepoFactory = (arch, version) => {
  const hardcodedRedhatRepoUrls = lookupUrls({ architecture: arch, osVersion: version });
  const isHardcodedRepo = (url) => hardcodedRedhatRepoUrls.includes(url);
  return isHardcodedRepo;
};

const isRedhatRepo = (org_id: string) => org_id === '-1';
const isNullDate = (date) => date === '0001-01-01T00:00:00Z';
