import useErrorNotification from 'Hooks/useErrorNotification';
import { useQuery } from 'react-query';
import { ContentOrigin, FilterData, getContentList } from 'services/Content/ContentApi';
import { OTHER_REPOSITORIES_LIST_KEY } from 'services/Content/ContentQueries';
import { RepositoryListServerResponse } from 'features/createAndEditTemplate/shared/types/types.repository';

type OtherRepositoriesQuery = {
  page: number;
  perPage: number;
  filterData: FilterData;
  sortedBy: string;
  contentOrigin?: ContentOrigin[];
  select?: (response: RepositoryListServerResponse) => RepositoryListServerResponse;
  isEnabled: boolean;
  filterQuery: string;
  filterSelected?: string[];
};

export const useOtherRepositoriesQuery = ({
  page,
  perPage,
  filterData,
  sortedBy,
  contentOrigin = [ContentOrigin.CUSTOM, ContentOrigin.COMMUNITY],
  select = undefined,
  isEnabled,
  filterQuery,
  filterSelected,
}: OtherRepositoriesQuery) => {
  const errorNotifier = useErrorNotification();

  const queryKey = [
    OTHER_REPOSITORIES_LIST_KEY,
    filterData.availableForArch,
    filterData.availableForVersion,
    page,
    perPage,
    sortedBy,
    filterQuery,
    filterSelected?.join('-'),
  ];

  const queryFn = () => getContentList(page, perPage, filterData, sortedBy, contentOrigin);

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

  const { isLoading, isFetching, data } = useQuery<RepositoryListServerResponse>(
    queryKey,
    queryFn,
    options,
  );

  return { isLoading, isFetching, data };
};
