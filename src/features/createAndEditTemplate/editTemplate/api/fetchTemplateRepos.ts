import { RepositoryListServerResponse } from 'features/createAndEditTemplate/shared/types/types.repository';
import useErrorNotification from 'Hooks/useErrorNotification';
import { useQueryClient } from 'react-query';
import { ContentOrigin, getContentList } from 'services/Content/ContentApi';
import { CONTENT_LIST_KEY } from 'services/Content/ContentQueries';

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
