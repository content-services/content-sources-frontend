import { useMemo } from 'react';
import useDebounce from 'Hooks/useDebounce';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useRedhatRepositoriesQuery } from './useRedhatRepositoriesQuery';
import { GetRedhatRepositories } from '../core/ports';

export const useGetRedhatRepositories: GetRedhatRepositories = ({
  page,
  perPage,
  sortedBy,
  filterQuery = '',
  isSelectedFiltered = false,
  isEnabled = false,
}) => {
  // read dependencies
  const { selectedArchitecture, selectedOSVersion, hardcodedUUIDs, additionalUUIDs } =
    useTemplateRequestState();

  const debouncedFilterQuery = useDebounce(filterQuery);

  // filter by selected uuids
  const filterSelected = useMemo(() => {
    if (isSelectedFiltered) {
      return [...hardcodedUUIDs!, ...additionalUUIDs!];
    } else {
      return undefined;
    }
  }, [hardcodedUUIDs!, additionalUUIDs!, isSelectedFiltered]);

  // do query
  const initialData = {
    data: [],
    meta: { count: 0, limit: 20, offset: 0 },
    links: { first: '', last: '' },
  };
  const { isLoading, data = initialData } = useRedhatRepositoriesQuery({
    page,
    perPage,
    filterData: {
      availableForArch: selectedArchitecture,
      availableForVersion: selectedOSVersion,
      search: filterQuery,
      uuids: filterSelected,
    },
    sortedBy,
    isEnabled,
    filterQuery: debouncedFilterQuery,
    filterSelected,
  });

  return { isLoading, repositories: data };
};
