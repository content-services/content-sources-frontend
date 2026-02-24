import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { formatDateForPicker, formatTemplateDate, isDateValid } from 'helpers';
import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import { ContentListResponse, ContentOrigin } from 'services/Content/ContentApi';
import { useContentListQuery, useGetSnapshotsByDates } from 'services/Content/ContentQueries';
import { TemplateRequest } from 'services/Templates/TemplateApi';

type SetUpDateApiType = {
  templateRequest: Partial<TemplateRequest>;
  isLoading: boolean;
  contentData: Partial<ContentListResponse>;
  hasIsAfter: boolean;
  dateIsValid: boolean;
  setTemplateRequest: (value: React.SetStateAction<Partial<TemplateRequest>>) => void;
};

const initialData = {
  templateRequest: {},
  isLoading: false,
  contentData: {
    data: [],
    meta: { count: 0, limit: 20, offset: 0 },
  },
  hasIsAfter: false,
  dateIsValid: false,
  setTemplateRequest: () => {},
};

const SetUpDateApi = createContext<SetUpDateApiType>(initialData);
export const useSetUpDateApi = () => useContext(SetUpDateApi);

type SetUpDateStoreType = {
  children: ReactNode;
};

export const SetUpDateStore = ({ children }: SetUpDateStoreType) => {
  const { templateRequest, setTemplateRequest, selectedRedhatRepos, selectedCustomRepos } =
    useAddTemplateContext();

  const { data, mutateAsync } = useGetSnapshotsByDates(
    [...selectedRedhatRepos, ...selectedCustomRepos],
    formatTemplateDate(templateRequest?.date || ''),
  );

  useEffect(() => {
    setTemplateRequest({
      ...templateRequest,
      date: templateRequest.date ? formatDateForPicker(templateRequest.date) : '',
    });
  }, [templateRequest.date]);

  const dateIsValid = useMemo(
    () => isDateValid(templateRequest?.date || ''),
    [templateRequest?.date],
  );

  useEffect(() => {
    if (
      templateRequest?.date &&
      dateIsValid &&
      [...selectedRedhatRepos, ...selectedCustomRepos].length
    ) {
      mutateAsync();
    }
  }, [selectedRedhatRepos.size, selectedCustomRepos.size, templateRequest?.date]);

  const itemsAfterDate = useMemo(
    () => data?.data?.filter(({ is_after }) => is_after) || [],
    [data?.data],
  );

  const hasIsAfter = itemsAfterDate.length > 0;

  const { isLoading, data: contentData = { data: [], meta: { count: 0, limit: 20, offset: 0 } } } =
    useContentListQuery(
      1,
      100,
      {
        uuids: itemsAfterDate.map(({ repository_uuid }) => repository_uuid),
      },
      '',
      [ContentOrigin.ALL],
    );

  const api = {
    templateRequest,
    isLoading,
    contentData,
    hasIsAfter,
    dateIsValid,
    setTemplateRequest,
  };

  return <SetUpDateApi.Provider value={api}>{children}</SetUpDateApi.Provider>;
};
