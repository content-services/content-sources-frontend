import useErrorNotification from 'Hooks/useErrorNotification';
import { useMutation } from 'react-query';
import { getSnapshotsByDate } from 'services/Content/ContentApi';

export const useFetchSnapshotsByDates = () => {
  const errorNotifier = useErrorNotification();

  const mutationFn = ({ uuids, date }) => getSnapshotsByDate(uuids, date);

  const options = {
    onError: (err) => {
      errorNotifier('Unable to get snapshot list', 'An error occurred', err, 'content-list-error');
    },
  };

  const mutation = useMutation(mutationFn, options);

  return mutation.mutateAsync;
};
