import {
  RepositoryUUID,
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createAndEditTemplate/shared/types/types';
import {
  FilteredUUIDsWithLaterDate,
  SnapshotNotification,
  SnapshotsUntilDateResponse,
  UUIDsAndDate,
} from './types';
import {
  FullRepository,
  RepositoryName,
} from 'features/createAndEditTemplate/shared/types/types.repository';

// input ports
export type ValidateSnapshots = (
  date: UseSnapshotDate,
  allUUIDs: RepositoryUUID[],
) => Promise<void>;

export type ToggleUseLatestSnapshot = (useLatest: UseLatestSnapshot) => void;
export type ChooseSnapshotDate = (date: UseSnapshotDate) => void;

// output ports
export type FetchSnapshotsUntilDate = (input: UUIDsAndDate) => Promise<SnapshotsUntilDateResponse>;

export type FetchRepositoriesForSnapshots = (
  uuids: FilteredUUIDsWithLaterDate,
) => Promise<FullRepository[]>;

export type SaveSnapshotNotification = (type: SnapshotNotification) => void;
export type SaveRepositoryNames = (names: RepositoryName[]) => void;

// read from top level store - hardcodedUUIDs, additionalUUIDs, otherUUIDs, snapshotDate, isLatestSnapshot
// set top level store - selectedArchitecture, selectedOSVersion
