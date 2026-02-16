import useErrorNotification from 'Hooks/useErrorNotification';
import { useQueryClient } from 'react-query';
import { ContentOrigin, getContentList } from 'services/Content/ContentApi';
import { FetchRepositoriesForSnapshots } from '../core/ports';
import { RepositoryListServerResponse } from 'features/createAndEditTemplate/shared/types/types.repository';
import { REPOSITORIES_FOR_SNAPSHOTS_LIST_KEY } from 'services/Content/ContentQueries';

const PAGE = 1;
const LIMIT = 100;
const SORTBY = '';
const CONTENT_ORIGIN = [ContentOrigin.ALL];

export const useFetchRepositoriesForSnapshots = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();

  const fetchRepositoriesForSnapshots: FetchRepositoriesForSnapshots = async (filterData) => {
    const queryKey = [REPOSITORIES_FOR_SNAPSHOTS_LIST_KEY, ...filterData];
    const queryFn = () =>
      getContentList(PAGE, LIMIT, { uuids: filterData }, SORTBY, CONTENT_ORIGIN);

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

  return fetchRepositoriesForSnapshots;
};
