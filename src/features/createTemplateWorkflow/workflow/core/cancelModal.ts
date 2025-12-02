import useRootPath from 'Hooks/useRootPath';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { TEMPLATES_ROUTE } from 'Routes/constants';

export const useCancelModal = () => {
  const navigate = useNavigate();
  const rootPath = useRootPath();

  const cancelModal = useCallback(() => navigate(`${rootPath}/${TEMPLATES_ROUTE}`), []);

  return cancelModal;
};
