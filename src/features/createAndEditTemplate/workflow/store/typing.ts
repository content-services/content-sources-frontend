import { Dispatch, SetStateAction } from 'react';
import {
  FirstEmpty,
  AdditionalUUID,
  AllowedArchitecture,
  AllowedOSVersion,
  FilledTemplateTitle,
  HardcodedUUID,
  OtherUUID,
  SnapshotDate,
  TemplateDetail,
  UseLatestSnapshot,
} from 'features/createAndEditTemplate/shared/types/types';

// state
export const initialTemplateRequestState = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  hardcodedUUIDs: [],
  additionalUUIDs: [],
  otherUUIDs: [],
  snapshotDate: '',
  isLatestSnapshot: false,
  title: '',
  detail: '',
};

// api
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

export type TemplateRequestApiType = {
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

// derived state
export type TemplateRequestDerivedStateType = {
  isEmptyTemplateRequest: boolean;
};
export const initialDerived = {
  isEmptyTemplateRequest: true,
};
