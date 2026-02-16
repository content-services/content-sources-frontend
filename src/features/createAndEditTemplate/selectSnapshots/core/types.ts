import { RepositoryUUID, SnapshotDate } from 'features/createAndEditTemplate/shared/types/types';
import { SnapshotUntilDate } from 'features/createAndEditTemplate/shared/types/types.snapshot';

export type SnapshotsUntilDateResponse = {
  data: SnapshotUntilDate[];
};

export type UUIDsAndDate = {
  date: SnapshotDate;
  uuids: RepositoryUUID[];
};

export type FilteredUUIDsWithLaterDate = RepositoryUUID[];

export type SnapshotNotification = 'hidden' | 'fetching' | 'no issues' | 'alert';
