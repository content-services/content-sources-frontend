import useRootPath from 'Hooks/useRootPath';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';
import { createContext, ReactNode, useContext, useLayoutEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchTemplate } from 'services/Templates/TemplateQueries';
import { useInitializeEditTemplateState } from '../core/initializeEditTemplateState';
import { TemplateUUID } from 'features/createAndEditTemplate/shared/types/types';

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
  const navigate = useNavigate();
  const rootPath = useRootPath();

  // extract uuid
  const uuid = useSafeUUIDParam('templateUUID');

  // getTemplate
  const { data: editTemplateData, isError } = useFetchTemplate(uuid!, !!uuid);

  const { initializeEditTemplateState } = useInitializeEditTemplateState();

  // populate template request
  useLayoutEffect(() => {
    if (editTemplateData !== undefined) {
      initializeEditTemplateState(editTemplateData);
    }
  }, [editTemplateData]);

  const templateUUID = useMemo(() => {
    const isEditTemplate = uuid !== '';
    return { uuid, isEditTemplate };
  }, [uuid]);

  if (isError) navigate(rootPath);

  return <EditTemplateState.Provider value={templateUUID}>{children}</EditTemplateState.Provider>;
};
