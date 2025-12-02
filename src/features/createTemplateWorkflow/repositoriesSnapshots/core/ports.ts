import { FilteredUUIDsWithLaterDate, SnapshotNotification, UUIDsAndDate } from './types';
import {
  FullRepository,
  RepositoryName,
} from 'features/createTemplateWorkflow/shared/types.repository';
import {
  RepositoryUUID,
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createTemplateWorkflow/shared/types.simple';
import { SnapshotUntilDate } from 'features/createTemplateWorkflow/shared/types.snapshot';

// =================
// port input
export type ToggleUseLatestSnapshot = (useLatest: UseLatestSnapshot) => void;
export type ChooseSnapshotDate = (date: UseSnapshotDate) => void;
export type ValidateSnapshots = (
  date: UseSnapshotDate,
  allUUIDs: RepositoryUUID[],
) => Promise<void>;

// =================
// ports output

// network
export type SnapshotsUntilDateResponse = {
  data: SnapshotUntilDate[];
};

export type FetchSnapshotsUntilDate = (input: UUIDsAndDate) => Promise<SnapshotsUntilDateResponse>;
export type FetchRepositoriesForSnapshots = (
  uuids: FilteredUUIDsWithLaterDate,
) => Promise<FullRepository[]>;

// store
export type SaveSnapshotNotification = (type: SnapshotNotification) => void;
export type SaveRepositoryNames = (names: RepositoryName[]) => void;
