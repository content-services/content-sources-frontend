import { ThProps } from '@patternfly/react-table';
import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import useDebounce from 'Hooks/useDebounce';
import { createContext, ReactNode, useContext, useState } from 'react';
import { useHref } from 'react-router-dom';
import { ContentList, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';

type CustomRepositoriesApiType = {
  selectedCustomRepos: Set<string>;
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
  onSetPage: (_, newPage: number) => void;
  onPerPageSelect: (_, newPerPage: number, newPage: number) => void;
  sortParams: (columnIndex: number) => ThProps['sort'];
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setUUIDForList: (uuid: string) => void;
  setToggled: (is: boolean) => void;
};

const initialData = {
  selectedCustomRepos: new Set<string>(),
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
  onSetPage: () => {},
  onPerPageSelect: () => {},
  sortParams: () => undefined,
  setSearchQuery: () => {},
  setUUIDForList: () => {},
  setToggled: () => {},
};

const CustomRepositoriesApi = createContext<CustomRepositoriesApiType>(initialData);
export const useCustomRepositoriesApi = () => useContext(CustomRepositoriesApi);

type CustomRepositoriesStoreType = {
  children: ReactNode;
};
export const CustomRepositoriesStore = ({ children }: CustomRepositoriesStoreType) => {
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';

  const { templateRequest, selectedCustomRepos, setSelectedCustomRepos } = useAddTemplateContext();

  const [toggled, setToggled] = useState(false);

  const setUUIDForList = (uuid: string) => {
    if (selectedCustomRepos.has(uuid)) {
      selectedCustomRepos.delete(uuid);
      if (selectedCustomRepos.size === 0) {
        setToggled(false);
      }
    } else {
      selectedCustomRepos.add(uuid);
    }
    setSelectedCustomRepos(new Set(selectedCustomRepos));
  };

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
      availableForArch: templateRequest.arch as string,
      availableForVersion: templateRequest.version as string,
      uuids: toggled ? [...selectedCustomRepos] : undefined,
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

  const api = {
    selectedCustomRepos,
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
    setUUIDForList,
    setToggled,
  };

  return <CustomRepositoriesApi.Provider value={api}>{children}</CustomRepositoriesApi.Provider>;
};
