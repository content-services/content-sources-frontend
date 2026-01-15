import { useSortRepositoriesList } from '../core/use-cases/sortReposTable';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useGetOtherRepositories } from '../api/useGetOtherRepositories';
import { useQueryClient } from 'react-query';
import { OTHER_REPOSITORIES_LIST_KEY } from '../api/constants';
import { useOtherRepositoriesSlice } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { useToggleOtherRepository } from '../core/use-cases/chooseOtherUUIDs';
import { OtherReposApiType, OtherReposState, PaginationType, SortTableType } from './types.store';
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

const Pagination = createContext<PaginationType>(initialPagination);
export const usePagination = () => useContext(Pagination);

const Sort = createContext<SortTableType>(initialSortTable);
export const useSort = () => useContext(Sort);

type OtherStoreType = {
  children: ReactNode;
};

export const OtherRepositoriesStore = ({ children }: OtherStoreType) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsFiltered] = useState(false); // filter by selected
  const [filterQuery, setFilterQuery] = useState(''); // filter by name

  const queryClient = useQueryClient();
  const { sortedBy, setSortProps } = useSortRepositoriesList();
  const toggleCheckedOther = useToggleOtherRepository();

  const { otherUUIDs, hardcodedUUIDs } = useOtherRepositoriesSlice();

  // enable only after hardcodedUUIDs are set by previous step
  const enableQuery = useMemo(() => hardcodedUUIDs.length !== 0, [hardcodedUUIDs]);

  // refetch or read on every passed-in parameter state change
  const { isLoading, isFetching, repositoriesList } = useGetOtherRepositories({
    page,
    perPage,
    sortedBy,
    filterQuery,
    isSelectedFiltered,
    isEnabled: enableQuery,
  });

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
      count: repositoriesList.length,
      areOtherReposToSelect,
      isSelectedFiltered,
      filterQuery,
      noOtherReposSelected,
      isInOtherUUIDs,
    };
  }, [
    isLoading,
    isFetching,
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
        <Pagination.Provider value={paginationState}>
          <Sort.Provider value={sortingProps}>{children}</Sort.Provider>
        </Pagination.Provider>
      </OtherRepositoriesState.Provider>
    </OtherRepositoriesApi.Provider>
  );
};
