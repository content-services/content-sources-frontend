import useRootPath from 'Hooks/useRootPath';
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TEMPLATES_ROUTE } from 'Routes/constants';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';

export const useOnCancelModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rootPath = useRootPath();

  const { uuid, isEditTemplate } = useEditTemplateState();

  // Store the original 'from' value on mount (before step navigation changes location.state)
  const fromRef = useRef(location.state?.from);

  const onCancel = useCallback(() => {
    if (fromRef.current === 'table') {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    } else if (isEditTemplate && uuid) {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}/${uuid}`);
    } else {
      navigate(`${rootPath}/${TEMPLATES_ROUTE}`);
    }
  }, [isEditTemplate, uuid]);

  return onCancel;
};
