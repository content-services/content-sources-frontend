import useErrorNotification from 'Hooks/useErrorNotification';
import { FetchSnapshotsUntilDate } from '../core/ports';
import { getSnapshotsByDate } from 'services/Content/ContentApi';
import { useMutation } from 'react-query';
import { SnapshotsUntilDateResponse, UUIDsAndDate } from '../core/types';

export const useFetchSnapshotsUntilDate = () => {
  const errorNotifier = useErrorNotification();

  const mutationFn: FetchSnapshotsUntilDate = ({ uuids, date }) => getSnapshotsByDate(uuids, date);

  const options = {
    onError: (err) => {
      errorNotifier('Unable to get snapshot list', 'An error occurred', err, 'content-list-error');
    },
  };

  const { mutateAsync } = useMutation<SnapshotsUntilDateResponse, Error, UUIDsAndDate>(
    mutationFn,
    options,
  );

  return mutateAsync;
};
