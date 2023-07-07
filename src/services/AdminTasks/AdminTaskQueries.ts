import { AlertVariant } from '@patternfly/react-core';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNotification } from '../Notifications/Notifications';
import {
  AdminTaskFilterData,
  AdminTaskListResponse,
  getAdminTasks,
  AdminTask,
  getAdminTask,
} from './AdminTaskApi';

export const ADMIN_TASK_LIST_KEY = 'ADMIN_TASK_LIST_KEY';
export const ADMIN_TASK_KEY = 'ADMIN_TASK_KEY';

const ADMIN_TASK_LIST_POLLING_TIME = 15000; // 15 seconds

export const useAdminTaskListQuery = (
  page: number,
  limit: number,
  filterData: AdminTaskFilterData,
  sortBy: string,
) => {
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  return useQuery<AdminTaskListResponse>(
    [ADMIN_TASK_LIST_KEY, page, limit, sortBy, ...Object.values(filterData)],
    () => getAdminTasks(page, limit, filterData, sortBy),
    {
      onSuccess: (data) => {
        const containsRunning = data?.data?.some(({ status }) => status === 'running');
        if (polling && containsRunning) {
          // Count each consecutive time polling occurs
          setPollCount(pollCount + 1);
        }
        if (polling && !containsRunning) {
          // We were polling, but now the data is valid, we stop the count.
          setPollCount(0);
        }
        if (pollCount > 40) {
          // If polling occurs 40 times in a row, we stop it. Likely a data/kafka issue has occurred with the API.
          return setPolling(false);
        }
        // This sets the polling state based whether the data contains any "Running" status
        return setPolling(containsRunning);
      },
      onError: () => {
        setPolling(false);
        setPollCount(0);
      },
      refetchInterval: polling ? ADMIN_TASK_LIST_POLLING_TIME : undefined,
      refetchIntervalInBackground: false, // This prevents endless polling when our app isn't the focus tab in a browser
      refetchOnWindowFocus: polling, // If polling and navigate to another tab, on refocus, we want to poll once more. (This is based off of the stalestime below)
      keepPreviousData: true,
      staleTime: 20000,
    },
  );
};

export const useFetchAdminTaskQuery = (uuid?: string, status?: AdminTask['status']) => {
  const { notify } = useNotification();

  return useQuery<AdminTask>(
    [ADMIN_TASK_KEY, uuid, status],
    () => getAdminTask(uuid as string), // Will be disabled if undefined
    {
      onError(err) {
        const { data } = err as { data: { message: string | undefined } | string };
        const description = typeof data === 'string' ? data : data?.message;
        notify({
          variant: AlertVariant.danger,
          title: 'Error fetching admin task from UUID',
          description,
        });
      },
      enabled: !!uuid,
      keepPreviousData: true,
      staleTime: 20000,
    },
  );
};
