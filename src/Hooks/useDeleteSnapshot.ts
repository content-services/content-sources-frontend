import { useAppContext } from 'middleware/AppContext';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DELETE_ROUTE } from 'Routes/constants';

export const useDeleteSnapshot = ({ selectedRows, count, isLoadingOrZeroCount }) => {
  const { rbac } = useAppContext();
  const navigate = useNavigate();

  const deleteButtonLabel = useMemo(() => {
    if (!selectedRows.length || !rbac?.repoWrite) return 'Delete selected snapshots';
    if (selectedRows.length === count) return "Can't delete all snapshots";
    return `Delete ${selectedRows.length} snapshots`;
  }, [selectedRows.length, count, rbac?.repoWrite]);

  const navigateOnDeleteClick = useCallback(() => navigate(DELETE_ROUTE), []);

  const isDeleteDisabled =
    isLoadingOrZeroCount || !selectedRows.length || selectedRows.length === count;

  return { deleteButtonLabel, navigateOnDeleteClick, isDeleteDisabled };
};
