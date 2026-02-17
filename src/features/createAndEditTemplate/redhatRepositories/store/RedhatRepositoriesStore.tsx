import { ThProps } from '@patternfly/react-table';
import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import useDebounce from 'Hooks/useDebounce';
import { createContext, ReactNode, useContext, useState } from 'react';
import { ContentList, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';

type RedhatRepositoriesApiType = {
  hardcodedRedhatRepositoryUUIDS: Set<string>;
  selectedRedhatRepos: Set<string>;
  contentList: ContentList;
  page: number;
  perPage: number;
  count: number;
  isLoading: boolean;
  columnHeaders: string[];
  countIsZero: boolean;
  showLoader: boolean;
  additionalReposAvailableToSelect: boolean;
  noAdditionalRepos: boolean;
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
  hardcodedRedhatRepositoryUUIDS: new Set<string>(),
  selectedRedhatRepos: new Set<string>(),
  contentList: [],
  page: 1,
  perPage: 20,
  count: 0,
  isLoading: false,
  columnHeaders: ['Name', 'Advisories', 'Packages'],
  countIsZero: false,
  showLoader: true,
  additionalReposAvailableToSelect: false,
  noAdditionalRepos: true,
  searchQuery: '',
  toggled: false,
  onSetPage: () => {},
  onPerPageSelect: () => {},
  sortParams: () => undefined,
  setSearchQuery: () => {},
  setUUIDForList: () => {},
  setToggled: () => {},
};
const RedhatRepositoriesApi = createContext<RedhatRepositoriesApiType>(initialData);
export const useRedhatRepositoriesApi = () => useContext(RedhatRepositoriesApi);

type RedhatRepositoriesStoreType = {
  children: ReactNode;
};

export const RedhatRepositoriesStore = ({ children }: RedhatRepositoriesStoreType) => {
  const {
    hardcodedRedhatRepositoryUUIDS,
    templateRequest,
    selectedRedhatRepos,
    setSelectedRedhatRepos,
  } = useAddTemplateContext();

  const noAdditionalRepos = selectedRedhatRepos.size - hardcodedRedhatRepositoryUUIDS.size === 0;

  const [toggled, setToggled] = useState(false);

  const setUUIDForList = (uuid: string) => {
    if (selectedRedhatRepos.has(uuid)) {
      selectedRedhatRepos.delete(uuid);
      if (noAdditionalRepos) {
        setToggled(false);
      }
    } else {
      selectedRedhatRepos.add(uuid);
    }
    setSelectedRedhatRepos(new Set(selectedRedhatRepos));
  };

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const onSetPage = (_, newPage: number) => setPage(newPage);
  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const columnHeaders = ['Name', /* 'Label',*/ 'Advisories', 'Packages'];

  const columnSortAttributes = ['name'];

  const sortString = (): string =>
    columnSortAttributes[activeSortIndex] + ':' + activeSortDirection;

  const sortParams = (columnIndex: number): ThProps['sort'] =>
    columnSortAttributes[columnIndex]
      ? {
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
        }
      : undefined;

  const { isLoading, data = { data: [], meta: { count: 0, limit: 20, offset: 0 } } } =
    useContentListQuery(
      page,
      perPage,
      {
        search: searchQuery === '' ? searchQuery : debouncedSearch,
        availableForArch: templateRequest.arch as string,
        availableForVersion: templateRequest.version as string,
        uuids: toggled ? [...selectedRedhatRepos] : undefined,
      },
      sortString(),
      [ContentOrigin.REDHAT],
    );

  const {
    data: contentList = [],
    meta: { count = 0 },
  } = data;

  const countIsZero = count === 0;
  const showLoader = countIsZero && !isLoading;
  const additionalReposAvailableToSelect =
    contentList.length - hardcodedRedhatRepositoryUUIDS.size > 0;

  const api = {
    hardcodedRedhatRepositoryUUIDS,
    selectedRedhatRepos,
    page,
    perPage,
    count,
    isLoading,
    contentList,
    columnHeaders,
    countIsZero,
    showLoader,
    additionalReposAvailableToSelect,
    noAdditionalRepos,
    searchQuery,
    toggled,
    onSetPage,
    onPerPageSelect,
    sortParams,
    setSearchQuery,
    setUUIDForList,
    setToggled,
  };

  return <RedhatRepositoriesApi.Provider value={api}>{children}</RedhatRepositoriesApi.Provider>;
};
