import { useTemplateRequestApi } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useCallback } from 'react';
import { ToggleSelectedAdditionalRepository } from '../ports';

export const useToggleSelectedRepository = () => {
  const { setAdditionalUUIDs } = useTemplateRequestApi();

  const toggleSelected: ToggleSelectedAdditionalRepository = useCallback((clickedUuid) => {
    setAdditionalUUIDs((previous) => {
      const isInPrevious = previous.includes(clickedUuid);
      if (isInPrevious) {
        return previous.filter((uuid) => uuid !== clickedUuid);
      } else {
        return [...previous, clickedUuid];
      }
    });
  }, []);

  return toggleSelected;
};
