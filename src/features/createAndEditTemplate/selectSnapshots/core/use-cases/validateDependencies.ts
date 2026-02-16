import { formatTemplateDate } from 'features/createAndEditTemplate/shared/core/formatTemplateDate';
import { useFetchSnapshotsUntilDate } from '../../api/useFetchSnapshotsUntilDate';
import { ValidateSnapshots } from '../ports';
import { filterForReposWithLaterDate } from '../domain/filterForRepositoriesWithLaterDate';
import { filterRepositoriesNames } from '../domain/filterRepositoriesNames';
import { useCallback } from 'react';
import { useFetchRepositoriesForSnapshots } from '../../api/useRepositoriesForSnapshotsQuery';

export const useValidateDependencies = ({ saveNotification, saveRepositoryNames }) => {
  const getSnapshotsUntilDate = useFetchSnapshotsUntilDate();
  const getRepositoryNames = useFetchRepositoriesForSnapshots();

  const validateDependencies: ValidateSnapshots = async (snapshotDate, allUUIDs) => {
    const formattedDate = formatTemplateDate(snapshotDate);
    saveNotification('fetching');
    const snapshots = await getSnapshotsUntilDate({ date: formattedDate, uuids: allUUIDs });
    const uuidsAfterDate = filterForReposWithLaterDate(snapshots.data);

    if (uuidsAfterDate.length) {
      const repositories = await getRepositoryNames(uuidsAfterDate);
      const names = filterRepositoriesNames(repositories!);
      saveNotification('alert');
      saveRepositoryNames(names);
    } else {
      saveNotification('no issues');
      saveRepositoryNames([]);
    }
  };
  return useCallback(validateDependencies, []);
};
