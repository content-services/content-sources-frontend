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
  WithoutSnapshotDate,
} from './types';

type TemplateRequestInProgressBase = {
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: UseSnapshotDate;
  isLatestSnapshot: UseLatestSnapshot;
  title: string;
  detail: TemplateDetail;
};

type TemplateRequestStartStep = {
  selectedArchitecture: undefined;
  selectedOSVersion: undefined;
} & TemplateRequestInProgressBase;

type TemplateRequestFurtherSteps = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
} & TemplateRequestInProgressBase;

export type TemplateRequestInProgress = TemplateRequestStartStep | TemplateRequestFurtherSteps;

export type TemplateRequestFinalized =
  | TemplateRequestFinalizedWithDate
  | TemplateRequestFinalizedWithLatestSnapshot;

type TemplateRequestFinalizedWithDate = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: SnapshotDate;
  isLatestSnapshot: WithoutLatestSnapshot;
  title: FilledTemplateTitle;
  detail: TemplateDetail;
};

type TemplateRequestFinalizedWithLatestSnapshot = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: WithoutSnapshotDate;
  isLatestSnapshot: LatestSnapshot;
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

export type TemplateRequestFinalizedWithUUID =
  | EditTemplateRequestFinalizedWithDate
  | EditTemplateRequestFinalizedLatestSnapshot;

type EditTemplateRequestFinalizedWithDate = {
  uuid: TemplateUUID;
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: SnapshotDate;
  isLatestSnapshot: WithoutLatestSnapshot;
  title: FilledTemplateTitle;
  detail: TemplateDetail;
};

type EditTemplateRequestFinalizedLatestSnapshot = {
  uuid: TemplateUUID;
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUUID[];
  additionalUUIDs: AdditionalUUID[];
  otherUUIDs: OtherUUID[];
  snapshotDate: WithoutSnapshotDate;
  isLatestSnapshot: LatestSnapshot;
  title: FilledTemplateTitle;
  detail: TemplateDetail;
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
