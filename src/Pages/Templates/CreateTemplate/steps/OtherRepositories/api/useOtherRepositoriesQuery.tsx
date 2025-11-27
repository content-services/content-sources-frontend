import useErrorNotification from 'Hooks/useErrorNotification';
import { useQuery } from 'react-query';
import {
  ContentListResponse,
  ContentOrigin,
  FilterData,
  getContentList,
} from 'services/Content/ContentApi';
import { OTHER_REPOSITORIES_LIST_KEY } from './constants';

type OtherRepositoriesQuery = {
  page: number;
  limit: number;
  filterData: FilterData;
  sortedBy: string;
  contentOrigin?: ContentOrigin[];
  select?: (response: ContentListResponse) => ContentListResponse;
  isEnabled: boolean;
};

export const useOtherRepositoriesQuery = ({
  page,
  limit,
  filterData,
  sortedBy,
  contentOrigin = [ContentOrigin.CUSTOM, ContentOrigin.COMMUNITY],
  select = undefined,
  isEnabled,
}: OtherRepositoriesQuery) => {
  const errorNotifier = useErrorNotification();

  const queryKey = [
    OTHER_REPOSITORIES_LIST_KEY,
    filterData.availableForArch,
    filterData.availableForVersion,
  ];
  const queryFn = () => getContentList(page, limit, filterData, sortedBy, contentOrigin);

  const onError = (err) => {
    errorNotifier(
      'Unable to get repositories list',
      'An error occurred',
      err,
      'content-list-error',
    );
  };

  const options = {
    onError: onError,
    refetchInterval: undefined,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: 20000,
    select,
    enabled: isEnabled,
  };

  const { isLoading, isFetching, data } = useQuery<ContentListResponse>(queryKey, queryFn, options);

  return { isLoading, isFetching, data };
};
