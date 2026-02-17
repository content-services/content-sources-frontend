import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery, useRepositoryParams } from 'services/Content/ContentQueries';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';
import { lookupUrls } from 'features/createAndEditTemplate/shared/core/lookupUrls';
import { filterHardcodedUUIDs } from '../core/filterHardcodedUUIDs';
import {
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  FirstEmpty,
  HardcodedRepositoryUrls,
  OSVersion,
} from 'features/createAndEditTemplate/shared/types/types';
import { toDomain } from '../core/versionsListToDomain';

export type SelectArchitecture = (architecture: AllowedArchitecture) => void;
export type SelectOSVersion = (version: AllowedOSVersion) => void;

type DefineContentApiType = {
  architectures: Architecture[];
  osVersions: OSVersion[];
  selectedArchitecture: FirstEmpty<AllowedArchitecture>;
  selectedOSVersion: FirstEmpty<AllowedOSVersion>;
  onSelectArchitecture: SelectArchitecture;
  onSelectOSVersion: SelectOSVersion;
  isArchitectureItemSelected: (item: AllowedArchitecture) => boolean;
  isOSVersionItemSelected: (item: AllowedOSVersion) => boolean;
};

const initialData = {
  architectures: [],
  osVersions: [],
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  setVersionOpen: () => {},
  setArchOpen: () => {},
  onSelectArchitecture: () => {},
  onSelectOSVersion: () => {},
  isArchitectureItemSelected: () => false,
  isOSVersionItemSelected: () => false,
};

const DefineContentApi = createContext<DefineContentApiType>(initialData);
export const useDefineContentApi = () => useContext(DefineContentApi);

type DefineContentStoreType = {
  children: ReactNode;
};

export const DefineContentStore = ({ children }: DefineContentStoreType) => {
  const [hardcodedRedhatRepositories, setHardcodeRepositories] = useState<HardcodedRepositoryUrls>([
    '',
    '',
  ]);

  const { setHardcodedUUIDs, setOtherUUIDs, setArchitecture, setOSVersion } =
    useTemplateRequestApi();
  const { selectedArchitecture, selectedOSVersion } = useTemplateRequestState();

  const { uuid } = useEditTemplateState();

  // >>>>>>>>
  // get archs and versions to populate dropdowns
  const { data: lists } = useRepositoryParams();

  const systemsLists = useMemo(() => toDomain(lists), [lists]);
  // <<<<<<<<

  const onSelectArchitecture = (type) => {
    setArchitecture(type);
  };
  const onSelectOSVersion = (type) => {
    setOSVersion(type);
  };

  const isArchitectureItemSelected = (item) => item === selectedArchitecture;
  const isOSVersionItemSelected = (item) => item === selectedOSVersion;

  // >>>>>>>>
  // 2. fetch those hardcoded repositories
  const { data } = useContentListQuery(
    1,
    10,
    { urls: hardcodedRedhatRepositories },
    '',
    [ContentOrigin.REDHAT],
    !!hardcodedRedhatRepositories.length,
  );

  // 1. when a user selects arch and os
  // get urls of harcoded repos
  useEffect(() => {
    if (!!selectedArchitecture && !!selectedOSVersion) {
      const hardcodedUrls = lookupUrls({
        architecture: selectedArchitecture,
        osVersion: selectedOSVersion,
      });
      if (hardcodedUrls) {
        setHardcodeRepositories(hardcodedUrls);
      }
      if (!uuid) setOtherUUIDs([]);
    }
  }, [selectedArchitecture, selectedOSVersion, uuid]);

  // 3. filter out hardcoded uuids
  useEffect(() => {
    if (data?.data?.length) {
      const uuids = filterHardcodedUUIDs(data.data, hardcodedRedhatRepositories);
      setHardcodedUUIDs(uuids);
    }
  }, [data?.data]);
  // <<<<<<<<

  const api = {
    selectedArchitecture,
    selectedOSVersion,
    onSelectArchitecture,
    onSelectOSVersion,
    isArchitectureItemSelected,
    isOSVersionItemSelected,
    ...systemsLists,
  };

  return <DefineContentApi.Provider value={api}>{children}</DefineContentApi.Provider>;
};
