import { useCallback } from 'react';
import { ToggleUseLatestSnapshot } from '../ports';
import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';

export const useToggleUseLatestSnapshot = ({ setNotification }) => {
  const { setSnapshotDate, setIsLatestSnapshot } = useTemplateRequestApi();

  const toggleUseLatestSnapshot: ToggleUseLatestSnapshot = useCallback((useLatest) => {
    setIsLatestSnapshot(useLatest);
    setSnapshotDate('');
    setNotification('hidden');
  }, []);

  return toggleUseLatestSnapshot;
};
