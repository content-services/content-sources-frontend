import { ThProps } from '@patternfly/react-table';
import { OtherUUID } from 'features/createAndEditTemplate/shared/types/types';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import useDebounce from 'Hooks/useDebounce';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { useHref } from 'react-router-dom';
import { ContentList, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';

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
  sortParams: (columnIndex: number) => ThProps['sort'];
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  toggleSelected: ToggleOtherRepository;
  setToggled: (is: boolean) => void;
  isInOtherUUIDs: (uuid: OtherUUID) => boolean;
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
  sortParams: () => undefined,
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
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const onSetPage = (_, newPage: number) => setPage(newPage);
  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const columnHeaders = ['Name', 'Status', 'Packages'];

  const columnSortAttributes = ['name', 'status', 'package_count'];

  const sortString = (): string =>
    columnSortAttributes[activeSortIndex] + ':' + activeSortDirection;

  const sortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

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
      uuids: toggled ? [...otherUUIDs!] : undefined,
    },
    sortString(),
    [ContentOrigin.CUSTOM, ContentOrigin.COMMUNITY],
  );

  const {
    data: contentList = [],
    meta: { count = 0 },
  } = data;
  const countIsZero = count === 0;
  const showLoader = countIsZero && !isLoading;
  const isInOtherUUIDs = (uuid) => otherUUIDs!.includes(uuid);
  const noOtherReposSelected = otherUUIDs!.length === 0;

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
    sortParams,
    setSearchQuery,
    toggleSelected,
    setToggled,
    isInOtherUUIDs,
    noOtherReposSelected,
  };

  return <CustomRepositoriesApi.Provider value={api}>{children}</CustomRepositoriesApi.Provider>;
};
