import { useCallback, useMemo } from 'react';
import { useOtherRepositoriesQuery } from './useOtherRepositoriesQuery';
import {
  useOtherRepositoriesSlice,
  useRepositoryVersionsSlice,
} from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { GetOtherRepositories } from '../core/ports';
import { RepositoryListServerResponse } from 'features/createTemplateWorkflow/shared/types.repository';

export const useGetOtherRepositories: GetOtherRepositories = ({
  page,
  perPage,
  sortedBy,
  filterQuery = '',
  isSelectedFiltered = false,
  isEnabled = false,
}) => {
  const { otherUUIDs } = useOtherRepositoriesSlice();
  const { selectedArchitecture, selectedOSVersion } = useRepositoryVersionsSlice();

  // filter by selected uuids
  const filterSelected = useMemo(() => {
    const filterBySelected = (repositories) =>
      repositories.filter((repository) => otherUUIDs.includes(repository.uuid));
    const filterSelected = (repositories) =>
      isSelectedFiltered ? filterBySelected(repositories) : repositories;

    return filterSelected;
  }, [otherUUIDs, isSelectedFiltered]);

  // filter by repo name
  const filterByName = useMemo(() => {
    const filterByName = (repositories) =>
      repositories.filter((repository) =>
        repository.name.toLowerCase().includes(filterQuery.toLowerCase()),
      );
    const filtered = (repositories) =>
      filterQuery !== '' ? filterByName(repositories) : repositories;

    return filtered;
  }, [filterQuery]);

  // sort
  const sort = useCallback(
    (repositories) => {
      const sorted = repositories.sort((a, b) => {
        switch (sortedBy) {
          case 'name:asc':
            return a.name.localeCompare(b.name);
          case 'name:desc':
            return b.name.localeCompare(a.name);
          case 'status:asc':
            return a.status.localeCompare(b.status);
          case 'status:desc':
            return b.status.localeCompare(a.status);
          case 'package_count:asc':
            return a.package_count - b.package_count;
          case 'package_count:desc':
            return b.package_count - a.package_count;
          default:
            return a.name.localeCompare(b.name);
        }
      });
      return sorted;
    },
    [sortedBy],
  );

  // combine all filterings
  const selectFromAllRepos = useCallback(
    (response) => {
      const { data, meta, links } = response;
      const filteredSelected = filterSelected(data);
      const filteredByName = filterByName(filteredSelected);
      const sortedList = sort(filteredByName);
      return { data: sortedList, meta, links } as RepositoryListServerResponse;
    },
    [filterSelected, filterByName, sort],
  );

  // do query
  const initialData = { data: [], meta: { count: 0 } };
  const {
    isLoading,
    isFetching,
    data = initialData,
  } = useOtherRepositoriesQuery({
    page,
    limit: perPage,
    filterData: {
      availableForArch: selectedArchitecture,
      availableForVersion: selectedOSVersion,
    },
    sortedBy,
    select: selectFromAllRepos,
    isEnabled,
  });
  const {
    data: repositoriesList = [],
    meta: { count = 0 },
  } = data;

  return { isLoading, isFetching, repositoriesList, count };
};
