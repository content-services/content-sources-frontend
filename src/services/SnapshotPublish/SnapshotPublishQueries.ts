import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertVariant } from '@patternfly/react-core';
import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';
import {
  CONTENT_ITEM_KEY,
  CONTENT_LIST_KEY,
  LIST_SNAPSHOTS_KEY,
} from 'services/Content/ContentQueries';
import { publishSnapshot } from './SnapshotPublishApi';

export type PublishSnapshotParams = {
  repoUUID: string;
  snapshotUUID: string;
  published: boolean;
};

export const usePublishSnapshotMutate = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  return useMutation({
    mutationFn: ({ repoUUID, snapshotUUID, published }: PublishSnapshotParams) =>
      publishSnapshot(repoUUID, snapshotUUID, published),
    onSuccess: (_data, { published }) => {
      const action = published ? 'publishing' : 'unpublishing';
      notify({
        variant: AlertVariant.success,
        title: `Snapshot ${action} has started successfully`,
      });

      queryClient.invalidateQueries({ queryKey: [LIST_SNAPSHOTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_LIST_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTENT_ITEM_KEY] });
    },
    onError: (err, { published }) => {
      const action = published ? 'publishing' : 'unpublishing';
      errorNotifier(`Error ${action} snapshot`, 'An error occurred', err, 'publish-snapshot-error');
    },
  });
};
