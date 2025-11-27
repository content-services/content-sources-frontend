import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useSortRepositoriesList } from '../core/sortReposTable';
import { useRedhatUuidsSlice, useTemplateRequestApi } from '../../../store/TemplateRequestStore';
import { useGetRedhatRepositories } from '../api/getRedhatRepos';
import { AdditionalReposApiType, initialAdditionalApi } from './types';

const AdditionalRepositoriesState = createContext(null);
export const useAdditionalRepositoriesState = () => useContext(AdditionalRepositoriesState);

const AdditionalRepositoriesApi = createContext<AdditionalReposApiType>(initialAdditionalApi);
export const useAdditionalRepositoriesApi = () => useContext(AdditionalRepositoriesApi);

const DerivedState = createContext(null);
export const useDerivedState = () => useContext(DerivedState);

const PaginationState = createContext(null);
export const usePaginationState = () => useContext(PaginationState);

const Sort = createContext(null);
export const useSort = () => useContext(Sort);

export const AdditionalRepositoriesStore = ({ children }: PropsWithChildren) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsFiltered] = useState(false); // filter by selected
  const [filterQuery, setFilterQuery] = useState(''); // filter by name
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const { hardcodedUUIDs, additionalUUIDs } = useRedhatUuidsSlice();
  const { setAdditionalUUIDs } = useTemplateRequestApi();

  const enableQuery = useMemo(() => hardcodedUUIDs.length !== 0, [hardcodedUUIDs]);

  // refetch or read on every passed-in parameter state change
  const { isLoading, repositoriesList, count } = useGetRedhatRepositories({
    page,
    perPage,
    sortedBy,
    filterQuery,
    isSelectedFiltered,
    isEnabled: enableQuery,
  });

  const additionalReposApi = useMemo(() => {
    const turnPage = (_, newPage: number) => setPage(newPage);
    const setPagination = (_, newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    };
    const toggleChecked = (clickedUuid: string) => {
      setAdditionalUUIDs((previous) => {
        const isInPrevious = previous.includes(clickedUuid);
        if (isInPrevious) {
          return previous.filter((uuid) => uuid !== clickedUuid);
        } else {
          return [...previous, clickedUuid];
        }
      });
    };
    const filterSelected = (filter) => setIsFiltered(filter);
    const filterByName = (_event, value) => setFilterQuery(value);
    const clearFilterByName = () => setFilterQuery('');

    return {
      turnPage,
      setPagination,
      toggleChecked,
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
      count,
      isSelectedFiltered,
      filterQuery,
      repositoriesList,
    }),
    [
      isLoading,
      count,
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
