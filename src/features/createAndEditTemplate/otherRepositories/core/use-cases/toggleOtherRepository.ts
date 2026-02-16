import { useTemplateRequestApi } from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useCallback } from 'react';
import { ToggleSelectedOtherRepository } from '../ports';

export const useToggleOtherRepository = () => {
  const { setOtherUUIDs } = useTemplateRequestApi();

  const toggleSelected: ToggleSelectedOtherRepository = useCallback((clickedUuid: string) => {
    setOtherUUIDs((previous) => {
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
