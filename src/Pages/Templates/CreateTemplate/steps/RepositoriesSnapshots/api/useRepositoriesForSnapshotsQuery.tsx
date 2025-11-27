import useErrorNotification from 'Hooks/useErrorNotification';
import { useQueryClient } from 'react-query';
import {
  ContentListResponse,
  ContentOrigin,
  FilterData,
  getContentList,
} from 'services/Content/ContentApi';
import { REPOSITORIES_FOR_SNAPSHOTS_LIST_KEY } from './constants';

type AllRepositoriesQuery = {
  page: number;
  limit: number;
  filterData: FilterData;
  sortedBy: string;
  contentOrigin?: ContentOrigin[];
  select?: (response: ContentListResponse) => ContentListResponse;
};

const PAGE = 1;
const LIMIT = 100;
const SORTBY = '';
const CONTENT_ORIGIN = [ContentOrigin.ALL];

export const useFetchRepositoriesForSnapshots = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();

  return async (filterData) => {
    const queryKey = [REPOSITORIES_FOR_SNAPSHOTS_LIST_KEY, ...filterData];
    const queryFn = () =>
      getContentList(PAGE, LIMIT, { uuids: filterData }, SORTBY, CONTENT_ORIGIN);

    const options = {
      staleTime: 20000,
    };

    try {
      const data = await queryClient.fetchQuery<ContentListResponse>(queryKey, queryFn, options);
      console.log('FETCH SNAPSHOTS', data);

      return data.data;
    } catch (err) {
      errorNotifier(
        'Unable to get repositories list',
        'An error occurred',
        err,
        'content-list-error',
      );
    }
  };
};
