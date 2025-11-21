import { formatTemplateDate } from 'helpers';
import { useCallback } from 'react';
import { useFetchSnapshotsByDates } from '../api/fetchSnapshotsByDates';
import { useFetchRepositoriesForSnapshots } from '../api/useRepositoriesForSnapshotsQuery';

const filterForReposWithLaterDate = (allSnapshots) =>
  allSnapshots.filter(({ is_after }) => is_after).map(({ repository_uuid }) => repository_uuid);

const filterRepositoriesNames = (repositories) => repositories.map(({ name }) => name);

export const useValidateSnapshots = ({ saveNotification, saveRepositoryNames }) => {
  const getSnapshotsUntilDate = useFetchSnapshotsByDates();
  const getRepositoryNames = useFetchRepositoriesForSnapshots();

  const validateSnapshots = async (snapshotDate, allUUIDs) => {
    const formattedDate = formatTemplateDate(snapshotDate);
    saveNotification('fetching');
    const snapshots = await getSnapshotsUntilDate({ date: formattedDate, uuids: allUUIDs });
    const uuidsAfterDate = filterForReposWithLaterDate(snapshots.data);

    if (uuidsAfterDate.length) {
      const repositories = await getRepositoryNames(uuidsAfterDate);
      const names = filterRepositoriesNames(repositories);
      saveNotification('alert');
      saveRepositoryNames(names);
    } else {
      saveNotification('no issues');
      saveRepositoryNames([]);
    }
  };
  return useCallback(validateSnapshots, []);
};
