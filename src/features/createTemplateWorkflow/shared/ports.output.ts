import { Dispatch, SetStateAction } from 'react';
import {
  AdditionalUuid,
  AllowedArchitecture,
  AllowedOSVersion,
  FilledTemplateTitle,
  HardcodedUuid,
  OtherUuid,
  SnapshotDate,
  TemplateDetail,
  TemplateTitle,
  UseLatestSnapshot,
  UseSnapshotDate,
} from './types.simple';

// ---------------------
// Storage

// saving data into storage

export type SaveArchitecture = (architecture: AllowedArchitecture) => void;
export type SaveOSVersion = (version: AllowedOSVersion) => void;
export type SaveHardcodedUUIDs = Dispatch<SetStateAction<HardcodedUuid[]>>;
export type SaveAdditionalUUIDs = Dispatch<SetStateAction<AdditionalUuid[]>>;
export type SaveOtherUUIDs = Dispatch<SetStateAction<OtherUuid[]>>;

export type SaveSnapshotDate = (date: SnapshotDate) => void;
export type SaveIsLatestSnapshot = (isLatest: UseLatestSnapshot) => void;
export type SaveTitle = (title: FilledTemplateTitle) => void;
export type SaveDetail = (detail: TemplateDetail) => void;
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

// reading data from storage

export type RepositoryVersionsSliceInProgress = {
  selectedArchitecture: AllowedArchitecture | undefined;
  selectedOSVersion: AllowedOSVersion | undefined;
};

export type RedhatReposSliceInProgress = {
  hardcodedUUIDs: HardcodedUuid[];
  additionalUUIDs: AdditionalUuid[];
};

export type AllReposSliceInProgress = {
  hardcodedUUIDs: HardcodedUuid[];
  additionalUUIDs: AdditionalUuid[];
  otherUUIDs: OtherUuid[];
};

export type SnapshotsSliceInProgress = {
  snapshotDate: UseSnapshotDate;
  isLatestSnapshot: UseLatestSnapshot;
};

export type DescriptionSliceInProgress = {
  title: TemplateTitle;
  detail: TemplateDetail;
};

export type OtherRepositoriesSliceInProgress = {
  hardcodedUUIDs: HardcodedUuid[];
  otherUUIDs: OtherUuid[];
};
