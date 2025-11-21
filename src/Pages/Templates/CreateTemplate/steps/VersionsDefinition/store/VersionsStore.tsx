import {
  createContext,
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  useRepositoryVersionsSlice,
  useTemplateRequestApi,
} from '../../../store/TemplateRequestStore';
import { useChooseHardcodedRepositories } from '../core/use-cases/chooseHardcodedRepositories';
import { useGetRepositoryVersionsLists } from '../core/use-cases/initializeVersionsLists';
import { VersionsApiType, VersionsStateType } from './types.store';
import { IsListExpanded, RepositoryVersionsLists } from '../core/types';

const initialVersionsLists = {
  architectures: [],
  osVersions: [],
};

const VersionsLists = createContext<RepositoryVersionsLists>(initialVersionsLists);
export const useVersionsLists = () => useContext(VersionsLists);

const initialVersionsApi = {
  onSelectArchitecture: () => {},
  onSelectOSVersion: () => {},
  updateIsExpandedList: () => {},
  toggleIsExpandedList: () => {},
};

const VersionsApi = createContext<VersionsApiType>(initialVersionsApi);
export const useVersionsApi = () => useContext(VersionsApi);

const initalVersionsState = {
  selectedArchitecture: '',
  selectedOSVersion: '',
  isArchitectureItemSelected: false,
  isOSVersionItemSelected: false,
  isExpandedList: false,
};

const VersionsState = createContext<VersionsStateType>(initalVersionsState);
export const useVersionsState = () => useContext(VersionsState);

export const VersionsStore = ({ children }: PropsWithChildren) => {
  const [isExpandedList, setIsExpandedList] = useState<IsListExpanded>({
    architecture: false,
    osVersion: false,
  });

  const { resetTemplateRequestContent, setArchitecture, setOSVersion } = useTemplateRequestApi();
  const { selectedArchitecture, selectedOSVersion } = useRepositoryVersionsSlice();

  const versionsLists = useGetRepositoryVersionsLists();
  const chooseHardcodedRedhatRepositories = useChooseHardcodedRepositories();

  const versionsApi = useMemo(() => {
    const onSelectArchitecture = (val) => {
      setArchitecture(val);
      updateIsExpandedList({ architecture: false });
    };
    const onSelectOSVersion = (val) => {
      setOSVersion(val);
      updateIsExpandedList({ osVersion: false });
    };
    const updateIsExpandedList = (patch) => setIsExpandedList((state) => ({ ...state, ...patch }));

    const toggleIsExpandedList = (list) => {
      setIsExpandedList((state) => {
        const previous = state[list];
        return { ...state, [list]: !previous };
      });
    };
    return { onSelectArchitecture, onSelectOSVersion, toggleIsExpandedList, updateIsExpandedList };
  }, []);

  // automatically retrigger on arch or osversion change
  useLayoutEffect(() => {
    if (!!selectedArchitecture && !!selectedOSVersion) {
      chooseHardcodedRedhatRepositories({
        architecture: selectedArchitecture,
        osVersion: selectedOSVersion,
      });
      resetTemplateRequestContent();
    }
  }, [selectedArchitecture, selectedOSVersion]);

  const versionsListsState = useMemo(() => versionsLists, [versionsLists]);

  const versionsState = useMemo(() => {
    const isArchitectureItemSelected = (item) => item === selectedArchitecture;
    const isOSVersionItemSelected = (item) => item === selectedOSVersion;
    return {
      selectedArchitecture,
      selectedOSVersion,
      isArchitectureItemSelected,
      isOSVersionItemSelected,
      isExpandedList,
    };
  }, [selectedArchitecture, selectedOSVersion, isExpandedList]);

  return (
    <VersionsApi.Provider value={versionsApi}>
      <VersionsLists.Provider value={versionsListsState}>
        <VersionsState.Provider value={versionsState}>{children}</VersionsState.Provider>
      </VersionsLists.Provider>
    </VersionsApi.Provider>
  );
};
