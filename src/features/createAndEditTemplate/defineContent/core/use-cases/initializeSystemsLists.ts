import { useMemo } from 'react';
import { toDomain } from '../../api/versionsListToDomain';
import { GetRepositoryVersionsLists } from '../ports';
import { useRepositoryParams } from 'services/Content/ContentQueries';

export const useInitializeSystemsLists: GetRepositoryVersionsLists = () => {
  const { data } = useRepositoryParams();

  const filteredLists = useMemo(() => toDomain(data), [data]);

  return filteredLists;
};
