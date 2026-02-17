import {
  AdditionalUUID,
  AllowedArchitecture,
  AllowedOSVersion,
  FilledTemplateTitle,
  HardcodedUUID,
  LatestSnapshot,
  NoSnapshotDate,
  OtherUUID,
  RepositoryUUID,
  SnapshotDate,
  TemplateDetail,
  TemplateUUID,
  UseLatestSnapshot,
  UseSnapshotDate,
  WithoutLatestSnapshot,
} from './types';

export type TemplateRequestInProgress = Partial<TemplateRequestFinalized>;
export type TemplateRequestFinalized = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: UseSnapshotDate;
  isLatestSnapshot: UseLatestSnapshot;
  title: FilledTemplateTitle;
  detail: TemplateDetail;
};

// -----------------------------
// new template to send to server

export type TemplateRequestWithDate = {
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repository_uuids: RepositoryUUID[];
  date: SnapshotDate;
  use_latest: WithoutLatestSnapshot;
  name: FilledTemplateTitle;
  description: TemplateDetail;
};

export type TemplateRequestWithLatestSnapshot = {
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repository_uuids: RepositoryUUID[];
  date: NoSnapshotDate;
  use_latest: LatestSnapshot;
  name: FilledTemplateTitle;
  description: TemplateDetail;
};

export type TemplateRequestToSend = TemplateRequestWithDate | TemplateRequestWithLatestSnapshot;

// -----------------------------
// edit template with its uuid

export type TemplateRequestFinalizedWithUUID = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: UseSnapshotDate;
  isLatestSnapshot: UseLatestSnapshot;
  title: FilledTemplateTitle;
  detail: TemplateDetail;
  uuid: TemplateUUID;
};

// -----------------------------
// edited template to send to server

export type EditTemplateWithDate = {
  uuid: TemplateUUID;
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repository_uuids: RepositoryUUID[];
  date: SnapshotDate;
  use_latest: WithoutLatestSnapshot;
  name: FilledTemplateTitle;
  description: TemplateDetail;
};

export type EditTemplateWithLatestSnapshot = {
  uuid: TemplateUUID;
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repository_uuids: RepositoryUUID[];
  date: NoSnapshotDate;
  use_latest: LatestSnapshot;
  name: FilledTemplateTitle;
  description: TemplateDetail;
};

export type EditTemplateToSend = EditTemplateWithDate | EditTemplateWithLatestSnapshot;
