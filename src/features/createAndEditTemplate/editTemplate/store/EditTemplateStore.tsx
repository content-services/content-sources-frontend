import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import useRootPath from 'Hooks/useRootPath';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';
import { useFetchTemplate } from 'services/Templates/TemplateQueries';

type TemplateUUID = string;

const initialEditTemplateState = {
  uuid: '',
  isEditTemplate: false,
};
type EditTemplateState = {
  uuid: TemplateUUID;
  isEditTemplate: boolean;
};

const EditTemplateState = createContext<EditTemplateState>(initialEditTemplateState);
export const useEditTemplateState = () => useContext(EditTemplateState);

type EditTemplateStoreType = {
  children: ReactNode;
};

export const EditTemplateStore = ({ children }: EditTemplateStoreType) => {
  const {
    setTemplateRequest,
    setSelectedRedhatRepos,
    setSelectedCustomRepos,
    selectedRedhatRepos,
  } = useAddTemplateContext();

  const uuid = useSafeUUIDParam('templateUUID');

  // getTemplate
  const { data: editTemplateData, isError } = useFetchTemplate(uuid!, !!uuid);

  const navigate = useNavigate();
  const rootPath = useRootPath();

  // fetch all repositories
  const { data: existingRepositoryInformation, isLoading } = useContentListQuery(
    1,
    10,
    { uuids: editTemplateData?.repository_uuids },
    '',
    [ContentOrigin.ALL],
    !!uuid && !!editTemplateData?.repository_uuids.length,
  );

  if (isError) navigate(rootPath);

  // If editing, we want to load in the current data
  useEffect(() => {
    if (uuid && !!editTemplateData && !isLoading && !!existingRepositoryInformation) {
      const startingState = {
        ...editTemplateData,
      };

      setTemplateRequest(startingState);
      const redHatReposToAdd: string[] = [];
      const customReposToAdd: string[] = [];

      existingRepositoryInformation?.data.forEach((item) => {
        if (item.org_id === '-1') {
          redHatReposToAdd.push(item.uuid);
        } else {
          customReposToAdd.push(item.uuid);
        }
      });

      if (redHatReposToAdd.length) {
        setSelectedRedhatRepos(new Set([...selectedRedhatRepos, ...redHatReposToAdd]));
      }

      if (customReposToAdd.length) {
        setSelectedCustomRepos(new Set(customReposToAdd));
      }
    }
  }, [editTemplateData, isLoading, existingRepositoryInformation]);

  const templateUUID = useMemo(() => {
    const isEditTemplate = uuid !== '';
    return { uuid, isEditTemplate };
  }, [uuid]);

  return <EditTemplateState.Provider value={templateUUID}>{children}</EditTemplateState.Provider>;
};
