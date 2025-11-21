import { useMemo } from 'react';
import { useRepositoryParams } from 'services/Content/ContentQueries';
import { toDomain } from '../../api/versionsListToDomain';
import { GetRepositoryVersionsLists } from '../ports';

export const useGetRepositoryVersionsLists: GetRepositoryVersionsLists = () => {
  const { data } = useRepositoryParams();

  const filteredLists = useMemo(() => toDomain(data), [data]);

  return filteredLists;
};
