import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSortRepositoriesList } from '../ui/useSortRepositoriesTable';
import { useToggleSelectedRepository } from '../core/use-cases/toggleSelectedRepository';
import { useGetRedhatRepositories } from '../api/useGetRedhatRepositories';
import {
  DerivedStateType,
  initialApi,
  initialDerived,
  initialPagination,
  initialSort,
  initialState,
  PaginationStateType,
  RedhatRepositoriesApiType,
  RedhatRepositoriesStateType,
  SortTableType,
} from './typing';

const RedhatRepositoriesApi = createContext<RedhatRepositoriesApiType>(initialApi);
export const useRedhatRepositoriesApi = () => useContext(RedhatRepositoriesApi);

const RedhatRepositoriesState = createContext<RedhatRepositoriesStateType>(initialState);
export const useRedhatRepositoriesState = () => useContext(RedhatRepositoriesState);

const DerivedState = createContext<DerivedStateType>(initialDerived);
export const useDerivedState = () => useContext(DerivedState);

const PaginationState = createContext<PaginationStateType>(initialPagination);
export const usePagination = () => useContext(PaginationState);

const Sort = createContext<SortTableType>(initialSort);
export const useSort = () => useContext(Sort);

type RedhatRepositoriesStoreType = {
  children: ReactNode;
};

export const RedhatRepositoriesStore = ({ children }: RedhatRepositoriesStoreType) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsSelectedFiltered] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const { hardcodedUUIDs, additionalUUIDs } = useTemplateRequestState();

  const toggleSelected = useToggleSelectedRepository();

  // refetch or read on every passed-in parameter state change
  const enableQuery = useMemo(() => hardcodedUUIDs!.length !== 0, [hardcodedUUIDs]);
  const { isLoading, repositories } = useGetRedhatRepositories({
    page,
    perPage,
    sortedBy,
    filterQuery,
    isSelectedFiltered,
    isEnabled: enableQuery,
  });
  const {
    data: repositoriesList,
    meta: { count },
  } = repositories;

  // api
  const repositoriesApi = useMemo(() => {
    const turnPage = (newPage: number) => setPage(newPage);
    const setPagination = (newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    };
    const filterSelected = (filter) => setIsSelectedFiltered(filter);
    const filterByName = (value) => setFilterQuery(value);
    const clearFilterByName = () => setFilterQuery('');

    return {
      toggleSelected,
      filterSelected,
      filterByName,
      clearFilterByName,
      turnPage,
      setPagination,
    };
  }, []);

  // automatically unset filter selected repos
  // when user unselects every repository
  useMemo(() => {
    if (additionalUUIDs!.length === 0) {
      setIsSelectedFiltered(false);
    }
  }, [additionalUUIDs!.length === 0]);

  // state
  const repoState = useMemo(
    () => ({
      isLoading,
      count,
      isSelectedFiltered,
      filterQuery,
      repositoriesList,
    }),
    [
      isLoading,
      isSelectedFiltered,
      filterQuery,
      repositoriesList.map(({ uuid }) => uuid).join('-'),
      count,
    ],
  );
  const paginationState = useMemo(() => ({ page, perPage }), [page, perPage]);

  // derived state
  const derivedState = useMemo(() => {
    const redHatRepos = [...hardcodedUUIDs!, ...additionalUUIDs!];
    const isInRedhatUUIDs = (uuid) => redHatRepos.includes(uuid);
    const isInHardcodedUUIDs = (uuid) => hardcodedUUIDs!.includes(uuid);
    const areReposAvailableToSelect = repositoriesList.length - hardcodedUUIDs!.length > 0;
    const noAdditionalReposSelected = additionalUUIDs!.length === 0;
    return {
      isInRedhatUUIDs,
      areReposAvailableToSelect,
      isInHardcodedUUIDs,
      noAdditionalReposSelected,
    };
  }, [hardcodedUUIDs, additionalUUIDs, repositoriesList.length]);

  return (
    <RedhatRepositoriesApi.Provider value={repositoriesApi}>
      <RedhatRepositoriesState.Provider value={repoState}>
        <DerivedState.Provider value={derivedState}>
          <PaginationState.Provider value={paginationState}>
            <Sort.Provider value={{ setSortProps }}>{children}</Sort.Provider>
          </PaginationState.Provider>
        </DerivedState.Provider>
      </RedhatRepositoriesState.Provider>
    </RedhatRepositoriesApi.Provider>
  );
};
