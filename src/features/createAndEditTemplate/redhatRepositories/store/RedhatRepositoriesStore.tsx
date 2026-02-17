import { ThProps } from '@patternfly/react-table';
import {
  AdditionalUUID,
  HardcodedUUID,
  RedhatUUID,
} from 'features/createAndEditTemplate/shared/types/types';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import useDebounce from 'Hooks/useDebounce';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { ContentList, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';

type RedhatRepositoriesApiType = {
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
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
  setToggled: (is: boolean) => void;
  toggleSelected: ToggleAdditionalRepository;
  isInHardcodedUUIDs: (uuid: HardcodedUUID) => boolean;
  isInRedhatUUIDs: (uuid: RedhatUUID) => boolean;
};

const initialData = {
  hardcodedUUIDs: [],
  additionalUUIDs: [],
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
  setToggled: () => {},
  toggleSelected: () => {},
  isInHardcodedUUIDs: () => false,
  isInRedhatUUIDs: () => false,
};
const RedhatRepositoriesApi = createContext<RedhatRepositoriesApiType>(initialData);
export const useRedhatRepositoriesApi = () => useContext(RedhatRepositoriesApi);

type RedhatRepositoriesStoreType = {
  children: ReactNode;
};

export type ToggleAdditionalRepository = (uuid: AdditionalUUID) => void;

export const RedhatRepositoriesStore = ({ children }: RedhatRepositoriesStoreType) => {
  const { setAdditionalUUIDs } = useTemplateRequestApi();
  const { selectedArchitecture, selectedOSVersion, hardcodedUUIDs, additionalUUIDs } =
    useTemplateRequestState();

  const [toggled, setToggled] = useState(false);

  const toggleSelected: ToggleAdditionalRepository = useCallback((clickedUuid) => {
    setAdditionalUUIDs((previous) => {
      const isInPrevious = previous.includes(clickedUuid);
      if (isInPrevious) {
        return previous.filter((uuid) => uuid !== clickedUuid);
      } else {
        return [...previous, clickedUuid];
      }
    });
  }, []);

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
        availableForArch: selectedArchitecture!,
        availableForVersion: selectedOSVersion!,
        uuids: toggled ? [...hardcodedUUIDs!, ...additionalUUIDs!] : undefined,
      },
      sortString(),
      [ContentOrigin.REDHAT],
    );

  const {
    data: contentList = [],
    meta: { count = 0 },
  } = data;

  const noAdditionalRepos = additionalUUIDs!.length === 0;
  const countIsZero = count === 0;
  const showLoader = countIsZero && !isLoading;
  const additionalReposAvailableToSelect = contentList.length - hardcodedUUIDs!.length > 0;

  const redHatRepos = [...hardcodedUUIDs!, ...additionalUUIDs!];
  const isInRedhatUUIDs = (uuid) => redHatRepos.includes(uuid);
  const isInHardcodedUUIDs = (uuid) => hardcodedUUIDs!.includes(uuid);

  const api = {
    hardcodedUUIDs: hardcodedUUIDs!,
    additionalUUIDs: additionalUUIDs!,
    isInRedhatUUIDs,
    isInHardcodedUUIDs,
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
    toggleSelected,
    setToggled,
  };

  return <RedhatRepositoriesApi.Provider value={api}>{children}</RedhatRepositoriesApi.Provider>;
};
