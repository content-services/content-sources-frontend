import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { TemplateRequest } from 'services/Templates/TemplateApi';
import {
  AdditionalUUID,
  AllowedArchitecture,
  AllowedOSVersion,
  FirstEmpty,
  HardcodedUUID,
  OtherUUID,
  TemplateDetail,
  TemplateTitle,
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createAndEditTemplate/shared/types/types';
import { TemplateRequestInProgress } from 'features/createAndEditTemplate/shared/types/types.compound';
import { initalTemplateApi, initialTemplateRequestState, TemplateRequestApiType } from './typing';

const TemplateRequestApi = createContext<TemplateRequestApiType>(initalTemplateApi);
export const useTemplateRequestApi = () => useContext(TemplateRequestApi);

const TemplateRequestState = createContext<TemplateRequestInProgress>(initialTemplateRequestState);
export const useTemplateRequestState = () => useContext(TemplateRequestState);

export interface AddTemplateContextInterface {
  templateRequest: Partial<TemplateRequest>;
  setTemplateRequest: (value: React.SetStateAction<Partial<TemplateRequest>>) => void;
  selectedRedhatRepos: Set<string>;
  setSelectedRedhatRepos: (uuidSet: Set<string>) => void;
  selectedCustomRepos: Set<string>;
  setSelectedCustomRepos: (uuidSet: Set<string>) => void;
  hardcodedRedhatRepositoryUUIDS: Set<string>;
  setHardcodeRepositoryUUIDS: (uuidSet: Set<string>) => void;
}

export const AddTemplateContext = createContext({} as AddTemplateContextInterface);

export const AddTemplateContextProvider = ({ children }: { children: ReactNode }) => {
  // To be deleted once all state in the new storage is set
  const [templateRequest, setTemplateRequest] = useState<Partial<TemplateRequest>>({});
  const [selectedRedhatRepos, setSelectedRedhatRepos] = useState<Set<string>>(new Set());
  const [selectedCustomRepos, setSelectedCustomRepos] = useState<Set<string>>(new Set());
  const [hardcodedRedhatRepositoryUUIDS, setHardcodeRepositoryUUIDS] = useState<Set<string>>(
    new Set(),
  );

  const [selectedArchitecture, setArchitecture] =
    useState<FirstEmpty<AllowedArchitecture>>(undefined);
  const [selectedOSVersion, setOSVersion] = useState<FirstEmpty<AllowedOSVersion>>(undefined);
  const [hardcodedUUIDs, setHardcodedUUIDs] = useState<HardcodedUUID[]>([]);
  const [additionalUUIDs, setAdditionalUUIDs] = useState<AdditionalUUID[]>([]);
  const [otherUUIDs, setOtherUUIDs] = useState<OtherUUID[]>([]);
  const [snapshotDate, setSnapshotDate] = useState<UseSnapshotDate>('');
  const [isLatestSnapshot, setIsLatestSnapshot] = useState<UseLatestSnapshot>(false);
  const [title, setTitle] = useState<TemplateTitle>('');
  const [detail, setDetail] = useState<TemplateDetail>('');

  // To be deleted once all state in the new storage is set
  const templateRequestDependencies = useMemo(
    () => [...selectedCustomRepos, ...selectedRedhatRepos],
    [selectedCustomRepos, selectedRedhatRepos],
  );

  // To be deleted once all state in the new storage is set
  useEffect(() => {
    setTemplateRequest((prev) => ({
      ...prev,
      repository_uuids: [...selectedRedhatRepos, ...selectedCustomRepos],
    }));
  }, [templateRequestDependencies]);

  const templateRequestApi = useMemo(() => {
    const resetTemplateRequestContent = () => {
      setHardcodedUUIDs([]);
      setAdditionalUUIDs([]);
      setOtherUUIDs([]);
      setSnapshotDate('');
      setIsLatestSnapshot(false);
    };
    const api = {
      setArchitecture,
      setOSVersion,
      setHardcodedUUIDs,
      setAdditionalUUIDs,
      setOtherUUIDs,
      setSnapshotDate,
      setIsLatestSnapshot,
      setTitle,
      setDetail,
      resetTemplateRequestContent,
    };
    return api;
  }, []);

  const templateRequestState = useMemo(() => {
    const templateRequestState = {
      selectedArchitecture,
      selectedOSVersion,
      hardcodedUUIDs,
      additionalUUIDs,
      otherUUIDs,
      snapshotDate,
      isLatestSnapshot,
      title,
      detail,
    };
    return templateRequestState as TemplateRequestInProgress;
  }, [
    selectedArchitecture,
    selectedOSVersion,
    hardcodedUUIDs,
    additionalUUIDs,
    otherUUIDs,
    snapshotDate,
    isLatestSnapshot,
    title,
    detail,
  ]);

  return (
    <AddTemplateContext.Provider
      value={{
        templateRequest,
        setTemplateRequest,
        selectedRedhatRepos,
        setSelectedRedhatRepos,
        selectedCustomRepos,
        setSelectedCustomRepos,
        setHardcodeRepositoryUUIDS,
        hardcodedRedhatRepositoryUUIDS,
      }}
    >
      <TemplateRequestApi.Provider value={templateRequestApi}>
        <TemplateRequestState.Provider value={templateRequestState}>
          {children}
        </TemplateRequestState.Provider>
      </TemplateRequestApi.Provider>
    </AddTemplateContext.Provider>
  );
};

export const useAddTemplateContext = () => useContext(AddTemplateContext);
