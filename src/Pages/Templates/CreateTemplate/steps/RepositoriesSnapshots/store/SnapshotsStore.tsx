import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { isDateValid } from 'helpers';
import {
  useAllReposSlice,
  useSnapshotsSlice,
  useTemplateRequestApi,
} from '../../../store/TemplateRequestStore';
import { useValidateSnapshots } from '../core/validateSnapshots';

const SnapshotApi = createContext(null);
export const useSnapshotApi = () => useContext(SnapshotApi);

const SnapshotState = createContext(null);
export const useSnapshotState = () => useContext(SnapshotState);

const DependencyNotficationState = createContext(null);
export const useDependencyNotificationState = () => useContext(DependencyNotficationState);

type SnapshotNotification = 'hidden' | 'fetching' | 'no issues' | 'alert';

export const SnapshotsStore = ({ children }: PropsWithChildren) => {
  const [notification, setNotification] = useState<SnapshotNotification>('hidden');
  const [repositoryNames, setRepositoryNames] = useState([]);

  const { setSnapshotDate, setIsLatestSnapshot } = useTemplateRequestApi();

  const { isLatestSnapshot, snapshotDate } = useSnapshotsSlice();
  const { otherUUIDs, additionalUUIDs, hardcodedUUIDs } = useAllReposSlice();

  const validateSnapshots = useValidateSnapshots({
    saveNotification: setNotification,
    saveRepositoryNames: setRepositoryNames,
  });

  const snapshotApi = useMemo(() => {
    const toggleLatestSnapshot = (useLatest) => {
      setIsLatestSnapshot(useLatest);
      setSnapshotDate('');
      setNotification('hidden');
    };

    const chooseSnapshotDate = (_, val) => {
      const isValid = isDateValid(val);
      if (isValid) {
        setSnapshotDate(val);
      } else {
        setSnapshotDate('');
        setNotification('hidden');
      }
    };

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
    const noIssues = notification === 'no issues';
    const isAlert = notification === 'alert';
    return { repositoryNames, noIssues, isFetching, isHidden, isAlert };
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
