import useDebounce from 'Hooks/useDebounce';
import { useCallback, useMemo } from 'react';
import { useRedhatRepositoriesQuery } from './useRedhatRepositoriesQuery';
import {
  useRedhatUuidsSlice,
  useRepositoryVersionsSlice,
} from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { GetRedhatRepositories } from '../core/ports';
import { RepositoryListServerResponse } from 'features/createTemplateWorkflow/shared/types.repository';

export const useGetRedhatRepositories: GetRedhatRepositories = ({
  page,
  perPage,
  sortedBy,
  filterQuery = '',
  isSelectedFiltered = false,
  isEnabled = false,
}) => {
  // read dependencies
  const { hardcodedUUIDs, additionalUUIDs } = useRedhatUuidsSlice();
  const { selectedArchitecture, selectedOSVersion } = useRepositoryVersionsSlice();

  const debouncedFilter = useDebounce(filterQuery);

  // filter by selected uuids
  const filterSelected = useMemo(() => {
    const redhatUUIDs = [...hardcodedUUIDs, ...additionalUUIDs];
    const filterBySelected = (repositories) =>
      repositories.filter((repository) => redhatUUIDs.includes(repository.uuid));
    const filterSelected = (repositories) =>
      isSelectedFiltered ? filterBySelected(repositories) : repositories;

    return filterSelected;
  }, [hardcodedUUIDs, additionalUUIDs, isSelectedFiltered]);

  // filter by repo name
  const filterByName = useMemo(() => {
    const filterByName = (repositories) =>
      repositories.filter((repository) =>
        repository.name.toLowerCase().includes(debouncedFilter.toLowerCase()),
      );
    const filtered = (repositories) =>
      debouncedFilter !== '' ? filterByName(repositories) : repositories;

    return filtered;
  }, [debouncedFilter]);

  // sort
  const sort = useCallback(
    (repositories) =>
      repositories.sort((a, b) => {
        if (sortedBy === 'name:asc') {
          return a.name.localeCompare(b.name); // A -> Z
        } else {
          return b.name.localeCompare(a.name); // Z -> A
        }
      }),
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
  const { isLoading, data = initialData } = useRedhatRepositoriesQuery({
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

  return { isLoading, repositoriesList, count };
};
