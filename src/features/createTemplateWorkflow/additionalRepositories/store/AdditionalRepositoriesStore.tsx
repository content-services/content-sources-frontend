import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useSortRepositoriesList } from '../core/use-cases/sortReposTable';
import { useGetRedhatRepositories } from '../api/getRedhatRepos';
import { useRedhatUuidsSlice } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { useToggleAdditionalRepository } from '../core/use-cases/chooseAdditionalUUIDs';
import {
  initialAdditionalApi,
  initialAdditionalState,
  initialDerivedState,
  initialPagination,
  initialSortTable,
} from './store.initials';
import {
  AdditionalReposApiType,
  AdditionalReposState,
  DerivedAdditionalStateType,
  PaginationStateType,
  SortTableType,
} from './types.store';

const AdditionalRepositoriesState = createContext<AdditionalReposState>(initialAdditionalState);
export const useAdditionalRepositoriesState = () => useContext(AdditionalRepositoriesState);

const AdditionalRepositoriesApi = createContext<AdditionalReposApiType>(initialAdditionalApi);
export const useAdditionalRepositoriesApi = () => useContext(AdditionalRepositoriesApi);

const DerivedState = createContext<DerivedAdditionalStateType>(initialDerivedState);
export const useDerivedState = () => useContext(DerivedState);

const PaginationState = createContext<PaginationStateType>(initialPagination);
export const usePagination = () => useContext(PaginationState);

const Sort = createContext<SortTableType>(initialSortTable);
export const useSort = () => useContext(Sort);

type AdditionalStoreType = {
  children: ReactNode;
};

export const AdditionalRepositoriesStore = ({ children }: AdditionalStoreType) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsFiltered] = useState(false); // filter by selected
  const [filterQuery, setFilterQuery] = useState(''); // filter by name
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const { hardcodedUUIDs, additionalUUIDs } = useRedhatUuidsSlice();

  const enableQuery = useMemo(() => hardcodedUUIDs.length !== 0, [hardcodedUUIDs]);

  const toggleCheckedAdditional = useToggleAdditionalRepository();

  // refetch or read on every passed-in parameter state change
  const { isLoading, repositoriesList } = useGetRedhatRepositories({
    page,
    perPage,
    sortedBy,
    filterQuery,
    isSelectedFiltered,
    isEnabled: enableQuery,
  });

  const additionalReposApi = useMemo(() => {
    const turnPage = (newPage: number) => setPage(newPage);

    const setPagination = (newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    };

    const filterSelected = (filter) => setIsFiltered(filter);
    const filterByName = (value) => setFilterQuery(value);
    const clearFilterByName = () => setFilterQuery('');

    return {
      turnPage,
      setPagination,
      toggleCheckedAdditional,
      filterByName,
      clearFilterByName,
      filterSelected,
    };
  }, []);

  useMemo(() => {
    if (additionalUUIDs.length === 0) {
      setIsFiltered(false);
    }
  }, [additionalUUIDs.length === 0]);

  const derivedState = useMemo(() => {
    const redHatRepos = [...hardcodedUUIDs, ...additionalUUIDs];
    const isInRedhatUUIDs = (uuid) => redHatRepos.includes(uuid);
    const isInHardcodedUUIDs = (uuid) => hardcodedUUIDs.includes(uuid);
    const areAdditionalReposToSelect = repositoriesList.length - hardcodedUUIDs.length > 0;
    const noAdditionalReposSelected = additionalUUIDs.length === 0;
    return {
      isInRedhatUUIDs,
      areAdditionalReposToSelect,
      isInHardcodedUUIDs,
      noAdditionalReposSelected,
    };
  }, [hardcodedUUIDs, additionalUUIDs, repositoriesList.length]);

  const additionalReposData = useMemo(
    () => ({
      isLoading,
      count: repositoriesList.length,
      isSelectedFiltered,
      filterQuery,
      repositoriesList,
    }),
    [
      isLoading,
      isSelectedFiltered,
      filterQuery,
      repositoriesList.map(({ uuid }) => uuid).join('-'),
    ],
  );

  const paginationState = useMemo(() => ({ page, perPage }), [page, perPage]);

  return (
    <AdditionalRepositoriesApi.Provider value={additionalReposApi}>
      <AdditionalRepositoriesState.Provider value={additionalReposData}>
        <DerivedState.Provider value={derivedState}>
          <PaginationState.Provider value={paginationState}>
            <Sort.Provider value={{ setSortProps }}>{children}</Sort.Provider>
          </PaginationState.Provider>
        </DerivedState.Provider>
      </AdditionalRepositoriesState.Provider>
    </AdditionalRepositoriesApi.Provider>
  );
};
