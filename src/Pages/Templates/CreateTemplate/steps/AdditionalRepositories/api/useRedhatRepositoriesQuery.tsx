import useErrorNotification from 'Hooks/useErrorNotification';
import { useQuery } from 'react-query';
import { FilterData, getContentList } from 'services/Content/ContentApi';
import { RepositoryListServerResponse, RepositoryOrigin } from '../../shared/types.server';
import { CONTENT_LIST_KEY } from '../../shared/constants';

type RedhatRepositoriesQuery = {
  page: number;
  limit: number;
  filterData: FilterData;
  sortedBy: string;
  contentOrigin?: RepositoryOrigin[];
  select?: (response: RepositoryListServerResponse) => RepositoryListServerResponse;
  isEnabled: boolean;
};

// fetching and caching all available redhat repositories for selected architecture and OS version
// using select to filter only a slice
export const useRedhatRepositoriesQuery = ({
  page,
  limit,
  filterData,
  sortedBy,
  contentOrigin = [RepositoryOrigin.REDHAT],
  select = undefined,
  isEnabled,
}: RedhatRepositoriesQuery) => {
  const errorNotifier = useErrorNotification();

  const queryKey = [CONTENT_LIST_KEY, filterData.availableForArch, filterData.availableForVersion];
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

  const { isLoading, data } = useQuery<RepositoryListServerResponse>(queryKey, queryFn, options);

  return { isLoading, data };
};
