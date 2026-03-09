import { useMemo } from 'react';
import useDebounce from 'Hooks/useDebounce';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { GetOtherRepositories } from '../core/ports';
import { useOtherRepositoriesQuery } from './useOtherRepositoriesQuery';

export const useGetOtherRepositories: GetOtherRepositories = ({
  page,
  perPage,
  sortedBy,
  filterQuery = '',
  isSelectedFiltered = false,
  isEnabled = false,
}) => {
  const { selectedArchitecture, selectedOSVersion, otherUUIDs } = useTemplateRequestState();

  const debouncedFilterQuery = useDebounce(filterQuery);

  // filter by selected uuids
  const filterSelected = useMemo(() => {
    if (isSelectedFiltered) {
      return otherUUIDs;
    } else {
      return undefined;
    }
  }, [otherUUIDs, isSelectedFiltered]);

  // do query
  const initialData = {
    data: [],
    meta: { count: 0, limit: 20, offset: 0 },
    links: { first: '', last: '' },
  };
  const {
    isLoading,
    isFetching,
    data = initialData,
  } = useOtherRepositoriesQuery({
    page,
    perPage,
    filterData: {
      availableForArch: selectedArchitecture,
      availableForVersion: selectedOSVersion,
      search: debouncedFilterQuery,
      uuids: filterSelected,
    },
    sortedBy,
    isEnabled,
    filterQuery: debouncedFilterQuery,
    filterSelected,
  });

  return { isLoading, isFetching, repositories: data };
};
