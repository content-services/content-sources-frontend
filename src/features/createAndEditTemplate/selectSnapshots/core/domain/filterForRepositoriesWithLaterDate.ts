import { SnapshotUntilDate } from 'features/createAndEditTemplate/shared/types/types.snapshot';
import { FilteredUUIDsWithLaterDate } from '../types';

type FilterForLaterDateRepositories = (
  snapshots: SnapshotUntilDate[],
) => FilteredUUIDsWithLaterDate;

export const filterForReposWithLaterDate: FilterForLaterDateRepositories = (allSnapshots) =>
  allSnapshots.filter(({ is_after }) => is_after).map(({ repository_uuid }) => repository_uuid);
