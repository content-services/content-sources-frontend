import { useAppContext } from 'middleware/AppContext';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DELETE_ROUTE } from 'Routes/constants';
import { SnapshotItem } from 'services/Content/ContentApi';
import {
  canModifySnapshots,
  getDeleteActionState,
  isSnapshotEffectivelyPublished,
} from './snapshotActionRules';

export const useDeleteSnapshot = ({
  selectedRows,
  snapshotsList,
  count,
  isLoadingOrZeroCount,
  snapshotsReadOnly,
}: {
  selectedRows: { id: string }[];
  snapshotsList: SnapshotItem[];
  count: number;
  isLoadingOrZeroCount: boolean;
  snapshotsReadOnly: boolean;
}) => {
  const { rbac } = useAppContext();
  const navigate = useNavigate();

  const canModify = canModifySnapshots({ snapshotsReadOnly, rbacWrite: !!rbac?.repoWrite });

  const selectedSnapshots = useMemo(() => {
    const selectedIds = new Set(selectedRows.map((row) => row.id));
    return snapshotsList.filter((snapshot) => selectedIds.has(snapshot.uuid));
  }, [selectedRows, snapshotsList]);

  const isAnySelectedPublished = useMemo(
    () =>
      selectedSnapshots.some((snapshot) =>
        isSnapshotEffectivelyPublished({
          published: snapshot.published,
          taskStatus: snapshot.publish_task?.status,
        }),
      ),
    [selectedSnapshots],
  );

  const hasAnySelectedInProgressTask = useMemo(
    () =>
      selectedSnapshots.some(
        (snapshot) =>
          snapshot.publish_task?.status === 'pending' ||
          snapshot.publish_task?.status === 'running',
      ),
    [selectedSnapshots],
  );

  const deleteButtonLabel = useMemo(() => {
    if (!selectedRows.length || !rbac?.repoWrite) return 'Delete selected snapshots';
    if (selectedRows.length === count && count === 1) return "Can't delete last snapshot";
    if (selectedRows.length === count && count >= 1) return "Can't delete all snapshots";
    return `Delete ${selectedRows.length} ${selectedRows.length === 1 ? 'snapshot' : 'snapshots'}`;
  }, [selectedRows.length, count, rbac?.repoWrite]);

  const navigateOnDeleteClick = useCallback(() => navigate(DELETE_ROUTE), [navigate]);

  const deleteState = getDeleteActionState({
    canModify,
    isPublished: isAnySelectedPublished,
    hasInProgressTask: hasAnySelectedInProgressTask,
    targetCount: selectedRows.length,
    totalCount: count,
  });

  const isDeleteDisabled = isLoadingOrZeroCount || !selectedRows.length || deleteState.isDisabled;

  return {
    deleteButtonLabel,
    navigateOnDeleteClick,
    isDeleteDisabled,
    deleteTooltip: !selectedRows.length ? undefined : deleteState.tooltip,
  };
};
