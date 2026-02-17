export type Url = string;
type UUID = string;
export type TemplateUUID = UUID;

export type FirstEmpty<T> = T | undefined;

// Architecture
export const ALLOWED_ARCHITECTURES = ['x86_64', 'aarch64'] as const;
export type AllowedArchitecture = (typeof ALLOWED_ARCHITECTURES)[number];
export type ArchitectureName = string;
export type Architecture = {
  descriptor: AllowedArchitecture;
  displayName: ArchitectureName;
};

// OS Version
export const ALLOWED_OS_VERSIONS = ['8', '9', '10'] as const;
export type AllowedOSVersion = (typeof ALLOWED_OS_VERSIONS)[number];
export type OSVersionName = string;
export type OSVersion = {
  descriptor: AllowedOSVersion;
  displayName: OSVersionName;
};

// Repo UUIDs
export type HardcodedUUID = UUID;
export type AdditionalUUID = UUID;
export type OtherUUID = UUID;
export type RedhatUUID = HardcodedUUID | AdditionalUUID;
export type RepositoryUUID = HardcodedUUID | AdditionalUUID | OtherUUID;

// Snapshot date
export type Date = string;
export type SnapshotDate = Date;
export type WithoutSnapshotDate = '';
export type UseSnapshotDate = SnapshotDate | WithoutSnapshotDate;
export type NoSnapshotDate = null;

// Use latest snapshot
export type WithoutLatestSnapshot = false;
export type LatestSnapshot = true;
export type UseLatestSnapshot = LatestSnapshot | WithoutLatestSnapshot;

// Title and Detail
export type FilledTemplateTitle = string;
export type EmptyTemplateTitle = '';
export type TemplateTitle = FilledTemplateTitle | EmptyTemplateTitle;

export type FilledTemplateDetail = string;
export type EmptyTemplateDetail = '';
export type TemplateDetail = FilledTemplateDetail | EmptyTemplateDetail;

// Selected Architecture & OSVersion
type ArchitectureVersionCode = `${AllowedArchitecture}-${AllowedOSVersion}`;
export type UrlsForArchitectureAndVersion = Record<
  ArchitectureVersionCode,
  HardcodedRepositoryUrls
>;
export type HardcodedRepositoryUrls = [Url, Url];
