import {
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createAndEditTemplate/shared/types/types';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useValidateDependencies } from '../core/use-cases/validateDependencies';
import { SnapshotNotification } from '../core/types';
import { RepositoryName } from 'features/createAndEditTemplate/shared/types/types.repository';
import { isDateValid } from 'helpers';

type SetUpDateApiType = {
  toggleLatestSnapshot: (useLatest: UseLatestSnapshot) => void;
  chooseSnapshotDate: (date: UseSnapshotDate) => void;
};

type SetUpDateStateType = {
  isLatestSnapshot: UseLatestSnapshot;
  snapshotDate: UseSnapshotDate;
};

type NotficationStateType = {
  repositoryNames: RepositoryName[];
  isNoIssues: boolean;
  isFetching: boolean;
  isHidden: boolean;
  isAlert: boolean;
};

const initialApi = {
  toggleLatestSnapshot: () => {},
  chooseSnapshotDate: () => {},
};

const initialState = {
  snapshotDate: '',
  isLatestSnapshot: false,
};

const initialNotifications = {
  repositoryNames: [],
  isHidden: true,
  isNoIssues: false,
  isFetching: false,
  isAlert: false,
};

const SetUpDateApi = createContext<SetUpDateApiType>(initialApi);
export const useSetUpDateApi = () => useContext(SetUpDateApi);

const SetUpDateState = createContext<SetUpDateStateType>(initialState);
export const useSetUpDateState = () => useContext(SetUpDateState);

const DependencyNotficationState = createContext<NotficationStateType>(initialNotifications);
export const useDependencyNotificationState = () => useContext(DependencyNotficationState);

type SetUpDateStoreType = {
  children: ReactNode;
};

export const SetUpDateStore = ({ children }: SetUpDateStoreType) => {
  const [notification, setNotification] = useState<SnapshotNotification>('hidden');
  const [repositoryNames, setRepositoryNames] = useState([]);

  const { setSnapshotDate, setIsLatestSnapshot } = useTemplateRequestApi();
  const { hardcodedUUIDs, additionalUUIDs, otherUUIDs, snapshotDate, isLatestSnapshot } =
    useTemplateRequestState();

  const validateDependencies = useValidateDependencies({
    saveNotification: setNotification,
    saveRepositoryNames: setRepositoryNames,
  });

  // snapshot api
  const snapshotApi = useMemo(() => {
    const toggleLatestSnapshot = (useLatest) => {
      setIsLatestSnapshot(useLatest);
      setSnapshotDate('');
    };

    const chooseSnapshotDate = (val) => {
      const isValid = isDateValid(val);
      if (isValid) {
        setSnapshotDate(val);
      } else {
        setSnapshotDate('');
      }
    };

    return { toggleLatestSnapshot, chooseSnapshotDate };
  }, []);

  // automatically trigger snapshot dependencies validation
  useMemo(() => {
    const allUUIDs = [...otherUUIDs!, ...additionalUUIDs!, ...hardcodedUUIDs!];
    const shouldValidateSnapshots = snapshotDate !== '' && allUUIDs.length !== 0;
    if (shouldValidateSnapshots) {
      validateDependencies(snapshotDate!, allUUIDs);
    }
  }, [snapshotDate!, otherUUIDs, additionalUUIDs, hardcodedUUIDs]);

  // if arch or osversion changed, reset previous notification
  useMemo(() => {
    if (snapshotDate === '' && isLatestSnapshot === false) {
      setNotification('hidden');
      setRepositoryNames([]);
    }
  }, [snapshotDate, isLatestSnapshot]);

  const snapshotsState = useMemo(
    () => ({ snapshotDate: snapshotDate!, isLatestSnapshot: isLatestSnapshot! }),
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
    <SetUpDateApi.Provider value={snapshotApi}>
      <SetUpDateState.Provider value={snapshotsState}>
        <DependencyNotficationState.Provider value={notificationState}>
          {children}
        </DependencyNotficationState.Provider>
      </SetUpDateState.Provider>
    </SetUpDateApi.Provider>
  );
};
