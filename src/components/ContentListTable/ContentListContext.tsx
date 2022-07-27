import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import useDebounce from '../../services/useDebounce';
import { useContentRepoParamsQuery } from '../../services/Content/ContentQueries';
import { filterData } from '../../services/Content/ContentApi';

type ContentListContextProviderProps = {
  children: React.ReactNode;
};

interface RepoParams {
  distribution_versions: Array<{ name: string; label: string }>;
  distribution_arches: Array<{ name: string; label: string }>;
}

export type Filters = 'Name/URL' | 'Version' | 'Architecture';

interface Context {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filterType: Filters;
  setFilterType: Dispatch<SetStateAction<Filters>>;
  selectedVersions: Array<string>;
  debouncedSelectedVersions: Array<string>;
  setSelectedVersions: Dispatch<SetStateAction<Array<string>>>;
  selectedArches: Array<string>;
  debouncedSelectedArches: Array<string>;
  setSelectedArches: Dispatch<SetStateAction<Array<string>>>;
  repoParams: RepoParams;
  filterData: filterData;
}

export const ContentListContext = createContext<Context>({
  searchQuery: '',
  setSearchQuery: () => null,
  filterType: 'Name/URL',
  setFilterType: () => null,
  selectedVersions: [],
  debouncedSelectedVersions: [],
  setSelectedVersions: () => null,
  selectedArches: [],
  debouncedSelectedArches: [],
  setSelectedArches: () => null,
  repoParams: { distribution_versions: [], distribution_arches: [] },
  filterData: { searchQuery: '', versions: [], arches: [] },
});

const ContentListContextProvider = ({ children }: ContentListContextProviderProps) => {
  const [filterType, setFilterType] = useState<Filters>('Name/URL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [selectedArches, setSelectedArches] = useState<string[]>([]);
  const [filterData, setFilterData] = useState<filterData>({
    searchQuery: '',
    versions: [],
    arches: [],
  });

  const filters = {
    searchQuery,
    selectedVersions,
    selectedArches,
  };

  const {
    searchQuery: debouncedSearchQuery,
    selectedVersions: debouncedSelectedVersions,
    selectedArches: debouncedSelectedArches,
  } = useDebounce(filters);

  const {
    isLoading,
    error,
    isError,
    data = { distribution_arches: [], distribution_versions: [] },
  } = useContentRepoParamsQuery();

  const getLabels = (type: string, names: Array<string>) => {
    const namesLabels =
      type === 'arch' ? data['distribution_arches'] : data['distribution_versions'];
    const labels: Array<string> = [];
    names.forEach((name) => {
      const found = namesLabels.find((v) => v.name === name);
      if (found) {
        labels.push(found.label);
      }
    });
    return labels;
  };

  useEffect(() => {
    setFilterData({
      searchQuery: debouncedSearchQuery,
      versions: getLabels('version', debouncedSelectedVersions),
      arches: getLabels('arch', debouncedSelectedArches),
    });
  }, [debouncedSelectedArches, debouncedSelectedVersions, debouncedSearchQuery]);

  if (isError) throw error;

  if (isLoading) return <></>; // TODO: Implement loader to match the top-level loader here.

  return (
    <ContentListContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        selectedVersions: selectedVersions,
        debouncedSelectedVersions,
        setSelectedVersions,
        selectedArches: selectedArches,
        debouncedSelectedArches,
        setSelectedArches,
        repoParams: data,
        filterData: filterData,
      }}
    >
      {children}
    </ContentListContext.Provider>
  );
};

export default ContentListContextProvider;
