import {
  AdditionalUuid,
  AllowedArchitecture,
  AllowedOSVersion,
  HardcodedUuid,
  OtherUuid,
  SnapshotDate,
  TemplateDetail,
  TemplateTitle,
  UseSnapshot,
} from '../core/types';

export type RepositoryVersionsSliceType = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
};

export type RedhatUuidsSliceType = {
  additionalUUIDs: AdditionalUuid[];
  hardcodedUUIDs: HardcodedUuid[];
};

export type OtherRepositoriesSliceType = {
  otherUUIDs: OtherUuid[];
  hardcodedUUIDs: HardcodedUuid[];
};

export type AllReposSliceType = {
  otherUUIDs: OtherUuid[];
  additionalUUIDs: AdditionalUuid[];
  hardcodedUUIDs: HardcodedUuid[];
};

export type SnapshotsSliceType = {
  snapshotDate: SnapshotDate;
  isLatestSnapshot: UseSnapshot;
};

export type TemplateDescriptionSliceType = {
  title: TemplateTitle;
  detail: TemplateDetail;
};
