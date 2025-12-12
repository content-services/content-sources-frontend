import { useCallback } from 'react';
import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { ChooseSnapshotDate } from '../ports';
import { isDateValid } from 'helpers';

export const useChooseSnapshotDate = ({ setNotification }) => {
  const { setSnapshotDate } = useTemplateRequestApi();

  const chooseSnapshotDate: ChooseSnapshotDate = useCallback((val) => {
    const isValid = isDateValid(val);
    if (isValid) {
      setSnapshotDate(val);
    } else {
      setSnapshotDate('');
      setNotification('hidden');
    }
  }, []);

  return chooseSnapshotDate;
};
