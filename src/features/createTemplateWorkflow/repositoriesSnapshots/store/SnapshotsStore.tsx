import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { useValidateSnapshots } from '../core/use-cases/validateDependencies';
import { SnapshotNotification } from '../core/types';
import {
  useAllReposSlice,
  useSnapshotsSlice,
} from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { NotficationStateType, SnapshotApiType, SnapshotStateType } from './types.store';
import { initialNotifications, initialSnapshots, initialSnapshotsApi } from './store.initials';
import { useToggleUseLatestSnapshot } from '../core/use-cases/toggleUseLatestSnapshot';
import { useChooseSnapshotDate } from '../core/use-cases/chooseSnapshotDate';

const SnapshotApi = createContext<SnapshotApiType>(initialSnapshotsApi);
export const useSnapshotApi = () => useContext(SnapshotApi);

const SnapshotState = createContext<SnapshotStateType>(initialSnapshots);
export const useSnapshotState = () => useContext(SnapshotState);

const DependencyNotficationState = createContext<NotficationStateType>(initialNotifications);
export const useDependencyNotificationState = () => useContext(DependencyNotficationState);

export const SnapshotsStore = ({ children }: PropsWithChildren) => {
  const [notification, setNotification] = useState<SnapshotNotification>('hidden');
  const [repositoryNames, setRepositoryNames] = useState([]);

  const { isLatestSnapshot, snapshotDate } = useSnapshotsSlice();
  const { otherUUIDs, additionalUUIDs, hardcodedUUIDs } = useAllReposSlice();

  const toggleLatestSnapshot = useToggleUseLatestSnapshot({ setNotification });
  const chooseSnapshotDate = useChooseSnapshotDate({ setNotification });
  const validateSnapshots = useValidateSnapshots({
    saveNotification: setNotification,
    saveRepositoryNames: setRepositoryNames,
  });

  const snapshotApi = useMemo(() => {
    const saveNotification = (type) => {
      setNotification(type);
    };
    const saveRepositoryNames = (names) => {
      setRepositoryNames(names);
    };
    return { toggleLatestSnapshot, chooseSnapshotDate, saveNotification, saveRepositoryNames };
  }, []);

  useMemo(() => {
    const allUUIDs = [...otherUUIDs, ...additionalUUIDs, ...hardcodedUUIDs];
    const shouldValidateSnapshots = snapshotDate !== '' && allUUIDs.length !== 0;
    if (shouldValidateSnapshots) {
      validateSnapshots(snapshotDate, allUUIDs);
    }
  }, [snapshotDate, otherUUIDs, additionalUUIDs, hardcodedUUIDs]);

  // if arch or osversion changed, reset previous notification
  useMemo(() => {
    if (snapshotDate === '' && isLatestSnapshot === false) {
      setNotification('hidden');
      setRepositoryNames([]);
    }
  }, [snapshotDate, isLatestSnapshot]);

  const snapshotsState = useMemo(
    () => ({ snapshotDate, isLatestSnapshot }),
    [snapshotDate, isLatestSnapshot],
  );

  const notificationState = useMemo(() => {
    const isHidden = notification === 'hidden';
    const isFetching = notification === 'fetching';
    const isNoIssues = notification === 'no issues';
    const isAlert = notification === 'alert';
    return { repositoryNames, isNoIssues, isFetching, isHidden, isAlert };
  }, [notification, repositoryNames]);

  return (
    <SnapshotApi.Provider value={snapshotApi}>
      <SnapshotState.Provider value={snapshotsState}>
        <DependencyNotficationState.Provider value={notificationState}>
          {children}
        </DependencyNotficationState.Provider>
      </SnapshotState.Provider>
    </SnapshotApi.Provider>
  );
};
