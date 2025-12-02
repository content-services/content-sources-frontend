import { FilteredUUIDsWithLaterDate } from '../types';
import { SnapshotUntilDate } from 'features/createTemplateWorkflow/shared/types.snapshot';

type FilterForLaterDateRepositories = (
  snapshots: SnapshotUntilDate[],
) => FilteredUUIDsWithLaterDate;

export const filterForReposWithLaterDate: FilterForLaterDateRepositories = (allSnapshots) =>
  allSnapshots.filter(({ is_after }) => is_after).map(({ repository_uuid }) => repository_uuid);
