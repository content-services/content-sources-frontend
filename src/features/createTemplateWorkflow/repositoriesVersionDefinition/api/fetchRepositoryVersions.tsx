import { useQuery } from 'react-query';
import { getRepositoryParams } from 'services/Content/ContentApi';
import { REPOSITORY_PARAMS_KEY } from 'services/Content/ContentQueries';
import { RepositoryVersionResponse } from '../core/ports';

export const useRepositoryVersionsQuery = () =>
  useQuery<RepositoryVersionResponse>(REPOSITORY_PARAMS_KEY, getRepositoryParams, {
    keepPreviousData: true,
    staleTime: Infinity,
  });
