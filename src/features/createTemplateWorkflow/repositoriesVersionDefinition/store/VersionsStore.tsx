import {
  createContext,
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useChooseHardcodedUUIDs } from '../core/use-cases/chooseHardcodedUUIDs';
import { useGetRepositoryVersionsLists } from '../core/use-cases/initializeVersionsLists';
import { IsListExpanded, VersionsApiType, VersionsStateType } from './types.store';
import { RepositoryVersionsLists } from '../core/types';
import {
  useRepositoryVersionsSlice,
  useTemplateRequestApi,
} from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { useChooseArchitecture } from '../core/use-cases/chooseArchitecture';
import { useChooseOSVersion } from '../core/use-cases/chooseOSVersion';
import { initalVersionsState, initialVersionsApi, initialVersionsLists } from './store.initials';

const VersionsLists = createContext<RepositoryVersionsLists>(initialVersionsLists);
export const useVersionsLists = () => useContext(VersionsLists);

const VersionsApi = createContext<VersionsApiType>(initialVersionsApi);
export const useVersionsApi = () => useContext(VersionsApi);

const VersionsState = createContext<VersionsStateType>(initalVersionsState);
export const useVersionsState = () => useContext(VersionsState);

export const VersionsStore = ({ children }: PropsWithChildren) => {
  const [isExpandedList, setIsExpandedList] = useState<IsListExpanded>({
    architecture: false,
    osVersion: false,
  });
  const versionsLists = useGetRepositoryVersionsLists();
  const chooseHardcodedRedhatRepositories = useChooseHardcodedUUIDs();

  const chooseArchitecture = useChooseArchitecture();
  const chooseOSVersion = useChooseOSVersion();

  const { resetTemplateRequestContent } = useTemplateRequestApi();
  const { selectedArchitecture, selectedOSVersion } = useRepositoryVersionsSlice();

  const versionsApi = useMemo(() => {
    const onSelectArchitecture = (val) => {
      chooseArchitecture(val);
      updateIsExpandedList({ architecture: false });
    };
    const onSelectOSVersion = (val) => {
      chooseOSVersion(val);
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
      resetTemplateRequestContent();
      chooseHardcodedRedhatRepositories({
        architecture: selectedArchitecture,
        osVersion: selectedOSVersion,
      });
    }
  }, [selectedArchitecture, selectedOSVersion]);

  const versionsListsState = useMemo(() => versionsLists, [versionsLists]);

  const versionsState = useMemo(() => {
    const isArchitectureItemSelected = (item) => item === selectedArchitecture;
    const isOSVersionItemSelected = (item) => item === selectedOSVersion;
    const selectedArchitectureItem = versionsLists.architectures.filter(
      ({ descriptor }) => descriptor === selectedArchitecture,
    )[0];
    const selectedOSVersionItem = versionsLists.osVersions.filter(
      ({ descriptor }) => descriptor === selectedOSVersion,
    )[0];
    return {
      selectedArchitecture,
      selectedOSVersion,
      isArchitectureItemSelected,
      isOSVersionItemSelected,
      isExpandedList,
      selectedArchitectureItem,
      selectedOSVersionItem,
    };
  }, [selectedArchitecture, selectedOSVersion, isExpandedList, versionsLists]);

  return (
    <VersionsApi.Provider value={versionsApi}>
      <VersionsLists.Provider value={versionsListsState}>
        <VersionsState.Provider value={versionsState}>{children}</VersionsState.Provider>
      </VersionsLists.Provider>
    </VersionsApi.Provider>
  );
};
