import { createContext, ReactNode, useContext, useLayoutEffect, useMemo } from 'react';
import { useInitializeEditTemplateState } from '../core/use-cases/initializeEditTemplateState';
import { TemplateUUID } from 'features/createAndEditTemplate/shared/types/types';
import { useGetTemplate } from '../api/useGetTemplate';

type EditTemplateState = {
  uuid: TemplateUUID;
  isEditTemplate: boolean;
};

type EditTemplateStoreType = {
  children: ReactNode;
};

const initialEditTemplateState = {
  uuid: '',
  isEditTemplate: false,
};

const EditTemplateState = createContext<EditTemplateState>(initialEditTemplateState);
export const useEditTemplateState = () => useContext(EditTemplateState);

export const EditTemplateStore = ({ children }: EditTemplateStoreType) => {
  const { template, uuid } = useGetTemplate();
  const { initializeEditTemplateState } = useInitializeEditTemplateState();

  // populate TemplateStore
  useLayoutEffect(() => {
    if (template !== undefined) {
      initializeEditTemplateState(template);
    }
  }, [template]);

  const templateUUID = useMemo(() => {
    const isEditTemplate = uuid !== '';
    return { uuid, isEditTemplate };
  }, [uuid]);

  return <EditTemplateState.Provider value={templateUUID}>{children}</EditTemplateState.Provider>;
};
