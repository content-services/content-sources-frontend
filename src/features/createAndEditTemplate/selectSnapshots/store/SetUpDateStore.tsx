import {
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createAndEditTemplate/shared/types/types';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { formatTemplateDate, isDateValid } from 'helpers';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import { ContentListResponse, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery, useGetSnapshotsByDates } from 'services/Content/ContentQueries';

type SetUpDateApiType = {
  isLoading: boolean;
  contentData: Partial<ContentListResponse>;
  hasIsAfter: boolean;
  dateIsValid: boolean;
  isLatestSnapshot: UseLatestSnapshot;
  snapshotDate: UseSnapshotDate;
  toggleLatestSnapshot: (useLatest: UseLatestSnapshot) => void;
  chooseSnapshotDate: (date: UseSnapshotDate) => void;
};

const initialData = {
  isLoading: false,
  contentData: {
    data: [],
    meta: { count: 0, limit: 20, offset: 0 },
  },
  hasIsAfter: false,
  dateIsValid: false,
  snapshotDate: '',
  isLatestSnapshot: false,
  toggleLatestSnapshot: () => {},
  chooseSnapshotDate: () => {},
};

const SetUpDateApi = createContext<SetUpDateApiType>(initialData);
export const useSetUpDateApi = () => useContext(SetUpDateApi);

type SetUpDateStoreType = {
  children: ReactNode;
};

export const SetUpDateStore = ({ children }: SetUpDateStoreType) => {
  const { setSnapshotDate, setIsLatestSnapshot } = useTemplateRequestApi();
  const { hardcodedUUIDs, additionalUUIDs, otherUUIDs, snapshotDate, isLatestSnapshot } =
    useTemplateRequestState();

  const toggleLatestSnapshot = useCallback((useLatest) => {
    setIsLatestSnapshot(useLatest);
    setSnapshotDate('');
  }, []);

  const chooseSnapshotDate = useCallback((val) => {
    const isValid = isDateValid(val);
    if (isValid) {
      setSnapshotDate(val);
    } else {
      setSnapshotDate('');
    }
  }, []);

  const { data, mutateAsync } = useGetSnapshotsByDates(
    [...hardcodedUUIDs!, ...additionalUUIDs!, ...otherUUIDs!],
    formatTemplateDate(snapshotDate!),
  );

  const dateIsValid = useMemo(() => isDateValid(snapshotDate || ''), [snapshotDate]);

  useEffect(() => {
    const allUUIDs = [...otherUUIDs!, ...additionalUUIDs!, ...hardcodedUUIDs!];
    if (snapshotDate && dateIsValid && allUUIDs.length) {
      mutateAsync();
    }
  }, [hardcodedUUIDs, additionalUUIDs, otherUUIDs, snapshotDate]);

  const itemsAfterDate = useMemo(
    () => data?.data?.filter(({ is_after }) => is_after) || [],
    [data?.data],
  );

  const hasIsAfter = itemsAfterDate.length > 0;

  const { isLoading, data: contentData = { data: [], meta: { count: 0, limit: 20, offset: 0 } } } =
    useContentListQuery(
      1,
      100,
      {
        uuids: itemsAfterDate.map(({ repository_uuid }) => repository_uuid),
      },
      '',
      [ContentOrigin.ALL],
    );

  const api = {
    snapshotDate: snapshotDate!,
    isLatestSnapshot: isLatestSnapshot!,
    isLoading,
    contentData,
    hasIsAfter,
    dateIsValid,
    chooseSnapshotDate,
    toggleLatestSnapshot,
  };

  return <SetUpDateApi.Provider value={api}>{children}</SetUpDateApi.Provider>;
};
