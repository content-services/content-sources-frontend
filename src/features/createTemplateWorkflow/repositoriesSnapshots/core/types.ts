import { RepositoryUUID, SnapshotDate } from 'features/createTemplateWorkflow/shared/types.simple';

export type SnapshotNotification = 'hidden' | 'fetching' | 'no issues' | 'alert';

export type UUIDsAndDate = {
  date: SnapshotDate;
  uuids: RepositoryUUID[];
};

export type FilteredUUIDsWithLaterDate = RepositoryUUID[];
