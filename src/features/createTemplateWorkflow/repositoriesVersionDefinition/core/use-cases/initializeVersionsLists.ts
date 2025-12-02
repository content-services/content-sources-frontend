import { useMemo } from 'react';
import { toDomain } from '../../api/versionsListToDomain';
import { GetRepositoryVersionsLists } from '../ports';
import { useRepositoryVersionsQuery } from '../../api/fetchRepositoryVersions';

export const useGetRepositoryVersionsLists: GetRepositoryVersionsLists = () => {
  const { data } = useRepositoryVersionsQuery();

  const filteredLists = useMemo(() => toDomain(data), [data]);

  return filteredLists;
};
