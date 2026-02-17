import useRootPath from 'Hooks/useRootPath';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';
import { useNavigate } from 'react-router-dom';
import { useFetchTemplate } from 'services/Templates/TemplateQueries';
import { GetTemplate } from '../core/ports';
import { FullTemplate } from 'features/createAndEditTemplate/shared/types/types.template.full';

export const useGetTemplate: GetTemplate = () => {
  const navigate = useNavigate();
  const rootPath = useRootPath();

  // extract uuid
  const uuid = useSafeUUIDParam('templateUUID');

  // get template data
  const { data, isError } = useFetchTemplate(uuid, !!uuid);

  if (isError) navigate(rootPath);

  return { template: data as FullTemplate, uuid };
};
