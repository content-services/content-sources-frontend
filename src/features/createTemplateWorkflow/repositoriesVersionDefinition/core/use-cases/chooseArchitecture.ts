import { useCallback } from 'react';

import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';

import { SelectArchitecture } from '../ports';

export const useChooseArchitecture = () => {
  const { setArchitecture } = useTemplateRequestApi();

  const chooseArchitecture: SelectArchitecture = (type) => {
    setArchitecture(type);
  };

  return useCallback(chooseArchitecture, []);
};
