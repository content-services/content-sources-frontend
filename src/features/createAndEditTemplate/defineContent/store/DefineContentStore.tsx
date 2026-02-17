import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { createContext, ReactNode, useContext, useLayoutEffect, useMemo } from 'react';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';
import {
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  FirstEmpty,
  OSVersion,
} from 'features/createAndEditTemplate/shared/types/types';
import { useChooseHardcodedUUIDs } from '../core/use-cases/chooseHardcodedUUIDs';
import { useInitializeSystemsLists } from '../core/use-cases/initializeSystemsLists';
import { SelectArchitecture, SelectOSVersion } from '../core/ports';

type DefineContentApiType = {
  onSelectArchitecture: SelectArchitecture;
  onSelectOSVersion: SelectOSVersion;
};

const initialApi = {
  onSelectArchitecture: () => {},
  onSelectOSVersion: () => {},
};

type DefineContentStateType = {
  selectedArchitecture: FirstEmpty<AllowedArchitecture>;
  selectedOSVersion: FirstEmpty<AllowedOSVersion>;
  isArchitectureItemSelected: (item: AllowedArchitecture) => boolean;
  isOSVersionItemSelected: (item: AllowedOSVersion) => boolean;
};

const initialState = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  isArchitectureItemSelected: () => false,
  isOSVersionItemSelected: () => false,
};

export type SystemConfigurationsLists = {
  architectures: Architecture[];
  osVersions: OSVersion[];
};

export const initialSystemsLists = {
  architectures: [],
  osVersions: [],
};

const SystemConfigurationsLists = createContext<SystemConfigurationsLists>(initialSystemsLists);
export const useSystemLists = () => useContext(SystemConfigurationsLists);

const DefineContentApi = createContext<DefineContentApiType>(initialApi);
export const useDefineContentApi = () => useContext(DefineContentApi);

const DefineContentState = createContext<DefineContentStateType>(initialState);
export const useDefineContentState = () => useContext(DefineContentState);

type DefineContentStoreType = {
  children: ReactNode;
};

export const DefineContentStore = ({ children }: DefineContentStoreType) => {
  const { setArchitecture, setOSVersion, resetTemplateRequestContent } = useTemplateRequestApi();
  const { selectedArchitecture, selectedOSVersion } = useTemplateRequestState();
  const { isEditTemplate } = useEditTemplateState();

  const systemsLists = useInitializeSystemsLists();
  const chooseHardcodedRedhatRepositories = useChooseHardcodedUUIDs();

  const defineContentApi = useMemo(() => {
    const onSelectArchitecture: SelectArchitecture = (type) => {
      setArchitecture(type);
    };
    const onSelectOSVersion: SelectOSVersion = (type) => {
      setOSVersion(type);
    };
    return { onSelectArchitecture, onSelectOSVersion };
  }, []);

  const defineContentState = useMemo(() => {
    const isArchitectureItemSelected = (item) => item === selectedArchitecture;
    const isOSVersionItemSelected = (item) => item === selectedOSVersion;
    return {
      selectedArchitecture,
      selectedOSVersion,
      isArchitectureItemSelected,
      isOSVersionItemSelected,
    };
  }, [selectedArchitecture, selectedOSVersion]);

  // automatically retrigger on arch or osversion change
  useLayoutEffect(() => {
    const isContentFilled = !!selectedArchitecture && !!selectedOSVersion;

    if (isContentFilled && !isEditTemplate) {
      resetTemplateRequestContent();
      chooseHardcodedRedhatRepositories({
        architecture: selectedArchitecture,
        osVersion: selectedOSVersion,
      });
    }
  }, [selectedArchitecture, selectedOSVersion, isEditTemplate]);

  return (
    <SystemConfigurationsLists.Provider value={systemsLists}>
      <DefineContentApi.Provider value={defineContentApi}>
        <DefineContentState.Provider value={defineContentState}>
          {children}
        </DefineContentState.Provider>
      </DefineContentApi.Provider>
    </SystemConfigurationsLists.Provider>
  );
};
