import { useCallback } from 'react';
import { OTHER_REPOSITORIES_LIST_KEY } from 'services/Content/ContentQueries';
import { RefreshRepositories } from '../ports';
import { useQueryClient } from 'react-query';

export const useRefreshRepositories = () => {
  const queryClient = useQueryClient();

  const refreshRepositories: RefreshRepositories = useCallback(() => {
    queryClient.invalidateQueries(OTHER_REPOSITORIES_LIST_KEY);
  }, []);

  return refreshRepositories;
};
