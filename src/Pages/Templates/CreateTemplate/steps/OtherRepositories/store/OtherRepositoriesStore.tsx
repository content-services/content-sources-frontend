import { useSortRepositoriesList } from '../core/sortReposTable';
import { createContext, useContext, useMemo, useState } from 'react';
import {
  useOtherRepositoriesSlice,
  useTemplateRequestApi,
} from '../../../store/TemplateRequestStore';
import { useGetOtherRepositories } from '../api/useGetOtherRepositories';
import { useQueryClient } from 'react-query';
import { OTHER_REPOSITORIES_LIST_KEY } from '../api/constants';

const OtherRepositoriesState = createContext(null);
export const useOtherRepositoriesState = () => useContext(OtherRepositoriesState);

const OtherRepositoriesApi = createContext(null);
export const useOtherRepositoriesApi = () => useContext(OtherRepositoriesApi);

const PaginationState = createContext(null);
export const usePaginationState = () => useContext(PaginationState);

const Sort = createContext(null);
export const useSort = () => useContext(Sort);

export const OtherRepositoriesStore = ({ children }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsFiltered] = useState(false); // filter by selected
  const [filterQuery, setFilterQuery] = useState(''); // filter by name
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const { otherUUIDs, hardcodedUUIDs } = useOtherRepositoriesSlice();
  const { setOtherUUIDs } = useTemplateRequestApi();

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

  //   use case
  const otherReposApi = useMemo(() => {
    const turnPage = (_, newPage: number) => setPage(newPage);
    const setPagination = (_, newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    };
    const toggleChecked = (clickedUuid: string) => {
      setOtherUUIDs((previous) => {
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

    const refetchOtherRepositories = () =>
      queryClient.invalidateQueries(OTHER_REPOSITORIES_LIST_KEY);

    return {
      turnPage,
      setPagination,
      toggleChecked,
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
    const nootherReposSelected = otherUUIDs.length === 0;
    const isInOtherUUIDs = (uuid) => otherUUIDs.includes(uuid);
    return {
      isLoading,
      isFetching,
      repositoriesList,
      count,
      areOtherReposToSelect,
      isSelectedFiltered,
      filterQuery,
      nootherReposSelected,
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
