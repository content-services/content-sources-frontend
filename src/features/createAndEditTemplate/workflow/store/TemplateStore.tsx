import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { every, isEmpty } from 'lodash';
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
import {
  initalTemplateApi,
  initialDerived,
  initialTemplateRequestState,
  TemplateRequestApiType,
  TemplateRequestDerivedStateType,
} from './typing';

const TemplateRequestApi = createContext<TemplateRequestApiType>(initalTemplateApi);
export const useTemplateRequestApi = () => useContext(TemplateRequestApi);

const TemplateRequestState = createContext<TemplateRequestInProgress>(initialTemplateRequestState);
export const useTemplateRequestState = () => useContext(TemplateRequestState);

const TemplateRequestDerivedState = createContext<TemplateRequestDerivedStateType>(initialDerived);
export const useTemplateRequestDerivedState = () => useContext(TemplateRequestDerivedState);

export const TemplateStore = ({ children }: { children: ReactNode }) => {
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
