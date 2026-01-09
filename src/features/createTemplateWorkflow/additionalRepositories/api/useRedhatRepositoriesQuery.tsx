import useErrorNotification from 'Hooks/useErrorNotification';
import { useQuery } from 'react-query';
import { ContentOrigin, getContentList } from 'services/Content/ContentApi';
import { RepositoryListServerResponse } from '../../shared/types.repository';
import { FilterRepositories } from 'features/createTemplateWorkflow/shared/api/types.requests';
import { CONTENT_LIST_KEY } from 'services/Content/ContentQueries';

type RedhatRepositoriesQuery = {
  page: number;
  limit: number;
  filterData: FilterRepositories;
  sortedBy: string;
  contentOrigin?: ContentOrigin[];
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
  contentOrigin = [ContentOrigin.REDHAT],
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
