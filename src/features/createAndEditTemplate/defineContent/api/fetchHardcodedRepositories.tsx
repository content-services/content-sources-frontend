import { RepositoryListServerResponse } from 'features/createAndEditTemplate/shared/types/types.repository';
import useErrorNotification from 'Hooks/useErrorNotification';
import { useQueryClient } from 'react-query';
import { ContentOrigin, getContentList } from 'services/Content/ContentApi';
import { CONTENT_LIST_KEY } from 'services/Content/ContentQueries';
import { FetchHardcodedRepositories } from '../core/ports';

const PAGE = 1;
const LIMIT = 10;
const SORTBY = '';
const CONTENT_ORIGIN = [ContentOrigin.REDHAT];

export const useFetchHardcodedRepositories = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();

  const fetch: FetchHardcodedRepositories = async (filterData) => {
    const { architecture, osVersion } = filterData;
    const queryKey = [CONTENT_LIST_KEY, architecture, osVersion];

    const formattedFilterData = {
      availableForArch: architecture,
      availableForVersion: osVersion,
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
