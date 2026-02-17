import {
  AdditionalUUID,
  AllowedArchitecture,
  AllowedOSVersion,
  FilledTemplateTitle,
  FirstEmpty,
  HardcodedUUID,
  OtherUUID,
  SnapshotDate,
  TemplateDetail,
  TemplateTitle,
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createAndEditTemplate/shared/types/types';
import { TemplateRequestInProgress } from 'features/createAndEditTemplate/shared/types/types.compound';
import { every, isEmpty } from 'lodash';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react';

export const initialTemplateRequestState = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  hardcodedUUIDs: [],
  additionalUUIDs: [],
  otherUUIDs: [],
  snapshotDate: '',
  isLatestSnapshot: true,
  title: '',
  detail: '',
};

export const initalTemplateApi = {
  setArchitecture: () => {},
  setOSVersion: () => {},
  setHardcodedUUIDs: () => {},
  setAdditionalUUIDs: () => {},
  setOtherUUIDs: () => {},
  setSnapshotDate: () => {},
  setIsLatestSnapshot: () => {},
  setTitle: () => {},
  setDetail: () => {},
  resetTemplateRequestContent: () => {},
};

export type SaveArchitecture = Dispatch<SetStateAction<FirstEmpty<AllowedArchitecture>>>;
export type SaveOSVersion = Dispatch<SetStateAction<FirstEmpty<AllowedOSVersion>>>;
export type SaveHardcodedUUIDs = Dispatch<SetStateAction<HardcodedUUID[]>>;
export type SaveAdditionalUUIDs = Dispatch<SetStateAction<AdditionalUUID[]>>;
export type SaveOtherUUIDs = Dispatch<SetStateAction<OtherUUID[]>>;
export type SaveSnapshotDate = Dispatch<SetStateAction<SnapshotDate>>;
export type SaveIsLatestSnapshot = Dispatch<SetStateAction<UseLatestSnapshot>>;
export type SaveTitle = Dispatch<SetStateAction<FilledTemplateTitle>>;
export type SaveDetail = Dispatch<SetStateAction<TemplateDetail>>;
export type ResetTemplateRequestContent = () => void;

export type TemplateRequestApi = {
  setArchitecture: SaveArchitecture;
  setOSVersion: SaveOSVersion;
  setHardcodedUUIDs: SaveHardcodedUUIDs;
  setAdditionalUUIDs: SaveAdditionalUUIDs;
  setOtherUUIDs: SaveOtherUUIDs;
  setSnapshotDate: SaveSnapshotDate;
  setIsLatestSnapshot: SaveIsLatestSnapshot;
  setTitle: SaveTitle;
  setDetail: SaveDetail;
  resetTemplateRequestContent: ResetTemplateRequestContent;
};

type TemplateRequestDerivedState = {
  isEmptyTemplateRequest: boolean;
};
export const initialDerived = {
  isEmptyTemplateRequest: true,
};

const TemplateRequestApi = createContext<TemplateRequestApi>(initalTemplateApi);
export const useTemplateRequestApi = () => useContext(TemplateRequestApi);

const TemplateRequestState = createContext<TemplateRequestInProgress>(initialTemplateRequestState);
export const useTemplateRequestState = () => useContext(TemplateRequestState);

const TemplateRequestDerivedState = createContext<TemplateRequestDerivedState>(initialDerived);
export const useTemplateRequestDerivedState = () => useContext(TemplateRequestDerivedState);

export const AddTemplateContextProvider = ({ children }: { children: ReactNode }) => {
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
    return templateRequestState;
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

  const derivedState = useMemo(() => {
    const isEmptyTemplateRequest = every(templateRequestState, isEmpty);
    return { isEmptyTemplateRequest };
  }, [templateRequestState]);

  return (
    <TemplateRequestApi.Provider value={templateRequestApi}>
      <TemplateRequestState.Provider value={templateRequestState}>
        <TemplateRequestDerivedState.Provider value={derivedState}>
          {children}
        </TemplateRequestDerivedState.Provider>
      </TemplateRequestState.Provider>
    </TemplateRequestApi.Provider>
  );
};
