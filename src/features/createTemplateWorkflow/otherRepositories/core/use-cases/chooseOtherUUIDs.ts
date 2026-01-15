import { useCallback } from 'react';
import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { ToggleOtherRepository } from '../ports';

export const useToggleOtherRepository = () => {
  const { setOtherUUIDs } = useTemplateRequestApi();

  const toggleChecked: ToggleOtherRepository = useCallback((clickedUuid: string) => {
    setOtherUUIDs((previous) => {
      const isInPrevious = previous.includes(clickedUuid);
      if (isInPrevious) {
        return previous.filter((uuid) => uuid !== clickedUuid);
      } else {
        return [...previous, clickedUuid];
      }
    });
  }, []);

  return toggleChecked;
};
