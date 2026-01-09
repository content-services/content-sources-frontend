import { useCallback } from 'react';
import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { ToggleAdditionalRepository } from '../ports';

export const useToggleAdditionalRepository = () => {
  const { setAdditionalUUIDs } = useTemplateRequestApi();

  const toggleChecked: ToggleAdditionalRepository = useCallback((clickedUuid) => {
    setAdditionalUUIDs((previous) => {
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
