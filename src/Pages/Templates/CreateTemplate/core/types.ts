// import { FirstEmpty } from '../types';

export type Step = number;
export type IsStepDisabled = boolean;

// =========================
// Template Request

// ---
// Template Request in Progress

export type TemplateRequestInProgress = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  hardcodedUUIDs: HardcodedUuid[];
  additionalUUIDs: AdditionalUuid[];
  otherUUIDs: OtherUuid[];
  snapshotDate: SnapshotDate;
  isLatestSnapshot: UseSnapshot;
  title: TemplateTitle;
  detail: TemplateDetail;
};

// ---
// Template Request To Send

type TemplateRequestToSendWithDate = {
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repository_uuids: AnyUuid[];
  date: SnapshotDate;
  use_latest: UseNotLatestSnapshot;
  name: TemplateTitle;
  description: TemplateDetail;
};

type TemplateRequestToSendWithLatest = {
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  repository_uuids: AnyUuid[];
  date: NoSnapshotDate;
  use_latest: UseLatestSnapshot;
  name: TemplateTitle;
  description: TemplateDetail;
};

export type TemplateRequestToSend = TemplateRequestToSendWithDate | TemplateRequestToSendWithLatest;

// =========================
// Template Request fields

// Architecture
export const ALLOWED_ARCHITECTURES = ['x86_64', 'aarch64'] as const;
export type AllowedArchitecture = (typeof ALLOWED_ARCHITECTURES)[number];

type ArchitectureName = string;

export type Architecture = {
  descriptor: AllowedArchitecture;
  displayName: ArchitectureName;
};

// OS Version
export const ALLOWED_OS_VERSIONS = ['8', '9', '10'] as const;
export type AllowedOSVersion = (typeof ALLOWED_OS_VERSIONS)[number];

type OSVersionName = string;

export type OSVersion = {
  descriptor: AllowedOSVersion;
  displayName: OSVersionName;
};

// Hardcoded UUIDs, AdditionalUUIDs, OtherUUIDs
export type Uuid = string;

export type HardcodedUuid = Uuid;
export type AdditionalUuid = Uuid;
export type OtherUuid = Uuid;

type AnyUuid = HardcodedUuid | AdditionalUuid | OtherUuid;
// type AllUuids = HardcodedUuid[] & AdditionalUuid[] & OtherUuid[];

// Snapshot date
type Date = string;
export type SnapshotDate = Date;
type NoSnapshotDate = null;

// Use latest snapshot
type UseNotLatestSnapshot = false;
type UseLatestSnapshot = true;
export type UseSnapshot = UseLatestSnapshot | UseNotLatestSnapshot;

// Title and Detail
export type TemplateTitle = string;
export type TemplateDetail = string;
