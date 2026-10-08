import { useAppContext } from 'middleware/AppContext';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PUBLISH_ROUTE } from 'Routes/constants';
import { ContentOrigin, SnapshotItem } from 'services/Content/ContentApi';
import { useFetchContent } from 'services/Content/ContentQueries';

export const useIsSnapshotType = (repoUUID: string) => {
  const { features } = useAppContext();
  const { data: repository, isError } = useFetchContent(repoUUID);
  const isSnapshotsReadOnly =
    repository?.origin === ContentOrigin.REDHAT || repository?.origin === ContentOrigin.COMMUNITY;
  const isPartnerRepo = !!repository?.partner;
  const canPublish =
    isPartnerRepo &&
    !!features?.adminpartnerrepositories?.enabled &&
    !!features?.adminpartnerrepositories?.accessible;

  return {
    isSnapshotsReadOnly,
    isPartnerRepo,
    canPublish,
    repositoryName: repository?.name,
    isError,
  };
};

export const useRepositoryPublishSnapshotPolling = ({ repositoryList, setPublishPolling }) => {
  // Derive publish polling from repository server data — any repo with an in-progress publish task triggers polling
  useEffect(() => {
    const hasPublishing = repositoryList?.data?.some(
      (item) =>
        item.snapshot_publish_state?.publishing || item.snapshot_publish_state?.unpublishing,
    );
    setPublishPolling(!!hasPublishing);
  }, [repositoryList?.data]);
};

export const usePublishSnapshotPolling = (snapshotsList, setIsPublishPolling) => {
  // Derive polling state from snapshot data: any snapshot with an in-progress publish task
  useEffect(() => {
    const hasInProgress = snapshotsList.some(
      (s) => s.publish_task?.status === 'pending' || s.publish_task?.status === 'running',
    );
    setIsPublishPolling(hasInProgress);
  }, [snapshotsList]);
};

export const usePublishSnapshotState = () => {
  const getSnapshotPublishState = useCallback(
    (snapshot: SnapshotItem | undefined): 'published' | 'publishing' | 'unpublishing' | 'none' => {
      if (!snapshot) return 'none';
      const taskStatus = snapshot.publish_task?.status;
      if (taskStatus === 'pending' || taskStatus === 'running') {
        return snapshot.published ? 'publishing' : 'unpublishing';
      }
      if (snapshot.published && taskStatus === 'completed') return 'published';
      return 'none';
    },
    [],
  );

  return { getSnapshotPublishState };
};

// Determine publish state for a snapshot
export const usePublishSnapshotApi = ({ selectedRows, snapshotsList, canPublish = true }) => {
  const navigate = useNavigate();

  // Resolve the single selected snapshot (if exactly one is selected)
  const selectedSnapshot = useMemo(() => {
    if (selectedRows.length !== 1) return undefined;
    const selectedId = (selectedRows[0] as { id: string })?.id;
    return snapshotsList.find((s) => s.uuid === selectedId);
  }, [selectedRows, snapshotsList]);

  // Determine if the selected snapshot can be published/unpublished
  const isPublishDisabled = useMemo(() => {
    if (!canPublish) return true;
    if (selectedRows.length !== 1) return true;
    if (!selectedSnapshot) return true;
    const packageCount = selectedSnapshot.content_counts?.['rpm.package'] || 0;
    const taskStatus = selectedSnapshot.publish_task?.status;
    if (packageCount === 0) return true;
    if (taskStatus === 'pending' || taskStatus === 'running') return true;
    if (!selectedSnapshot.published && !selectedSnapshot.content_counts?.['rpm.package'])
      return true;
    return false;
  }, [selectedRows, selectedSnapshot, canPublish]);

  const publishButtonLabel = useMemo(() => {
    if (!canPublish) return 'Repository must be a partner repository to publish';
    const packageCount = selectedSnapshot?.content_counts?.['rpm.package'] || 0;
    if (selectedRows.length > 1) return 'Can publish one snapshot at a time';
    if (!selectedSnapshot) return 'Publish snapshot';
    if (selectedSnapshot.published) return 'Unpublish snapshot';
    if (packageCount === 0) return 'Cannot publish snapshot with 0 packages';
    return 'Publish snapshot';
  }, [selectedRows.length, selectedSnapshot, canPublish]);

  const onPublishClick = useCallback(() => {
    if (selectedRows.length === 1 && selectedSnapshot) {
      const selectedId = selectedSnapshot.uuid;
      const route = selectedSnapshot.published
        ? `${PUBLISH_ROUTE}?snapshotUUID=${selectedId}&action=unpublish`
        : `${PUBLISH_ROUTE}?snapshotUUID=${selectedId}`;
      navigate(route);
    }
  }, [selectedRows, selectedSnapshot, navigate]);

  return { onPublishClick, publishButtonLabel, isPublishDisabled };
};
