import { OtherUUID } from 'features/createAndEditTemplate/shared/types/types';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import useDebounce from 'Hooks/useDebounce';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { useHref } from 'react-router-dom';
import { ContentList, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';
import { useSortRepositoriesList } from '../ui/useSortRepositoriesTable';
import { SortRepositoryTableProps } from '../core/types';

export type ToggleOtherRepository = (uuid: OtherUUID) => void;

type CustomRepositoriesApiType = {
  pathname: string;
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
};

const sortBy = {
  index: 0,
  direction: 'asc' as const,
  defaultDirection: 'asc' as const,
};

const initialData = {
  pathname: '',
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
};

const CustomRepositoriesApi = createContext<CustomRepositoriesApiType>(initialData);
export const useCustomRepositoriesApi = () => useContext(CustomRepositoriesApi);

type CustomRepositoriesStoreType = {
  children: ReactNode;
};
export const CustomRepositoriesStore = ({ children }: CustomRepositoriesStoreType) => {
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';

  const { setOtherUUIDs } = useTemplateRequestApi();
  const { selectedArchitecture, selectedOSVersion, otherUUIDs } = useTemplateRequestState();

  const [toggled, setToggled] = useState(false);

  const toggleSelected = useCallback((clickedUuid: string) => {
    setOtherUUIDs((previous) => {
      const isInPrevious = previous.includes(clickedUuid);
      if (isInPrevious) {
        return previous.filter((uuid) => uuid !== clickedUuid);
      } else {
        return [...previous, clickedUuid];
      }
    });
  }, []);

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
    pathname,
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
  };

  return <CustomRepositoriesApi.Provider value={api}>{children}</CustomRepositoriesApi.Provider>;
};
