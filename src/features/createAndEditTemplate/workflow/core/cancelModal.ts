import useRootPath from 'Hooks/useRootPath';
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TEMPLATES_ROUTE } from 'Routes/constants';
import { useAddTemplateContext } from '../store/AddTemplateContext';

export const useOnCancelModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rootPath = useRootPath();

  const { isEdit, editUUID } = useAddTemplateContext();

  // Store the original 'from' value on mount (before step navigation changes location.state)
  const fromRef = useRef(location.state?.from);

  const onCancel = useCallback(() => {
    if (fromRef.current === 'table') {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    } else if (isEdit && editUUID) {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}/${editUUID}`);
    } else {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    }
  }, [isEdit, editUUID]);

  return onCancel;
};
