import {
  AdditionalUuid,
  AllowedArchitecture,
  AllowedOSVersion,
  FilledTemplateTitle,
  HardcodedUuid,
  LatestSnapshot,
  NoSnapshotDate,
  OtherUuid,
  RepositoryUUID,
  SnapshotDate,
  TemplateDetail,
  UseLatestSnapshot,
  UseSnapshotDate,
  WithoutLatestSnapshot,
} from './types.simple';

// -----------------------------
// template request in the process of the workflow
// TemplateRequestInProgress --> TemplateRequestFinalized --> TemplateRequestToSend --> FullTemplate

export type TemplateRequestInProgress = Partial<TemplateRequestFinalized>;

export type TemplateRequestFinalized = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUuid[];
  additionalUUIDs: AdditionalUuid[];
  otherUUIDs: OtherUuid[];
  snapshotDate: UseSnapshotDate;
  isLatestSnapshot: UseLatestSnapshot;
  title: FilledTemplateTitle;
  detail: TemplateDetail;
};

// -----------------------------
// template to send to server

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
