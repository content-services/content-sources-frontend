import { useSortRepositoriesList } from '../core/use-cases/sortReposTable';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useGetOtherRepositories } from '../api/useGetOtherRepositories';
import { useQueryClient } from 'react-query';
import { OTHER_REPOSITORIES_LIST_KEY } from '../api/constants';
import { useOtherRepositoriesSlice } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { useToggleOtherRepository } from '../core/use-cases/chooseOtherUUIDs';
import {
  OtherReposApiType,
  OtherReposState,
  PaginationStateType,
  SortTableType,
} from './types.store';
import {
  initialOtherApi,
  initialOtherState,
  initialPagination,
  initialSortTable,
} from './store.initials';

const OtherRepositoriesState = createContext<OtherReposState>(initialOtherState);
export const useOtherRepositoriesState = () => useContext(OtherRepositoriesState);

const OtherRepositoriesApi = createContext<OtherReposApiType>(initialOtherApi);
export const useOtherRepositoriesApi = () => useContext(OtherRepositoriesApi);

const PaginationState = createContext<PaginationStateType>(initialPagination);
export const usePaginationState = () => useContext(PaginationState);

const Sort = createContext<SortTableType>(initialSortTable);
export const useSort = () => useContext(Sort);

export const OtherRepositoriesStore = ({ children }: PropsWithChildren) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsFiltered] = useState(false); // filter by selected
  const [filterQuery, setFilterQuery] = useState(''); // filter by name
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const queryClient = useQueryClient();
  const { otherUUIDs, hardcodedUUIDs } = useOtherRepositoriesSlice();
  const toggleCheckedOther = useToggleOtherRepository();

  // enable only after hardcodedUUIDs are set by previous step
  const enableQuery = useMemo(() => hardcodedUUIDs.length !== 0, [hardcodedUUIDs]);

  // refetch or read on every passed-in parameter state change
  const { isLoading, isFetching, repositoriesList, count } = useGetOtherRepositories({
    page,
    perPage,
    sortedBy,
    filterQuery,
    isSelectedFiltered,
    isEnabled: enableQuery,
  });

  // use-cases
  const otherReposApi = useMemo(() => {
    const turnPage = (newPage: number) => setPage(newPage);

    const setPagination = (newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    };

    const filterSelected = (filter) => setIsFiltered(filter);
    const filterByName = (value) => setFilterQuery(value);
    const clearFilterByName = () => setFilterQuery('');

    const refetchOtherRepositories = () =>
      queryClient.invalidateQueries(OTHER_REPOSITORIES_LIST_KEY);

    return {
      turnPage,
      setPagination,
      toggleCheckedOther,
      filterByName,
      clearFilterByName,
      filterSelected,
      refetchOtherRepositories,
    };
  }, []);

  useMemo(() => {
    setIsFiltered(false);
  }, [otherUUIDs.length === 0]);

  const otherReposData = useMemo(() => {
    const areOtherReposToSelect = repositoriesList.length - otherUUIDs.length > 0;
    const noOtherReposSelected = otherUUIDs.length === 0;
    const isInOtherUUIDs = (uuid) => otherUUIDs.includes(uuid);
    return {
      isLoading,
      isFetching,
      repositoriesList,
      count,
      areOtherReposToSelect,
      isSelectedFiltered,
      filterQuery,
      noOtherReposSelected,
      isInOtherUUIDs,
    };
  }, [
    isLoading,
    isFetching,
    count,
    isSelectedFiltered,
    filterQuery,
    otherUUIDs,
    repositoriesList.map(({ uuid }) => uuid).join('-'),
  ]);

  const paginationState = useMemo(() => ({ page, perPage }), [page, perPage]);
  const sortingProps = useMemo(() => ({ setSortProps }), [setSortProps]);

  return (
    <OtherRepositoriesApi.Provider value={otherReposApi}>
      <OtherRepositoriesState.Provider value={otherReposData}>
        <PaginationState.Provider value={paginationState}>
          <Sort.Provider value={sortingProps}>{children}</Sort.Provider>
        </PaginationState.Provider>
      </OtherRepositoriesState.Provider>
    </OtherRepositoriesApi.Provider>
  );
};
