import { useCallback } from 'react';

import { useTemplateRequestApi } from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';

import { SelectOSVersion } from '../ports';

export const useChooseOSVersion = () => {
  const { setOSVersion } = useTemplateRequestApi();

  const chooseOSVersion: SelectOSVersion = (type) => {
    setOSVersion(type);
  };

  return useCallback(chooseOSVersion, []);
};
