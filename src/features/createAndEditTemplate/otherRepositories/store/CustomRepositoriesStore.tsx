import { OtherUUID } from 'features/createAndEditTemplate/shared/types/types';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useToggleOtherRepository } from '../core/use-cases/toggleOtherRepository';
import {
  CustomRepositoriesApiType,
  CustomRepositoriesStateType,
  DerivedStateType,
  initialApi,
  initialDerived,
  initialPagination,
  initialSort,
  initialState,
  PaginationType,
  SortTableType,
} from './typing';
import { useSortRepositoriesList } from '../ui/useSortRepositoriesTable';
import { useGetOtherRepositories } from '../api/useGetOtherRepositories';
import { useRefreshRepositories } from '../core/use-cases/refreshRepositories';

export type ToggleOtherRepository = (uuid: OtherUUID) => void;

const CustomRepositoriesApi = createContext<CustomRepositoriesApiType>(initialApi);
export const useCustomRepositoriesApi = () => useContext(CustomRepositoriesApi);

const CustomRepositoriesState = createContext<CustomRepositoriesStateType>(initialState);
export const useCustomRepositoriesState = () => useContext(CustomRepositoriesState);

const DerivedState = createContext<DerivedStateType>(initialDerived);
export const useDerivedState = () => useContext(DerivedState);

const Pagination = createContext<PaginationType>(initialPagination);
export const usePagination = () => useContext(Pagination);

const Sort = createContext<SortTableType>(initialSort);
export const useSort = () => useContext(Sort);

type CustomRepositoriesStoreType = {
  children: ReactNode;
};
export const CustomRepositoriesStore = ({ children }: CustomRepositoriesStoreType) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isSelectedFiltered, setIsSelectedFiltered] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const { hardcodedUUIDs, otherUUIDs } = useTemplateRequestState();

  const toggleSelected = useToggleOtherRepository();
  const refetchOtherRepositories = useRefreshRepositories();

  // enable only after hardcodedUUIDs are set in top level state
  const enableQuery = useMemo(() => hardcodedUUIDs!.length !== 0, [hardcodedUUIDs]);
  // refetch or read on every passed-in parameter state change
  const { isLoading, isFetching, repositories } = useGetOtherRepositories({
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
  const customReposApi = useMemo(() => {
    const turnPage = (newPage: number) => setPage(newPage);
    const setPagination = (newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    };
    const filterSelected = (filter) => setIsSelectedFiltered(filter);
    const filterByName = (value) => setFilterQuery(value);
    const clearFilterByName = () => setFilterQuery('');

    return {
      turnPage,
      setPagination,
      toggleSelected,
      filterByName,
      clearFilterByName,
      filterSelected,
      refetchOtherRepositories,
    };
  }, []);

  // state
  const reposState = useMemo(
    () => ({
      isLoading,
      isFetching,
      count,
      isSelectedFiltered,
      filterQuery,
      repositoriesList,
    }),
    [
      isLoading,
      isFetching,
      isSelectedFiltered,
      filterQuery,
      repositoriesList.map(({ uuid }) => uuid).join('-'),
      count,
    ],
  );
  const paginationState = useMemo(() => ({ page, perPage }), [page, perPage]);
  const sortingProps = useMemo(() => ({ setSortProps }), [setSortProps]);

  // derived state
  const derivedState = useMemo(() => {
    const areOtherReposToSelect = repositoriesList.length - otherUUIDs!.length > 0;
    const noOtherReposSelected = otherUUIDs!.length === 0;
    const isInOtherUUIDs = (uuid) => otherUUIDs!.includes(uuid);
    return {
      areOtherReposToSelect,
      isSelectedFiltered,
      noOtherReposSelected,
      isInOtherUUIDs,
    };
  }, [otherUUIDs, repositoriesList.map(({ uuid }) => uuid).join('-'), count]);

  return (
    <CustomRepositoriesApi.Provider value={customReposApi}>
      <CustomRepositoriesState.Provider value={reposState}>
        <DerivedState.Provider value={derivedState}>
          <Pagination.Provider value={paginationState}>
            <Sort.Provider value={sortingProps}>{children}</Sort.Provider>
          </Pagination.Provider>
        </DerivedState.Provider>
      </CustomRepositoriesState.Provider>
    </CustomRepositoriesApi.Provider>
  );
};
