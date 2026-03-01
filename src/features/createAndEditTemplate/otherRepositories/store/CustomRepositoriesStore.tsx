import { OtherUUID } from 'features/createAndEditTemplate/shared/types/types';
import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import useDebounce from 'Hooks/useDebounce';
import { createContext, ReactNode, useContext, useState } from 'react';
import { ContentList, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';
import { useSortRepositoriesList } from '../ui/useSortRepositoriesTable';
import { SortRepositoryTableProps } from '../core/types';
import { useToggleOtherRepository } from '../core/use-cases/toggleOtherRepository';
import { RefreshRepositories } from '../core/ports';
import { useRefreshRepositories } from '../core/use-cases/refreshRepositories';

export type ToggleOtherRepository = (uuid: OtherUUID) => void;

type CustomRepositoriesApiType = {
  contentList: ContentList;
  page: number;
  perPage: number;
  count: number;
  isLoading: boolean;
  isFetching: boolean;
  columnHeaders: string[];
  countIsZero: boolean;
  showLoader: boolean;
  searchQuery: string;
  toggled: boolean;
  noOtherReposSelected: boolean;
  onSetPage: (_, newPage: number) => void;
  onPerPageSelect: (_, newPerPage: number, newPage: number) => void;
  setSortProps: SortRepositoryTableProps;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  toggleSelected: ToggleOtherRepository;
  setToggled: (is: boolean) => void;
  isInOtherUUIDs: (uuid: OtherUUID) => boolean;
  refetchOtherRepositories: RefreshRepositories;
};

const sortBy = {
  index: 0,
  direction: 'asc' as const,
  defaultDirection: 'asc' as const,
};

const initialData = {
  contentList: [],
  page: 1,
  perPage: 20,
  count: 0,
  isLoading: false,
  isFetching: false,
  columnHeaders: ['Name', 'Status', 'Packages'],
  countIsZero: false,
  showLoader: true,
  searchQuery: '',
  toggled: false,
  noOtherReposSelected: true,
  onSetPage: () => {},
  onPerPageSelect: () => {},
  setSortProps: (index) => ({
    onSort: () => {},
    sortBy: sortBy,
    columnIndex: index,
  }),
  setSearchQuery: () => {},
  toggleSelected: () => {},
  setToggled: () => {},
  isInOtherUUIDs: () => false,
  refetchOtherRepositories: () => {},
};

const CustomRepositoriesApi = createContext<CustomRepositoriesApiType>(initialData);
export const useCustomRepositoriesApi = () => useContext(CustomRepositoriesApi);

type CustomRepositoriesStoreType = {
  children: ReactNode;
};
export const CustomRepositoriesStore = ({ children }: CustomRepositoriesStoreType) => {
  const { selectedArchitecture, selectedOSVersion, otherUUIDs } = useTemplateRequestState();

  const toggleSelected = useToggleOtherRepository();
  const refetchOtherRepositories = useRefreshRepositories();

  const [toggled, setToggled] = useState(false);

  const storedPerPage = Number(20);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const { sortedBy, setSortProps } = useSortRepositoriesList();

  const onSetPage = (_, newPage: number) => setPage(newPage);
  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const columnHeaders = ['Name', 'Status', 'Packages'];

  const {
    isLoading,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useContentListQuery(
    page,
    perPage,
    {
      search: searchQuery === '' ? searchQuery : debouncedSearch,
      availableForArch: selectedArchitecture!,
      availableForVersion: selectedOSVersion!,
      uuids: toggled ? [...otherUUIDs] : undefined,
    },
    sortedBy,
    [ContentOrigin.CUSTOM, ContentOrigin.COMMUNITY],
  );

  const {
    data: contentList = [],
    meta: { count = 0 },
  } = data;
  const countIsZero = count === 0;
  const showLoader = countIsZero && !isLoading;
  const isInOtherUUIDs = (uuid) => otherUUIDs.includes(uuid);
  const noOtherReposSelected = otherUUIDs.length === 0;

  const api = {
    page,
    perPage,
    count,
    isLoading,
    isFetching,
    contentList,
    columnHeaders,
    countIsZero,
    showLoader,
    searchQuery,
    toggled,
    onSetPage,
    onPerPageSelect,
    setSortProps,
    setSearchQuery,
    toggleSelected,
    setToggled,
    isInOtherUUIDs,
    noOtherReposSelected,
    refetchOtherRepositories,
  };

  return <CustomRepositoriesApi.Provider value={api}>{children}</CustomRepositoriesApi.Provider>;
};
